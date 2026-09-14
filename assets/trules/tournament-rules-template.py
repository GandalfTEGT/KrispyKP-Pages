"""Reusable KrispyKP tournament rules PDF template.

Edit the EVENT dictionary, then run this file with Python.
Output filename is controlled by EVENT['output'].
"""

from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.units import mm

EVENT = {
    "title": "TOURNAMENT NAME",
    "subtitle": "OFFICIAL RULES",
    "organizer": "ORGANISER NAME",
    "game": "GAME NAME",
    "format": "Tournament format",
    "start": "Date and time",
    "match_length": "Best of 5 (Bo5)",
    "grand_final": "Best of 7 (Bo7)",
    "format_paragraphs": [
        "Describe the tournament structure here.",
        "Describe match lengths and Grand Final rules here.",
    ],
    "scheduling_paragraphs": [
        "Describe scheduling requirements here.",
    ],
    "hosting_intro": "Describe hosting rules here.",
    "hosting_bullets": [
        "First hosting/map-selection rule.",
        "Spawn-selection rule.",
        "Rotation rule.",
    ],
    "ingame_rules": "Describe in-game restrictions or state that there are none.",
    "maps": ["Map 1", "Map 2", "Map 3"],
    "participants": ["Player 1", "Player 2"],
    "questions": "Questions should be directed to the tournament organiser.",
    "closing": "GOOD LUCK, COMMANDERS.",
    "output": "/mnt/data/tournament-rules.pdf",
}

RED = colors.HexColor("#b51217")
DARK = colors.HexColor("#111315")
LIGHT = colors.HexColor("#ececec")
MUTED = colors.HexColor("#b9b9b9")

styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    "Title", parent=styles["Title"], fontName="Helvetica-Bold",
    fontSize=27, leading=30, alignment=TA_CENTER, textColor=LIGHT,
    spaceAfter=4*mm,
)
subtitle_style = ParagraphStyle(
    "Subtitle", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=13, leading=16, alignment=TA_CENTER, textColor=RED,
    spaceAfter=6*mm,
)
h1 = ParagraphStyle(
    "H1", parent=styles["Heading1"], fontName="Helvetica-Bold",
    fontSize=16, leading=19, textColor=RED,
    spaceBefore=4*mm, spaceAfter=2.5*mm,
)
body = ParagraphStyle(
    "Body", parent=styles["BodyText"], fontName="Helvetica",
    fontSize=10.5, leading=15, textColor=colors.HexColor("#222222"),
    spaceAfter=2.5*mm,
)
bullet = ParagraphStyle(
    "Bullet", parent=body, leftIndent=5*mm, firstLineIndent=-3.5*mm,
    bulletIndent=1.5*mm, spaceAfter=2*mm,
)


def header_footer(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(DARK)
    canvas.rect(0, height - 15*mm, width, 15*mm, fill=1, stroke=0)
    canvas.setFillColor(RED)
    canvas.rect(0, height - 15.8*mm, width, 0.8*mm, fill=1, stroke=0)
    canvas.setFillColor(LIGHT)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(16*mm, height - 9.5*mm, EVENT["title"])
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(width - 16*mm, height - 9.5*mm, f'Hosted by {EVENT["organizer"]}')

    canvas.setStrokeColor(colors.HexColor("#cccccc"))
    canvas.line(16*mm, 13*mm, width - 16*mm, 13*mm)
    canvas.setFillColor(colors.HexColor("#666666"))
    canvas.setFont("Helvetica", 8)
    canvas.drawString(16*mm, 8*mm, "Tournament rules")
    canvas.drawRightString(width - 16*mm, 8*mm, f"Page {doc.page}")
    canvas.restoreState()


def build_pdf():
    output = Path(EVENT["output"])
    doc = SimpleDocTemplate(
        str(output), pagesize=A4,
        rightMargin=16*mm, leftMargin=16*mm,
        topMargin=23*mm, bottomMargin=18*mm,
        title=f'{EVENT["title"]} Rules', author=EVENT["organizer"],
    )

    story = [
        Spacer(1, 4*mm),
        Paragraph(EVENT["title"], title_style),
        Paragraph(EVENT["subtitle"], subtitle_style),
    ]

    info = [
        ["HOST / ORGANISER", EVENT["organizer"]],
        ["GAME", EVENT["game"]],
        ["FORMAT", EVENT["format"]],
        ["START", EVENT["start"]],
        ["MATCH LENGTH", EVENT["match_length"]],
        ["GRAND FINAL", EVENT["grand_final"]],
    ]
    table = Table(info, colWidths=[48*mm, 125*mm], hAlign="CENTER")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), DARK),
        ("TEXTCOLOR", (0, 0), (0, -1), LIGHT),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ROWBACKGROUNDS", (1, 0), (1, -1), [colors.HexColor("#f3f3f3"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#c9c9c9")),
        ("LEFTPADDING", (0, 0), (-1, -1), 3*mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3*mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2.2*mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2*mm),
    ]))
    story += [table, Spacer(1, 5*mm)]

    story.append(Paragraph("1. Tournament format", h1))
    for paragraph in EVENT["format_paragraphs"]:
        story.append(Paragraph(paragraph, body))

    story.append(Paragraph("2. Match scheduling", h1))
    for paragraph in EVENT["scheduling_paragraphs"]:
        story.append(Paragraph(paragraph, body))

    story += [
        Paragraph("3. Hosting, map selection and spawns", h1),
        Paragraph(EVENT["hosting_intro"], body),
    ]
    for item in EVENT["hosting_bullets"]:
        story.append(Paragraph(f"• {item}", bullet))

    story += [
        Paragraph("4. In-game rules", h1),
        Paragraph(EVENT["ingame_rules"], body),
        Paragraph("5. Map pool", h1),
    ]

    map_table = Table([[str(i + 1), m] for i, m in enumerate(EVENT["maps"])], colWidths=[12*mm, 155*mm])
    map_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), RED),
        ("TEXTCOLOR", (0, 0), (0, -1), colors.white),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (1, 0), (1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("ROWBACKGROUNDS", (1, 0), (1, -1), [colors.HexColor("#f3f3f3"), colors.white]),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#c9c9c9")),
        ("ALIGN", (0, 0), (0, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 2.2*mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2*mm),
    ]))
    story.append(map_table)

    story += [
        Paragraph("6. Participants", h1),
        Paragraph(", ".join(EVENT["participants"]) + ".", body),
        Paragraph("7. Questions and rulings", h1),
        Paragraph(EVENT["questions"], body),
        Spacer(1, 5*mm),
    ]

    callout_style = ParagraphStyle(
        "Callout", parent=body, alignment=TA_CENTER,
        fontSize=15, leading=18, textColor=colors.white,
    )
    callout = Table([[Paragraph(f'<b>{EVENT["closing"]}</b>', callout_style)]], colWidths=[173*mm])
    callout.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), RED),
        ("BOX", (0, 0), (-1, -1), 1, DARK),
        ("TOPPADDING", (0, 0), (-1, -1), 4*mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4*mm),
    ]))
    story.append(callout)

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"Created {output}")


if __name__ == "__main__":
    build_pdf()
