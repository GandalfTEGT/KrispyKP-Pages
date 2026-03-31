import fs from "node:fs/promises";
import { VIDEO_PLAYLISTS } from "../data/video-playlists.config.mjs";

const API_KEY = process.env.YOUTUBE_API_KEY;

async function fetchPlaylistItems(playlistId) {
  let items = [];
  let pageToken = "";

  do {
    const url = new URL("https://www.googleapis.com/youtube/v3/playlistItems");
    url.searchParams.set("part", "snippet,contentDetails,status");
    url.searchParams.set("maxResults", "50");
    url.searchParams.set("playlistId", playlistId);
    url.searchParams.set("key", API_KEY);
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`YouTube API error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();

    items.push(
      ...(data.items || []).map(item => ({
        playlistItemId: item.id || "",
        videoId: item?.snippet?.resourceId?.videoId || "",
        title: item?.snippet?.title || "",
        description: item?.snippet?.description || "",
        playlistAddedAt: item?.snippet?.publishedAt || "",
        videoPublishedAt: item?.contentDetails?.videoPublishedAt || "",
        thumbnail:
          item?.snippet?.thumbnails?.maxres?.url ||
          item?.snippet?.thumbnails?.high?.url ||
          item?.snippet?.thumbnails?.medium?.url ||
          item?.snippet?.thumbnails?.default?.url ||
          "",
        position: Number.isFinite(item?.snippet?.position) ? item.snippet.position : 999999,
        playlistItemStatus: item?.status?.privacyStatus || ""
      }))
    );

    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return items;
}

async function fetchVideoDetails(videoIds) {
  const results = new Map();

  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50).filter(Boolean);
    if (!chunk.length) continue;

    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "contentDetails,status");
    url.searchParams.set("id", chunk.join(","));
    url.searchParams.set("key", API_KEY);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`YouTube videos.list error ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();

    for (const item of data.items || []) {
      results.set(item.id, {
        duration: item?.contentDetails?.duration || "",
        privacyStatus: item?.status?.privacyStatus || ""
      });
    }
  }

  return results;
}

function dedupeByVideoId(items) {
  const seen = new Set();
  return items.filter(item => {
    if (!item?.videoId || seen.has(item.videoId)) return false;
    seen.add(item.videoId);
    return true;
  });
}

function isVisiblePlaylistItem(item, detailsMap) {
  if (!item?.videoId) return false;

  const title = String(item.title || "").toLowerCase();
  if (!title) return false;
  if (title === "deleted video" || title === "private video") return false;

  const details = detailsMap.get(item.videoId);
  if (!details) return false;
  if (details.privacyStatus && details.privacyStatus !== "public") return false;

  return true;
}

async function build() {
  const categories = [];

  for (const category of VIDEO_PLAYLISTS) {
    if (category.type === "latest") continue;

    const subTabs = [];

    for (const tab of category.subTabs || []) {
      const rawItems = await fetchPlaylistItems(tab.playlistId);
      const videoIds = dedupeByVideoId(rawItems).map(item => item.videoId);
      const detailsMap = await fetchVideoDetails(videoIds);

      const items = rawItems
        .filter(item => isVisiblePlaylistItem(item, detailsMap))
        .map(item => {
          const details = detailsMap.get(item.videoId) || {};
          return {
            videoId: item.videoId,
            title: item.title || "Untitled Video",
            description: item.description || "",
            playlistAddedAt: item.playlistAddedAt || "",
            videoPublishedAt: item.videoPublishedAt || "",
            publishedAt: item.playlistAddedAt || item.videoPublishedAt || "",
            thumbnail: item.thumbnail || "",
            position: item.position,
            duration: details.duration || "",
            playlistItemStatus: item.playlistItemStatus || ""
          };
        })
        .sort((a, b) => a.position - b.position);

      subTabs.push({
        id: tab.id,
        title: tab.title,
        playlistId: tab.playlistId,
        items
      });
    }

    const latest = dedupeByVideoId(
      subTabs.flatMap(tab => tab.items)
    )
      .sort((a, b) => {
        const aTime = Date.parse(a.playlistAddedAt || 0) || 0;
        const bTime = Date.parse(b.playlistAddedAt || 0) || 0;
        return bTime - aTime;
      })
      .slice(0, 12);

    categories.push({
      id: category.id,
      title: category.title,
      featuredVideoId: category.featuredVideoId || "",
      latestCount: 12,
      latest,
      subTabs
    });
  }

  const latestCategory = {
    id: "latest",
    title: "Latest Videos",
    featuredVideoId: "W7Q9PdkNQD8",
    latestCount: 16,
    latest: dedupeByVideoId(
      categories.flatMap(category => category.latest || [])
    )
      .sort((a, b) => {
        const aTime = Date.parse(a.playlistAddedAt || 0) || 0;
        const bTime = Date.parse(b.playlistAddedAt || 0) || 0;
        return bTime - aTime;
      })
      .slice(0, 16),
    subTabs: []
  };

  const finalData = {
    featured: {
      videoId: "W7Q9PdkNQD8",
      title: "Featured Video"
    },
    categories: [latestCategory, ...categories],
    pageSize: 8
  };

  await fs.writeFile(
    "data/videos.generated.js",
    `window.KRISPY_VIDEO_DATA = ${JSON.stringify(finalData, null, 2)};\n`,
    "utf8"
  );
}

build().catch(err => {
  console.error(err);
  process.exit(1);
});
