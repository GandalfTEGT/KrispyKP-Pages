"""Verify all configured rules PDFs against public identity/rules and provenance boundaries."""
import json
import re
import subprocess
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
config = json.loads(subprocess.check_output(
    ["node", str(ROOT / "tools/export-tournament-config.mjs"), str(ROOT / "data/tournaments.config.js"), "--all"],
    encoding="utf-8", cwd=ROOT,
))
normalise = lambda value: re.sub(r"\s+", " ", str(value)).strip()
report = []
for event in config["events"]:
    filename = ROOT / event["rulesUrl"].lstrip("/")
    with pdfplumber.open(filename) as document:
        # Exclude repeated page furniture when matching paragraphs split across pages.
        pages = [page.crop((0, 45, page.width, page.height - 45)).extract_text() or "" for page in document.pages]
    text = normalise(" ".join(pages))
    if event.get("resultsScope") == "round-robin":
        assert normalise(event["description"]) in text, f"{event['id']}: round-robin/unknown-overall-outcome explanation missing"
        assert "VERIFIED:" not in text and "SUPPORTED:" not in text and "UNKNOWN:" not in text, f"{event['id']}: internal classification leaked"
    assert not re.search(r"screenshot evidence|reconstructed from screenshot|owner(?:-supplied historical)? recollection|uncertain source note|internal confidence note", text, re.I), f"{event['id']}: public evidence leak"
    for index, player in enumerate(event["players"], 1):
        assert normalise(f"#{index} {player['name']}") in text, f"{event['id']}: canonical name missing: {player['name']}"
        if player.get("inGameName"):
            assert normalise(f"In-game: {player['inGameName']}") in text, f"{event['id']}: alias missing: {player['inGameName']}"
    for section in event["rules"]["sections"]:
        for paragraph in section.get("paragraphs", []) + section.get("bullets", []):
            assert normalise(paragraph) in text, f"{event['id']}: authored rule text missing"
    for map_name in event["rules"]["mapPool"]:
        assert normalise(map_name) in text, f"{event['id']}: map missing"
    assert normalise(event["rules"]["questions"]) in text, f"{event['id']}: public contact guidance missing"
    for group in event["manualBracketGroups"]:
        for round_data in group["rounds"]:
            for match in round_data["matches"]:
                if match.get("provenance"):
                    assert normalise(match["provenance"]) not in text, f"{event['id']}: provenance leaked"
    report.append({"eventId": event["id"], "file": event["rulesUrl"], "pages": len(pages), "players": len(event["players"]), "status": "PASS"})
destination = ROOT / ".validation/tournament-rules.json"
destination.parent.mkdir(parents=True, exist_ok=True)
destination.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
print(f"PDF PASS: {len(report)} documents, {sum(item['pages'] for item in report)} pages; canonical names, labelled Unicode aliases, authored rules/maps/contact and provenance omission.")
