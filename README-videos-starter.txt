Starter videos page for curated playlist-based site sections.

What this includes:
- Top featured video player
- Top-level category tabs
- Sub-tabs per game/category
- Latest videos area for the active top-level category
- Playlist selection grid with pagination
- Smooth scroll back to top when a user selects a video

Important note:
With only playlist URLs and no YouTube API sync yet, the sub-tabs are connected structurally
but their items arrays are empty. The page is ready now, and later you can either:
1. manually add videos to each sub-tab's items array in data/videos.js
2. auto-generate data/videos.js from the YouTube Data API

How to add another top-level category:
- add another object to window.KRISPY_VIDEO_DATA.categories

How to add another sub-tab:
- add another object inside a category's subTabs array

How to add actual videos manually:
Each item inside a subTab should look like:

{
  videoId: "abc123",
  title: "Video Title",
  publishedAt: "2026-03-30T19:00:00Z",
  note: "Optional note",
  tag: "Tiberian Dawn"
}

The system will derive the thumbnail automatically from the videoId.
