import fs from "node:fs/promises";
import { VIDEO_PLAYLISTS } from "../data/video-playlists.config.js";

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
      ...(data.items || [])
        .filter(item => item?.snippet?.resourceId?.videoId)
        .map(item => ({
          videoId: item.snippet.resourceId.videoId,
          title: item.snippet.title || "Untitled Video",
          description: item.snippet.description || "",
          publishedAt: item.contentDetails?.videoPublishedAt || item.snippet.publishedAt || "",
          thumbnail:
            item.snippet.thumbnails?.maxres?.url ||
            item.snippet.thumbnails?.high?.url ||
            item.snippet.thumbnails?.medium?.url ||
            item.snippet.thumbnails?.default?.url ||
            "",
          position: item.snippet.position ?? 0,
          playlistItemStatus: item.status?.privacyStatus || ""
        }))
    );

    pageToken = data.nextPageToken || "";
  } while (pageToken);

  return items;
}

function dedupeByVideoId(items) {
  const seen = new Set();
  return items.filter(item => {
    if (!item?.videoId || seen.has(item.videoId)) return false;
    seen.add(item.videoId);
    return true;
  });
}

async function build() {
  const categories = [];

  for (const category of VIDEO_PLAYLISTS) {
    if (category.type === "latest") continue;

    const subTabs = [];
    for (const tab of category.subTabs || []) {
      const items = await fetchPlaylistItems(tab.playlistId);
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
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 8);

    categories.push({
      id: category.id,
      title: category.title,
      featuredVideoId: category.featuredVideoId || "",
      latest,
      subTabs
    });
  }

  const latestCategory = {
    id: "latest",
    title: "Latest Videos",
    featuredVideoId: "W7Q9PdkNQD8",
    latest: dedupeByVideoId(
      categories.flatMap(category => category.latest || [])
    )
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 12),
    subTabs: []
  };

  const finalData = {
    featured: {
      videoId: "W7Q9PdkNQD8",
      title: "Featured Video",
      note: "Featured by site config."
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