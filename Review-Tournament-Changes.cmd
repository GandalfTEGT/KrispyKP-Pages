@echo off
cd /d "%~dp0"
echo Open http://127.0.0.1:4185/tournaments/ in your browser.
echo Keep this window open during your review.
node tools/serve-review.mjs 4185
pause
