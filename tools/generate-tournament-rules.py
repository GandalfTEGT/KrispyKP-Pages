"""Generate a branded static tournament rules PDF from tournaments.config.js."""

from __future__ import annotations

import argparse
import io
import json
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

from PIL import Image as PillowImage
from reportlab import rl_config
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import (
    Image,
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

rl_config.invariant = 1

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "data" / "tournaments.config.js"
EXPORTER = ROOT / "tools" / "export-tournament-config.mjs"

BG = colors.HexColor("#06090b")
PANEL = colors.HexColor("#0e1619")
LINE = colors.HexColor("#34758a")
CYAN = colors.HexColor("#4fd2ff")
CYAN_SOFT = colors.HexColor("#8be3ff")
TEXT = colors.HexColor("#e7f8ff")
MUTED = colors.HexColor("#93b2bc")


def fail(message: str) -> None:
    raise ValueError(message)


def load_event(event_id: str) -> dict:
    node = shutil.which("node")
    if not node:
        fail("Node.js is required to read data/tournaments.config.js.")
    result = subprocess.run(
        [node, str(EXPORTER), str(CONFIG), event_id],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode:
        fail(result.stderr.strip() or "Unable to export tournament configuration.")
    return json.loads(result.stdout)


def repository_asset(route: str, field: str, required: bool = False) -> Path | None:
    if not route:
        if required:
            fail(f"Tournament field '{field}' is required.")
        return None
    relative = Path(*route.lstrip("/").split("/"))
    candidate = (ROOT / relative).resolve()
    try:
        candidate.relative_to(ROOT.resolve())
    except ValueError:
        fail(f"Tournament field '{field}' must point inside the repository.")
    if required and not candidate.is_file():
        fail(f"Tournament field '{field}' does not resolve to a file: {route}")
    return candidate if candidate.is_file() else None


def validate_event(event: dict) -> tuple[dict, Path, Path | None]:
    for field in ("id", "title", "organizer", "game", "format", "startDate", "rulesUrl"):
        if not str(event.get(field, "")).strip():
            fail(f"Tournament field '{field}' is required for an official rules PDF.")

    rules = event.get("rules")
    if not isinstance(rules, dict):
        fail("Tournament field 'rules' must use the structured rules object for PDF generation.")
    sections = rules.get("sections")
    if not isinstance(sections, list) or not sections:
        fail("Tournament rules must contain at least one section.")
    for index, section in enumerate(sections, 1):
        if not isinstance(section, dict) or not str(section.get("title", "")).strip():
            fail(f"Tournament rule section {index} requires a title.")
        paragraphs = section.get("paragraphs", [])
        bullets = section.get("bullets", [])
        if not isinstance(paragraphs, list) or not isinstance(bullets, list):
            fail(f"Tournament rule section '{section['title']}' requires paragraph/bullet arrays.")
        if not paragraphs and not bullets:
            fail(f"Tournament rule section '{section['title']}' has no content.")
        if not all(isinstance(item, str) and item.strip() for item in paragraphs + bullets):
            fail(f"Tournament rule section '{section['title']}' contains empty or invalid content.")

    maps = rules.get("mapPool")
    if not isinstance(maps, list) or not maps or not all(isinstance(item, str) and item.strip() for item in maps):
        fail("Tournament rules require a non-empty mapPool array.")
    if not isinstance(rules.get("questions"), str) or not rules["questions"].strip():
        fail("Tournament rules require questions/contact guidance.")
    players = event.get("players")
    if not isinstance(players, list) or not any(
        isinstance(player, dict) and isinstance(player.get("name"), str) and player["name"].strip()
        for player in players
    ):
        fail("Tournament requires at least one named participant.")

    output = repository_asset(event["rulesUrl"], "rulesUrl")
    if output is None:
        output = (ROOT / event["rulesUrl"].lstrip("/")).resolve()
        try:
            output.relative_to(ROOT.resolve())
        except ValueError:
            fail("Tournament field 'rulesUrl' must point inside the repository.")
    if output.suffix.lower() != ".pdf":
        fail("Tournament field 'rulesUrl' must end in .pdf.")

    banner_route = str(event.get("bannerImage", "")).strip()
    banner = repository_asset(banner_route, "bannerImage", required=bool(banner_route))
    return rules, output, banner


def display_start(value: str, timezone: str) -> str:
    try:
        parsed = datetime.strptime(value, "%Y-%m-%d %H:%M")
        rendered = parsed.strftime("%d %B %Y - %H:%M")
    except ValueError:
        rendered = value
    return f"{rendered} {timezone}".strip()


def pdf_banner(path: Path) -> io.BytesIO:
    stream = io.BytesIO()
    with PillowImage.open(path) as source:
        source.convert("RGB").save(stream, format="JPEG", quality=85, optimize=False, progressive=False)
    stream.seek(0)
    return stream


def add_numbered_section(story: list, number: int, section: dict, styles: dict) -> None:
    content = [Paragraph(f"{number:02d} // {section['title'].upper()}", styles["heading"])]
    paragraphs = [str(item) for item in section.get("paragraphs", [])]
    bullets = [str(item) for item in section.get("bullets", [])]
    if paragraphs:
        content.append(Paragraph(paragraphs[0], styles["body"]))
        story.append(KeepTogether(content))
        for paragraph in paragraphs[1:]:
            story.append(Paragraph(paragraph, styles["body"]))
    elif bullets:
        content.append(Paragraph(f"- {bullets.pop(0)}", styles["bullet"]))
        story.append(KeepTogether(content))
    for bullet in bullets:
        story.append(Paragraph(f"- {bullet}", styles["bullet"]))


def build_pdf(event: dict, output_override: Path | None = None) -> Path:
    rules, configured_output, banner = validate_event(event)
    output = output_override.resolve() if output_override else configured_output
    output.parent.mkdir(parents=True, exist_ok=True)

    samples = getSampleStyleSheet()
    styles = {
        "title": ParagraphStyle("Title", parent=samples["Title"], fontName="Helvetica-Bold", fontSize=24, leading=27, alignment=TA_CENTER, textColor=TEXT, spaceAfter=2.5 * mm),
        "subtitle": ParagraphStyle("Subtitle", parent=samples["Normal"], fontName="Helvetica-Bold", fontSize=10, leading=13, alignment=TA_CENTER, textColor=CYAN_SOFT, spaceAfter=4 * mm),
        "heading": ParagraphStyle("Heading", parent=samples["Heading2"], fontName="Helvetica-Bold", fontSize=12, leading=15, textColor=CYAN, spaceBefore=4 * mm, spaceAfter=2 * mm, keepWithNext=True),
        "body": ParagraphStyle("Body", parent=samples["BodyText"], fontName="Helvetica", fontSize=9.6, leading=13.5, textColor=TEXT, spaceAfter=2.2 * mm),
        "bullet": ParagraphStyle("Bullet", parent=samples["BodyText"], fontName="Helvetica", fontSize=9.4, leading=13, leftIndent=5 * mm, firstLineIndent=-4 * mm, textColor=TEXT, spaceAfter=1.6 * mm),
        "small": ParagraphStyle("Small", parent=samples["BodyText"], fontName="Helvetica", fontSize=8.2, leading=10.5, textColor=MUTED),
        "callout": ParagraphStyle("Callout", parent=samples["BodyText"], fontName="Helvetica-Bold", fontSize=11, leading=14, alignment=TA_CENTER, textColor=BG),
    }

    logo = repository_asset("/assets/logo.png", "logo", required=True)
    short_title = event["title"].upper()

    def decorate(canvas, doc):
        width, height = A4
        canvas.saveState()
        canvas.setFillColor(BG)
        canvas.rect(0, 0, width, height, fill=1, stroke=0)
        canvas.setStrokeColor(LINE)
        canvas.line(16 * mm, height - 14 * mm, width - 16 * mm, height - 14 * mm)
        canvas.drawImage(str(logo), 16 * mm, height - 12 * mm, 7 * mm, 7 * mm, preserveAspectRatio=True, mask="auto")
        canvas.setFillColor(CYAN_SOFT)
        canvas.setFont("Helvetica-Bold", 7.5)
        canvas.drawString(25 * mm, height - 9.5 * mm, "KRISPYKP // TOURNAMENT RULES")
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 7.2)
        label = short_title
        while stringWidth(label, "Helvetica", 7.2) > 88 * mm and len(label) > 12:
            label = label[:-1]
        if label != short_title:
            label = label.rstrip() + "..."
        canvas.drawRightString(width - 16 * mm, height - 9.5 * mm, label)
        canvas.setStrokeColor(LINE)
        canvas.line(16 * mm, 13 * mm, width - 16 * mm, 13 * mm)
        canvas.setFillColor(MUTED)
        canvas.drawString(16 * mm, 8 * mm, "STATIC RULES ASSET // GENERATED FROM TOURNAMENT CONFIG")
        canvas.drawRightString(width - 16 * mm, 8 * mm, f"PAGE {doc.page}")
        canvas.restoreState()

    document = SimpleDocTemplate(
        str(output), pagesize=A4, leftMargin=16 * mm, rightMargin=16 * mm,
        topMargin=18 * mm, bottomMargin=18 * mm,
        title=f"{event['title']} Rules", author="KrispyKP rules generator",
        subject=f"Official rules for {event['title']}", creator="KrispyKP tournament rules generator",
    )

    story = []
    if banner:
        story.extend([Spacer(1, 2 * mm), Image(pdf_banner(banner), width=178 * mm, height=66.75 * mm), Spacer(1, 4 * mm)])
    story.extend([
        Paragraph(event["title"].upper(), styles["title"]),
        Paragraph((event.get("subtitle") or "OFFICIAL TOURNAMENT RULES").upper(), styles["subtitle"]),
    ])

    info = [
        ["ORGANISER", event["organizer"], "GAME", event["game"]],
        ["FORMAT", event["format"], "START", display_start(event["startDate"], str(event.get("timezone", "")))],
        ["STATUS", str(event.get("status", "")).upper() or "UNSPECIFIED", "PLAYERS", str(len(event.get("players", [])))],
    ]
    table = Table(info, colWidths=[25 * mm, 58 * mm, 20 * mm, 75 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PANEL), ("BOX", (0, 0), (-1, -1), 0.8, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#213b44")),
        ("TEXTCOLOR", (0, 0), (-1, -1), TEXT), ("TEXTCOLOR", (0, 0), (0, -1), CYAN),
        ("TEXTCOLOR", (2, 0), (2, -1), CYAN), ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"), ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTNAME", (3, 0), (3, -1), "Helvetica"), ("FONTSIZE", (0, 0), (-1, -1), 8.2),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("TOPPADDING", (0, 0), (-1, -1), 2.2 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2 * mm), ("LEFTPADDING", (0, 0), (-1, -1), 2.5 * mm),
    ]))
    story.extend([table, Spacer(1, 3 * mm)])

    for index, section in enumerate(rules["sections"], 1):
        add_numbered_section(story, index, section, styles)

    next_number = len(rules["sections"]) + 1
    map_rows = [[str(index), name] for index, name in enumerate(rules["mapPool"], 1)]
    map_table = Table(map_rows, colWidths=[12 * mm, 166 * mm], repeatRows=0)
    map_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#113746")),
        ("BACKGROUND", (1, 0), (1, -1), PANEL), ("TEXTCOLOR", (0, 0), (-1, -1), TEXT),
        ("TEXTCOLOR", (0, 0), (0, -1), CYAN_SOFT), ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9), ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"), ("GRID", (0, 0), (-1, -1), 0.35, LINE),
        ("TOPPADDING", (0, 0), (-1, -1), 1.8 * mm), ("BOTTOMPADDING", (0, 0), (-1, -1), 1.8 * mm),
    ]))
    story.append(KeepTogether([Paragraph(f"{next_number:02d} // MAP POOL", styles["heading"]), map_table]))

    participants = [str(player.get("name", "")).strip() for player in event.get("players", []) if str(player.get("name", "")).strip()]
    story.append(KeepTogether([
        Paragraph(f"{next_number + 1:02d} // PARTICIPANTS", styles["heading"]),
        Paragraph(", ".join(participants) + ".", styles["body"]),
    ]))
    story.append(KeepTogether([
        Paragraph(f"{next_number + 2:02d} // QUESTIONS AND RULINGS", styles["heading"]),
        Paragraph(rules["questions"], styles["body"]),
    ]))
    if rules.get("closing"):
        closing = Table([[Paragraph(str(rules["closing"]), styles["callout"])]], colWidths=[178 * mm])
        closing.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), CYAN), ("BOX", (0, 0), (-1, -1), 0.8, CYAN_SOFT),
            ("TOPPADDING", (0, 0), (-1, -1), 3 * mm), ("BOTTOMPADDING", (0, 0), (-1, -1), 3 * mm),
        ]))
        story.extend([Spacer(1, 4 * mm), closing])

    document.build(story, onFirstPage=decorate, onLaterPages=decorate)
    return output


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("event_id", help="Tournament event ID from data/tournaments.config.js")
    parser.add_argument("--output", type=Path, help="Optional validation output path; default uses rulesUrl")
    parser.add_argument("--validate-only", action="store_true", help="Validate without writing a PDF")
    args = parser.parse_args()
    try:
        event = load_event(args.event_id)
        if args.validate_only:
            validate_event(event)
            print(f"Valid tournament rules configuration: {args.event_id}")
        else:
            output = build_pdf(event, args.output)
            print(f"Generated {output.relative_to(ROOT) if output.is_relative_to(ROOT) else output}")
        return 0
    except (ValueError, json.JSONDecodeError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
