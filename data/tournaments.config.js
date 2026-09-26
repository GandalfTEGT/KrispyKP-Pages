/*
========================================
KRISPYKP TOURNAMENT CONFIG TEMPLATE
========================================

IMPORTANT:
If you paste this file exactly as-is, the actual config starts on line 257.

WHAT THIS FILE DOES
-------------------
This file provides the data used by tournaments-page.js.
The page reads window.KRISPY_TOURNAMENTS and renders:
- the featured tournament
- results for completed events
- manual bracket groups
- players
- rules
- schedule
- other active events
- past events

TOP-LEVEL STRUCTURE
-------------------
currentEventId
- Type: string or null
- Use null to auto-pick the featured event.
- Use an event id string to force a specific event to load first.
- Example: "my-event-id"

events
- Type: array
- Contains all tournament objects.
- Leave empty for a fully empty page.

EVENT FIELD REFERENCE
---------------------
id
- Unique string. Required.

status
- Options: "live", "upcoming", "completed", "cancelled"
- Required.
- Results only show when status is "completed". Completed and cancelled events appear in the archive.

title
- Main visible tournament title. Required.

subtitle
- Short visible subtitle under the title. Optional.

organizer
- Name shown in the organiser area. Optional.

game
- Name of the game. Optional.

format
- Example: "Single Elimination", "Double Elimination", "Round Robin". Optional.

startDate / endDate
- Strings for the event window shown in Event Details.
- Example: "2026-07-20 18:00"
- Optional but recommended.

timezone
- Example: "UTC+0"
- Used in Event Details and can also be reused by schedule entries.

prizePool
- Example: "£100" or "$250"
- Optional.

bannerImage
- Path to the hero/background image.
- Example: "assets/tournaments/my-banner.jpg"
- 1920 x 800
- Optional.

description
- Main event description shown in Event Details.
- Optional.

registrationMode
- Options: "none", "closed", "external", "challonge"
- "none" = no signup button
- "closed" = no signup button, shows closed note
- "external" = uses registrationUrl
- "challonge" = uses registrationUrl
- Optional, but recommended.

registrationUrl
- External signup link.
- Used when registrationMode is "external" or "challonge".

streamUrl
- External stream link.
- Optional.

rulesUrl
- External rules link or file path.
- Optional.

bracketMode
- Options: "manual", "embed", "link", "none"
- Use "manual" for your custom renderer.
- Use "embed" if you have an embeddable bracket URL.
- Use "link" if you only want an external bracket button.
- Use "none" if no bracket should show.

bracketTitle
- Visible title above the bracket.
- Optional but recommended.

bracketEmbedUrl
- Used when bracketMode is "embed".

bracketUrl
- Used when bracketMode is "link"
- Can also be used as an external open button.

manualBracketGroups
- Array of bracket groups.
- Single elimination: use 1 group.
- Double elimination: usually use 3 groups:
  Winners Bracket / Losers Bracket / Grand Final
- Each group has:
  key: internal identifier
  title: visible heading
  rounds: array of rounds

MANUAL MATCH OPTIONS
--------------------
id
- Optional but strongly recommended unique match id.
- Needed for mapped connectors between matches.

slot1From / slot2From
- Optional strings containing upstream match ids.
- Use these when a match is fed by earlier matches.
- Example:
  slot1From: "wb1"
  slot2From: "wb2"

title
- Visible match title such as "QF1" or "WB2"

player1 / player2
- Player names shown in the match box.

score1 / score2
- Optional score strings.
- Leave as "" if not played yet.

winner
- Winner name string.
- Leave as "" if not decided yet.

note
- Extra label such as "Bo3" or "Bo5"

time
- Displayed inside the match card.
- Example: "2026-07-20 18:00 UTC"

PLAYER OPTIONS
--------------
name
- Required player name.

seed
- Optional number or string.
- If blank or missing, no seed is shown.

flag
- Optional text label such as "Scotland", "England", "Germany"

flagImage
- Optional image path or data URI.
- If present, this is shown instead of plain emoji/text flag output.

discord
- Optional Discord username without @

note
- Optional extra label such as "Host" or "Guest Player"

SCHEDULE FORMAT
---------------
Prefer:
{
  title: "Grand Final Matches Start",
  date: "2026-07-20",
  time: "21:00",
  timezone: "UTC+0"
}

You can also still use:
{
  label: "Grand Final",
  value: "2026-07-20 21:00 UTC"
}
but the title/date/time/timezone format is cleaner.

RULES FORMAT
------------
For an official generated rules PDF, use structured rules:
rules: {
  sections: [
    { title: "Tournament format", paragraphs: ["Rule text."], bullets: [] }
  ],
  mapPool: ["Map 1", "Map 2"],
  questions: "Contact the organiser with questions.",
  closing: "GOOD LUCK, COMMANDERS."
}

Legacy rule arrays remain supported for website-only events, but the PDF
generator refuses them because they do not contain enough document structure.

RESULTS FORMAT
--------------
results: [
  { place: "1st", name: "Player Name", note: "Champion" },
  { place: "2nd", name: "Player Name", note: "Runner-up" }
]

Results only show when:
- status is "completed"
- results has at least one entry

EMPTY DEFAULTS
--------------
Use empty arrays for:
players, schedule, rules, results, manualBracketGroups

SETUP EXAMPLES
--------------
No tournaments:
- currentEventId: null
- events: []

Single elimination manual event:
- status: "upcoming" or "live"
- bracketMode: "manual"
- manualBracketGroups: [
    { key: "main", title: "Tournament Bracket", rounds: [...] }
  ]

Double elimination manual event:
- bracketMode: "manual"
- manualBracketGroups:
  winners / losers / grand-final

Embedded bracket event:
- bracketMode: "embed"
- bracketEmbedUrl: "https://..."

Link-only bracket event:
- bracketMode: "link"
- bracketUrl: "https://..."

========================================
END OF GUIDE
========================================
====================================================================================================
====================================================================================================
====================================================================================================
====================================================================================================
====================================================================================================
*/

// KKP Tournament Builder managed data. Edit through the Builder where possible.
window.KRISPY_TOURNAMENTS = {
  "currentEventId": "td-invasion-red-alert-2026",
  "events": [
    {
      "id": "td-invasion-red-alert-2026",
      "status": "live",
      "title": "TD Invasion Red Alert Tournament",
      "subtitle": "The superstars of Tiberian Dawn invade Red Alert",
      "organizer": "JLGAZZA94",
      "game": "Command & Conquer: Red Alert",
      "format": "Double Elimination",
      "competitorStructure": "1v1",
      "startDate": "2026-09-14 12:00",
      "endDate": "",
      "timezone": "BST",
      "prizePool": "",
      "bannerImage": "/assets/tbanners/td-invasion.webp",
      "description": "A special crossover tournament featuring Tiberian Dawn players competing in Red Alert. The event uses a winners and losers bracket, so players must lose twice to be eliminated, except in the Grand Final. The undefeated finalist enters the Grand Final with a 1-0 advantage.",
      "registrationMode": "closed",
      "registrationUrl": "",
      "participantSource": "manual",
      "streamUrl": "https://www.twitch.tv/jlgazza94",
      "rulesUrl": "/assets/trules/td-invasion-rules.pdf",
      "bracketMode": "manual",
      "bracketTitle": "Tournament Bracket",
      "bracketEmbedUrl": "https://challonge.com/TDGOODRABAD/module",
      "bracketUrl": "https://challonge.com/TDGOODRABAD",
      "manualBracketGroups": [
        {
          "key": "winners",
          "title": "Winners Bracket",
          "rounds": [
            {
              "title": "Round 1",
              "matches": [
                {
                  "id": "m1",
                  "title": "Match 1",
                  "player1": "TRIOTD",
                  "player2": "JLGAZZA94",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                },
                {
                  "id": "m2",
                  "title": "Match 2",
                  "player1": "SHEPPARD",
                  "player2": "DR.MURK",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 2",
              "matches": [
                {
                  "id": "m5",
                  "title": "Match 5",
                  "player1": "JAMIETD",
                  "player2": "Winner of Match 1",
                  "slot1From": "",
                  "slot2From": "m1",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                },
                {
                  "id": "m3",
                  "title": "Match 3",
                  "player1": "DANKU",
                  "player2": "MC RUSTY",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                },
                {
                  "id": "m6",
                  "title": "Match 6",
                  "player1": "KRISPY",
                  "player2": "Winner of Match 2",
                  "slot1From": "",
                  "slot2From": "m2",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                },
                {
                  "id": "m4",
                  "title": "Match 4",
                  "player1": "FULLY",
                  "player2": "WTF",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "3",
                  "winner": "WTF",
                  "note": "Bo5",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 3",
              "matches": [
                {
                  "id": "m11",
                  "title": "Match 11",
                  "player1": "Winner of Match 5",
                  "player2": "Winner of Match 3",
                  "slot1From": "m5",
                  "slot2From": "m3",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                },
                {
                  "id": "m12",
                  "title": "Match 12",
                  "player1": "Winner of Match 6",
                  "player2": "WTF",
                  "slot1From": "m6",
                  "slot2From": "m4",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                }
              ]
            },
            {
              "title": "Winners Final",
              "matches": [
                {
                  "id": "m16",
                  "title": "Match 16",
                  "player1": "Winner of Match 11",
                  "player2": "Winner of Match 12",
                  "slot1From": "m11",
                  "slot2From": "m12",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                }
              ]
            }
          ]
        },
        {
          "key": "losers",
          "title": "Losers Bracket",
          "rounds": [
            {
              "title": "Losers Round 1",
              "matches": [
                {
                  "id": "m8",
                  "title": "Match 8",
                  "player1": "FULLY",
                  "player2": "Loser of Match 1",
                  "slot1From": "m4",
                  "slot2From": "m1",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                },
                {
                  "id": "m7",
                  "title": "Match 7",
                  "player1": "Loser of Match 3",
                  "player2": "Loser of Match 2",
                  "slot1From": "m3",
                  "slot2From": "m2",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                }
              ]
            },
            {
              "title": "Losers Round 2",
              "matches": [
                {
                  "id": "m10",
                  "title": "Match 10",
                  "player1": "Loser of Match 6",
                  "player2": "Winner of Match 8",
                  "slot1From": "m6",
                  "slot2From": "m8",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                },
                {
                  "id": "m9",
                  "title": "Match 9",
                  "player1": "Loser of Match 5",
                  "player2": "Winner of Match 7",
                  "slot1From": "m5",
                  "slot2From": "m7",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                }
              ]
            },
            {
              "title": "Losers Round 3",
              "matches": [
                {
                  "id": "m13",
                  "title": "Match 13",
                  "player1": "Loser of Match 11",
                  "player2": "Winner of Match 10",
                  "slot1From": "m11",
                  "slot2From": "m10",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                },
                {
                  "id": "m14",
                  "title": "Match 14",
                  "player1": "Loser of Match 12",
                  "player2": "Winner of Match 9",
                  "slot1From": "m12",
                  "slot2From": "m9",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                }
              ]
            },
            {
              "title": "Losers Round 4",
              "matches": [
                {
                  "id": "m15",
                  "title": "Match 15",
                  "player1": "Winner of Match 13",
                  "player2": "Winner of Match 14",
                  "slot1From": "m13",
                  "slot2From": "m14",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                }
              ]
            },
            {
              "title": "Losers Final",
              "matches": [
                {
                  "id": "m17",
                  "title": "Match 17",
                  "player1": "Loser of Match 16",
                  "player2": "Winner of Match 15",
                  "slot1From": "m16",
                  "slot2From": "m15",
                  "score1": "",
                  "score2": "",
                  "winner": "",
                  "note": "Bo5",
                  "time": ""
                }
              ]
            }
          ]
        },
        {
          "key": "grand-final",
          "title": "Grand Final",
          "rounds": [
            {
              "title": "Grand Final",
              "matches": [
                {
                  "id": "m18",
                  "title": "Match 18",
                  "player1": "Winner of Match 16",
                  "player2": "Winner of Match 17",
                  "slot1From": "m16",
                  "slot2From": "m17",
                  "score1": "1",
                  "score2": "0",
                  "winner": "",
                  "note": "Bo7 Â· Winners-bracket finalist starts 1-0",
                  "time": ""
                }
              ]
            }
          ]
        }
      ],
      "players": [
        {
          "name": "JAMIETD",
          "seed": "1",
          "flag": "England",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%0A%20%20%20%20%20%20%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2048%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2264%22%20height%3D%2248%22%20fill%3D%22%23ffffff%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%2226%22%20width%3D%2212%22%20height%3D%2248%22%20fill%3D%22%23cf142b%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20y%3D%2218%22%20width%3D%2264%22%20height%3D%2212%22%20fill%3D%22%23cf142b%22%2F%3E%0A%20%20%20%20%20%20%3C%2Fsvg%3E%0A%20%20%20%20",
          "inGameName": "JME",
          "note": ""
        },
        {
          "name": "KRISPY",
          "seed": "2",
          "flag": "Scotland",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%0A%20%20%20%20%20%20%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2048%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2264%22%20height%3D%2248%22%20fill%3D%22%23005eb8%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Cline%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%2264%22%20y2%3D%2248%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%228%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Cline%20x1%3D%2264%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%2248%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%228%22%2F%3E%0A%20%20%20%20%20%20%3C%2Fsvg%3E%0A%20%20%20%20",
          "inGameName": "ӄʀɨֆքʏ",
          "note": ""
        },
        {
          "name": "FULLY",
          "seed": "3",
          "flag": "USA",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%0A%20%20%20%20%20%20%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2048%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2264%22%20height%3D%2248%22%20fill%3D%22%23ffffff%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Cg%20fill%3D%22%23b22234%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3Crect%20y%3D%220%22%20width%3D%2264%22%20height%3D%223.692%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Crect%20y%3D%227.384%22%20width%3D%2264%22%20height%3D%223.692%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Crect%20y%3D%2214.768%22%20width%3D%2264%22%20height%3D%223.692%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Crect%20y%3D%2222.152%22%20width%3D%2264%22%20height%3D%223.692%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Crect%20y%3D%2229.536%22%20width%3D%2264%22%20height%3D%223.692%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Crect%20y%3D%2236.920%22%20width%3D%2264%22%20height%3D%223.692%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Crect%20y%3D%2244.304%22%20width%3D%2264%22%20height%3D%223.696%22%2F%3E%0A%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2225.6%22%20height%3D%2225.846%22%20fill%3D%22%233c3b6e%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Cg%20fill%3D%22%23ffffff%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%223.2%22%20cy%3D%223.2%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%228.0%22%20cy%3D%223.2%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2212.8%22%20cy%3D%223.2%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2217.6%22%20cy%3D%223.2%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2222.4%22%20cy%3D%223.2%22%20r%3D%220.9%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%225.6%22%20cy%3D%226.4%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2210.4%22%20cy%3D%226.4%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2215.2%22%20cy%3D%226.4%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2220.0%22%20cy%3D%226.4%22%20r%3D%220.9%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%223.2%22%20cy%3D%229.6%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%228.0%22%20cy%3D%229.6%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2212.8%22%20cy%3D%229.6%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2217.6%22%20cy%3D%229.6%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2222.4%22%20cy%3D%229.6%22%20r%3D%220.9%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%225.6%22%20cy%3D%2212.8%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2210.4%22%20cy%3D%2212.8%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2215.2%22%20cy%3D%2212.8%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2220.0%22%20cy%3D%2212.8%22%20r%3D%220.9%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%223.2%22%20cy%3D%2216.0%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%228.0%22%20cy%3D%2216.0%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2212.8%22%20cy%3D%2216.0%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2217.6%22%20cy%3D%2216.0%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2222.4%22%20cy%3D%2216.0%22%20r%3D%220.9%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%225.6%22%20cy%3D%2219.2%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2210.4%22%20cy%3D%2219.2%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2215.2%22%20cy%3D%2219.2%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2220.0%22%20cy%3D%2219.2%22%20r%3D%220.9%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%223.2%22%20cy%3D%2222.4%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%228.0%22%20cy%3D%2222.4%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2212.8%22%20cy%3D%2222.4%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2217.6%22%20cy%3D%2222.4%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2222.4%22%20cy%3D%2222.4%22%20r%3D%220.9%22%2F%3E%0A%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%20%20%3C%2Fsvg%3E%0A%20%20%20%20",
          "inGameName": "FULLY_DGAF",
          "note": ""
        },
        {
          "name": "DANKU",
          "seed": "4",
          "flag": "Ireland",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%0A%20%20%20%20%20%20%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2048%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2221.333%22%20height%3D%2248%22%20x%3D%220%22%20fill%3D%22%23169b62%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2221.333%22%20height%3D%2248%22%20x%3D%2221.333%22%20fill%3D%22%23ffffff%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2221.334%22%20height%3D%2248%22%20x%3D%2242.666%22%20fill%3D%22%23ff883e%22%2F%3E%0A%20%20%20%20%20%20%3C%2Fsvg%3E%0A%20%20%20%20",
          "inGameName": "Danku",
          "note": ""
        },
        {
          "name": "MC RUSTY",
          "seed": "5",
          "flag": "Canada",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%0A%20%20%20%20%20%20%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2048%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2264%22%20height%3D%2248%22%20fill%3D%22%23ffffff%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2216%22%20height%3D%2248%22%20x%3D%220%22%20fill%3D%22%23d80621%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2216%22%20height%3D%2248%22%20x%3D%2248%22%20fill%3D%22%23d80621%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Cpath%20fill%3D%22%23d80621%22%20d%3D%22M32%208l2%205%205-2-2%205%205%201-5%202%203%204-5-1%201%206h-4l1-6-5%201%203-4-5-2%205-1-2-5%205%202z%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%2230.5%22%20y%3D%2224%22%20width%3D%223%22%20height%3D%2210%22%20fill%3D%22%23d80621%22%2F%3E%0A%20%20%20%20%20%20%3C%2Fsvg%3E%0A%20%20%20%20",
          "inGameName": "MC RUSTY",
          "note": ""
        },
        {
          "name": "WTF",
          "seed": "6",
          "flag": "Canada",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%0A%20%20%20%20%20%20%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2048%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2264%22%20height%3D%2248%22%20fill%3D%22%23ffffff%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2216%22%20height%3D%2248%22%20x%3D%220%22%20fill%3D%22%23d80621%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2216%22%20height%3D%2248%22%20x%3D%2248%22%20fill%3D%22%23d80621%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Cpath%20fill%3D%22%23d80621%22%20d%3D%22M32%208l2%205%205-2-2%205%205%201-5%202%203%204-5-1%201%206h-4l1-6-5%201%203-4-5-2%205-1-2-5%205%202z%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%2230.5%22%20y%3D%2224%22%20width%3D%223%22%20height%3D%2210%22%20fill%3D%22%23d80621%22%2F%3E%0A%20%20%20%20%20%20%3C%2Fsvg%3E%0A%20%20%20%20",
          "inGameName": "WTF.VAG",
          "note": ""
        },
        {
          "name": "SHEPPARD",
          "seed": "7",
          "flag": "Slovenia",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%0A%20%20%20%20%20%20%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2048%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2264%22%20height%3D%2216%22%20y%3D%220%22%20fill%3D%22%23ffffff%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2264%22%20height%3D%2216%22%20y%3D%2216%22%20fill%3D%22%23005ce6%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2264%22%20height%3D%2216%22%20y%3D%2232%22%20fill%3D%22%23d50000%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Cg%20transform%3D%22translate(10%2C7)%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M0%200h14v10c0%206-7%2010-7%2010S0%2016%200%2010z%22%20fill%3D%22%23005ce6%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%221%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M2%205l3-3%202%202%202-2%203%203%22%20fill%3D%22none%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%221.2%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M3%2012h8%22%20stroke%3D%22%23ffffff%22%20stroke-width%3D%221.2%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Cpath%20d%3D%22M2%2014h10%22%20stroke%3D%22%23d50000%22%20stroke-width%3D%221.2%22%2F%3E%0A%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%20%20%3C%2Fsvg%3E%0A%20%20%20%20",
          "inGameName": "[ZeroG]SheppardSG1",
          "note": ""
        },
        {
          "name": "TRIOTD",
          "seed": "8",
          "flag": "Finland",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%0A%20%20%20%20%20%20%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2048%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2264%22%20height%3D%2248%22%20fill%3D%22%23ffffff%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%2218%22%20width%3D%2210%22%20height%3D%2248%22%20fill%3D%22%23003580%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20y%3D%2219%22%20width%3D%2264%22%20height%3D%2210%22%20fill%3D%22%23003580%22%2F%3E%0A%20%20%20%20%20%20%3C%2Fsvg%3E%0A%20%20%20%20",
          "inGameName": "TrioTD",
          "note": ""
        },
        {
          "name": "JLGAZZA94",
          "seed": "9",
          "flag": "England",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%0A%20%20%20%20%20%20%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2048%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2264%22%20height%3D%2248%22%20fill%3D%22%23ffffff%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20x%3D%2226%22%20width%3D%2212%22%20height%3D%2248%22%20fill%3D%22%23cf142b%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Crect%20y%3D%2218%22%20width%3D%2264%22%20height%3D%2212%22%20fill%3D%22%23cf142b%22%2F%3E%0A%20%20%20%20%20%20%3C%2Fsvg%3E%0A%20%20%20%20",
          "inGameName": "JLGAZZA94",
          "note": ""
        },
        {
          "name": "DR.MURK",
          "seed": "10",
          "flag": "USA",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%0A%20%20%20%20%20%20%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2064%2048%22%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2264%22%20height%3D%2248%22%20fill%3D%22%23ffffff%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Cg%20fill%3D%22%23b22234%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3Crect%20y%3D%220%22%20width%3D%2264%22%20height%3D%223.692%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Crect%20y%3D%227.384%22%20width%3D%2264%22%20height%3D%223.692%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Crect%20y%3D%2214.768%22%20width%3D%2264%22%20height%3D%223.692%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Crect%20y%3D%2222.152%22%20width%3D%2264%22%20height%3D%223.692%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Crect%20y%3D%2229.536%22%20width%3D%2264%22%20height%3D%223.692%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Crect%20y%3D%2236.920%22%20width%3D%2264%22%20height%3D%223.692%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Crect%20y%3D%2244.304%22%20width%3D%2264%22%20height%3D%223.696%22%2F%3E%0A%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%20%20%20%20%3Crect%20width%3D%2225.6%22%20height%3D%2225.846%22%20fill%3D%22%233c3b6e%22%2F%3E%0A%20%20%20%20%20%20%20%20%3Cg%20fill%3D%22%23ffffff%22%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%223.2%22%20cy%3D%223.2%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%228.0%22%20cy%3D%223.2%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2212.8%22%20cy%3D%223.2%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2217.6%22%20cy%3D%223.2%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2222.4%22%20cy%3D%223.2%22%20r%3D%220.9%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%225.6%22%20cy%3D%226.4%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2210.4%22%20cy%3D%226.4%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2215.2%22%20cy%3D%226.4%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2220.0%22%20cy%3D%226.4%22%20r%3D%220.9%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%223.2%22%20cy%3D%229.6%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%228.0%22%20cy%3D%229.6%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2212.8%22%20cy%3D%229.6%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2217.6%22%20cy%3D%229.6%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2222.4%22%20cy%3D%229.6%22%20r%3D%220.9%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%225.6%22%20cy%3D%2212.8%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2210.4%22%20cy%3D%2212.8%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2215.2%22%20cy%3D%2212.8%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2220.0%22%20cy%3D%2212.8%22%20r%3D%220.9%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%223.2%22%20cy%3D%2216.0%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%228.0%22%20cy%3D%2216.0%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2212.8%22%20cy%3D%2216.0%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2217.6%22%20cy%3D%2216.0%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2222.4%22%20cy%3D%2216.0%22%20r%3D%220.9%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%225.6%22%20cy%3D%2219.2%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2210.4%22%20cy%3D%2219.2%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2215.2%22%20cy%3D%2219.2%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2220.0%22%20cy%3D%2219.2%22%20r%3D%220.9%22%2F%3E%0A%20%20%20%20%20%20%20%20%20%20%3Ccircle%20cx%3D%223.2%22%20cy%3D%2222.4%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%228.0%22%20cy%3D%2222.4%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2212.8%22%20cy%3D%2222.4%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2217.6%22%20cy%3D%2222.4%22%20r%3D%220.9%22%2F%3E%3Ccircle%20cx%3D%2222.4%22%20cy%3D%2222.4%22%20r%3D%220.9%22%2F%3E%0A%20%20%20%20%20%20%20%20%3C%2Fg%3E%0A%20%20%20%20%20%20%3C%2Fsvg%3E%0A%20%20%20%20",
          "inGameName": "Dr.Murkinstein",
          "note": ""
        }
      ],
      "schedule": [
        {
          "title": "Tournament starts / first-round draw",
          "date": "2026-09-14",
          "time": "12:00",
          "timezone": "BST",
          "label": "",
          "value": ""
        },
        {
          "title": "Match deadline",
          "date": "",
          "time": "",
          "timezone": "",
          "label": "",
          "value": "No fixed deadline; once a match begins, the full series must be completed in one sitting."
        }
      ],
      "rules": {
        "sections": [
          {
            "title": "Tournament format",
            "paragraphs": [
              "The tournament uses a Winners Bracket and a Losers Bracket. A player must lose two matches to be eliminated, with the Grand Final handled under the special rule below. Because the field contains 10 players, some players receive a first-round bye.",
              "All Winners Bracket and Losers Bracket matches are Best of 5 (Bo5). The Grand Final is Best of 7 (Bo7).",
              "The player who reaches the Grand Final without previously losing a match starts the Grand Final 1-0 ahead. This is the advantage awarded for progressing through the Winners Bracket undefeated."
            ],
            "bullets": []
          },
          {
            "title": "Match scheduling",
            "paragraphs": [
              "The tournament starts on 14 September 2026, when the first-round draws are made. There is no fixed deadline by which an individual matchup must be played once opponents are known.",
              "Once both players sit down to play their matchup, all games in that matchup must be completed in one sitting."
            ],
            "bullets": []
          },
          {
            "title": "Hosting, map selection and spawns",
            "paragraphs": [
              "Use the standard Quickmatch rules when hosting. The tournament organiser states that these are the same hosting rules used for Tiberian Dawn."
            ],
            "bullets": [
              "Game 1: use a coin toss to decide the first host and map selector.",
              "The player who does not receive host and map selection gets spawn-pick choice.",
              "After each game, rotate the roles: host and map selector and spawn picker alternate until the matchup is complete."
            ]
          },
          {
            "title": "In-game rules",
            "paragraphs": [
              "There are no additional in-game restrictions. The event is intended as a fun Tiberian-Dawn-to-Red-Alert crossover, and all units, strategies and tactics are legal under the tournament rules."
            ],
            "bullets": []
          }
        ],
        "mapPool": [
          "Canyon",
          "(WHT) Elevation",
          "Keep Off The Grass",
          "Tournament Arena",
          "Pico V3 (1v1)",
          "RAP - Lake Mizu",
          "RAP - Hospital Hill"
        ],
        "questions": "Questions about the event or interpretation of these rules should be directed to tournament organiser JLGAZZA94. Where clarification is required during the event, the organiser's ruling governs the tournament.",
        "closing": "GOOD LUCK, COMRADES."
      },
      "results": []
    },
    {
      "status": "completed",
      "organizer": "JLGAZZA94",
      "endDate": "",
      "timezone": "BST",
      "registrationMode": "closed",
      "registrationUrl": "",
      "participantSource": "manual",
      "streamUrl": "",
      "rulesUrl": "",
      "bracketMode": "manual",
      "bracketTitle": "Final bracket",
      "bracketEmbedUrl": "",
      "schedule": [],
      "id": "td-invasion-red-alert-2025",
      "title": "TD Invasion Red Alert Tournament 2025",
      "subtitle": "Tiberian Dawn players crossed into Command & Conquer: Red Alert",
      "game": "Command & Conquer: Red Alert",
      "format": "Group Stage and Grand Final",
      "competitorStructure": "1v1",
      "startDate": "2025-08-18 00:00",
      "prizePool": "£25 winner / £10 runner-up",
      "bannerImage": "/assets/tbanners/td-invasion-red-alert-2025.webp",
      "description": "The original 2025 TD Invasion Red Alert tournament brought ten Tiberian Dawn community players into Red Alert. Two groups of five produced one finalist each for a best-of-seven Grand Final.",
      "bracketUrl": "https://challonge.com/READYCOMRADE",
      "players": [
        {
          "name": "WTF.RAG",
          "seed": "1",
          "flag": "",
          "flagImage": "",
          "inGameName": "WTF.RAG",
          "note": ""
        },
        {
          "name": "RA RUSTY",
          "seed": "2",
          "flag": "",
          "flagImage": "",
          "inGameName": "RA RUSTY",
          "note": ""
        },
        {
          "name": "RAGAZZA94",
          "seed": "3",
          "flag": "",
          "flagImage": "",
          "inGameName": "RAGAZZA94",
          "note": ""
        },
        {
          "name": "FULLY RED ALERT PLAYER",
          "seed": "4",
          "flag": "",
          "flagImage": "",
          "inGameName": "FULLY RED ALERT PLAYER",
          "note": ""
        },
        {
          "name": "DR.MURKINSTEIN APC ENGIED ME ON STREAM AND LIED ABOUT IT </3",
          "seed": "5",
          "flag": "",
          "flagImage": "",
          "inGameName": "DR.MURKINSTEIN APC ENGIED ME ON STREAM AND LIED ABOUT IT </3",
          "note": ""
        },
        {
          "name": "TRIORA",
          "seed": "6",
          "flag": "",
          "flagImage": "",
          "inGameName": "TRIORA",
          "note": ""
        },
        {
          "name": "CRITICAL LIGHTS",
          "seed": "7",
          "flag": "",
          "flagImage": "",
          "inGameName": "CRITICAL LIGHTS",
          "note": ""
        },
        {
          "name": "JAMIERA",
          "seed": "8",
          "flag": "",
          "flagImage": "",
          "inGameName": "JAMIERA",
          "note": ""
        },
        {
          "name": "MYNAME = RAPLAYER",
          "seed": "9",
          "flag": "",
          "flagImage": "",
          "inGameName": "MYNAME = RAPLAYER",
          "note": ""
        },
        {
          "name": "RARZA",
          "seed": "10",
          "flag": "",
          "flagImage": "",
          "inGameName": "RARZA",
          "note": ""
        }
      ],
      "rules": {
        "sections": [
          {
            "title": "Tournament format",
            "paragraphs": [
              "Two groups of five played best-of-five matches. Group winners advanced to a best-of-seven Grand Final. Game wins determined group points, with head-to-head used as the tie-break."
            ],
            "bullets": []
          }
        ],
        "mapPool": [
          "Canyon",
          "(WHT) Elevation",
          "Keep Off The Grass",
          "Tournament Arena",
          "Pico V3 (1v1)",
          "RAP - Lake Mizu",
          "RAP - Hospital Hill"
        ],
        "questions": "Historical record sourced from the public Challonge event pages. Contact the organiser for any correction.",
        "closing": "ARCHIVE RECORD"
      },
      "results": [
        {
          "place": "1st",
          "name": "WTF.RAG",
          "note": "Champion, won Grand Final 4–3"
        },
        {
          "place": "2nd",
          "name": "TRIORA",
          "note": "Runner-up"
        }
      ],
      "manualBracketGroups": [
        {
          "key": "grand-final",
          "title": "Grand Final",
          "rounds": [
            {
              "title": "Grand Final",
              "matches": [
                {
                  "id": "final",
                  "title": "FINAL",
                  "player1": "WTF.RAG",
                  "player2": "TRIORA",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "4",
                  "score2": "3",
                  "winner": "WTF.RAG",
                  "note": "Bo7",
                  "time": ""
                }
              ]
            }
          ]
        }
      ],
      "stageSummaries": [
        {
          "title": "Group A",
          "entries": [
            "WTF.RAG — 12 pts (4-0-0)",
            "RA RUSTY — 9 pts (3-1-0)",
            "RAGAZZA94 — 7 pts (2-2-0)",
            "FULLY RED ALERT PLAYER — 5 pts (1-3-0)",
            "DR.MURKINSTEIN — 1 pt (0-4-0)"
          ]
        },
        {
          "title": "Group B",
          "entries": [
            "TRIORA — 10 pts (3-1-0)",
            "CRITICAL LIGHTS — 9 pts (3-1-0)",
            "JAMIERA — 3 pts (1-2-1)",
            "MYNAME = RAPLAYER — 3 pts (1-3-0)",
            "RARZA — 3 pts (1-2-1)"
          ]
        }
      ]
    },
    {
      "status": "completed",
      "organizer": "JLGAZZA94",
      "endDate": "",
      "timezone": "BST",
      "registrationMode": "closed",
      "registrationUrl": "",
      "participantSource": "manual",
      "streamUrl": "",
      "rulesUrl": "",
      "bracketMode": "manual",
      "bracketTitle": "Final bracket",
      "bracketEmbedUrl": "",
      "schedule": [],
      "id": "td-champions-league-2024",
      "title": "TD Champions League 2024",
      "subtitle": "Twenty Command & Conquer: Tiberian Dawn players contested four groups and a knockout stage",
      "game": "Command & Conquer: Tiberian Dawn",
      "format": "Group Stage and Single Elimination",
      "competitorStructure": "1v1",
      "startDate": "2024-05-13 00:00",
      "prizePool": "£100 winner / £50 runner-up",
      "bannerImage": "/assets/tbanners/td-champions-league-2024.webp",
      "description": "A twenty-player Tiberian Dawn championship. Four groups of five sent their top two players to quarter-finals, semi-finals and a best-of-eleven Grand Final.",
      "bracketUrl": "https://challonge.com/AODISTOXICKEKW",
      "players": [
        {
          "name": "RAMBO",
          "seed": "1",
          "flag": "",
          "flagImage": "",
          "inGameName": "RAMBO",
          "note": ""
        },
        {
          "name": "WTF CCC",
          "seed": "2",
          "flag": "",
          "flagImage": "",
          "inGameName": "WTF CCC",
          "note": ""
        },
        {
          "name": "FULLY CCC",
          "seed": "3",
          "flag": "",
          "flagImage": "",
          "inGameName": "FULLY CCC",
          "note": ""
        },
        {
          "name": "AARON",
          "seed": "4",
          "flag": "",
          "flagImage": "",
          "inGameName": "AARON",
          "note": ""
        },
        {
          "name": "SHEPPARD",
          "seed": "5",
          "flag": "",
          "flagImage": "",
          "inGameName": "SHEPPARD",
          "note": ""
        },
        {
          "name": "FERRET",
          "seed": "6",
          "flag": "",
          "flagImage": "",
          "inGameName": "FERRET",
          "note": ""
        },
        {
          "name": "GLORY PRUSSIA",
          "seed": "7",
          "flag": "",
          "flagImage": "",
          "inGameName": "GLORY PRUSSIA",
          "note": ""
        },
        {
          "name": "BROWN PUDDLE",
          "seed": "8",
          "flag": "",
          "flagImage": "",
          "inGameName": "BROWN PUDDLE",
          "note": ""
        },
        {
          "name": "INCIA 3000",
          "seed": "9",
          "flag": "",
          "flagImage": "",
          "inGameName": "INCIA 3000",
          "note": ""
        },
        {
          "name": "KEREKOBAR",
          "seed": "10",
          "flag": "",
          "flagImage": "",
          "inGameName": "KEREKOBAR",
          "note": ""
        },
        {
          "name": "AOD",
          "seed": "11",
          "flag": "",
          "flagImage": "",
          "inGameName": "AOD",
          "note": ""
        },
        {
          "name": "SAI",
          "seed": "12",
          "flag": "",
          "flagImage": "",
          "inGameName": "SAI",
          "note": ""
        },
        {
          "name": "JAMIE",
          "seed": "13",
          "flag": "",
          "flagImage": "",
          "inGameName": "JAMIE",
          "note": ""
        },
        {
          "name": "BRUZER",
          "seed": "14",
          "flag": "",
          "flagImage": "",
          "inGameName": "BRUZER",
          "note": ""
        },
        {
          "name": "KRISPY",
          "seed": "15",
          "flag": "",
          "flagImage": "",
          "inGameName": "KRISPY",
          "note": ""
        },
        {
          "name": "TRIO",
          "seed": "16",
          "flag": "",
          "flagImage": "",
          "inGameName": "TRIO",
          "note": ""
        },
        {
          "name": "JLGAZZA94",
          "seed": "17",
          "flag": "",
          "flagImage": "",
          "inGameName": "JLGAZZA94",
          "note": ""
        },
        {
          "name": "DANKU",
          "seed": "18",
          "flag": "",
          "flagImage": "",
          "inGameName": "DANKU",
          "note": ""
        },
        {
          "name": "NOBLESUB",
          "seed": "19",
          "flag": "",
          "flagImage": "",
          "inGameName": "NOBLESUB",
          "note": ""
        },
        {
          "name": "FILLSKILL",
          "seed": "20",
          "flag": "",
          "flagImage": "",
          "inGameName": "FILLSKILL",
          "note": ""
        }
      ],
      "rules": {
        "sections": [
          {
            "title": "Tournament format",
            "paragraphs": [
              "Four groups of five played best-of-five matches; the top two in each group advanced. Quarter-finals were best-of-seven, semi-finals best-of-nine and the Grand Final best-of-eleven."
            ],
            "bullets": []
          }
        ],
        "mapPool": [
          "Elevation",
          "Green Acres",
          "Tiberium Garden Redux",
          "Monkey in the Middle",
          "One Pass Fits All",
          "Winter Wonderland",
          "Quarry",
          "Canyon Pursuit",
          "Field of Greens",
          "Nowhere to Hide",
          "Terrace",
          "Eye of the Storm",
          "Uphill Struggle",
          "The River Raid",
          "Tournament Desert"
        ],
        "questions": "Historical record sourced from the public Challonge event pages. Contact the organiser for any correction.",
        "closing": "ARCHIVE RECORD"
      },
      "results": [
        {
          "place": "1st",
          "name": "SAI",
          "note": "Champion, won Grand Final 6–1"
        },
        {
          "place": "2nd",
          "name": "AOD",
          "note": "Runner-up"
        },
        {
          "place": "3rd",
          "name": "RAMBO",
          "note": "Semi-finalist"
        },
        {
          "place": "3rd",
          "name": "WTF CCC",
          "note": "Semi-finalist"
        }
      ],
      "manualBracketGroups": [
        {
          "key": "main",
          "title": "Knockout Stage",
          "rounds": [
            {
              "title": "Quarter-finals",
              "matches": [
                {
                  "id": "qf1",
                  "title": "QF1",
                  "player1": "RAMBO",
                  "player2": "JLGAZZA94",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "4",
                  "score2": "0",
                  "winner": "RAMBO",
                  "note": "Bo7",
                  "time": ""
                },
                {
                  "id": "qf2",
                  "title": "QF2",
                  "player1": "AOD",
                  "player2": "GLORY PRUSSIA",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "4",
                  "score2": "0",
                  "winner": "AOD",
                  "note": "Bo7",
                  "time": ""
                },
                {
                  "id": "qf3",
                  "title": "QF3",
                  "player1": "FERRET",
                  "player2": "SAI",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "4",
                  "winner": "SAI",
                  "note": "Bo7",
                  "time": ""
                },
                {
                  "id": "qf4",
                  "title": "QF4",
                  "player1": "TRIO",
                  "player2": "WTF CCC",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "4",
                  "winner": "WTF CCC",
                  "note": "Bo7",
                  "time": ""
                }
              ]
            },
            {
              "title": "Semi-finals",
              "matches": [
                {
                  "id": "sf1",
                  "title": "SF1",
                  "player1": "RAMBO",
                  "player2": "AOD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "4",
                  "winner": "AOD",
                  "note": "Bo9",
                  "time": ""
                },
                {
                  "id": "sf2",
                  "title": "SF2",
                  "player1": "WTF CCC",
                  "player2": "SAI",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "5",
                  "winner": "SAI",
                  "note": "Bo9",
                  "time": ""
                }
              ]
            },
            {
              "title": "Grand Final",
              "matches": [
                {
                  "id": "final",
                  "title": "FINAL",
                  "player1": "AOD",
                  "player2": "SAI",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "6",
                  "winner": "SAI",
                  "note": "Bo11",
                  "time": ""
                }
              ]
            }
          ]
        }
      ],
      "stageSummaries": [
        {
          "title": "Group A",
          "entries": [
            "RAMBO — 12 pts",
            "WTF CCC — 10 pts",
            "FULLY CCC — 6 pts",
            "AARON — 4 pts",
            "SHEPPARD — 0 pts"
          ]
        },
        {
          "title": "Group B",
          "entries": [
            "FERRET — 12 pts",
            "GLORY PRUSSIA — 11 pts",
            "BROWN PUDDLE — 6 pts",
            "INCIA 3000 — 4 pts",
            "KEREKOBAR — 4 pts"
          ]
        },
        {
          "title": "Group C",
          "entries": [
            "AOD — 11 pts",
            "SAI — 10 pts",
            "JAMIE — 10 pts",
            "BRUZER — 6 pts",
            "KRISPY — 0 pts"
          ]
        },
        {
          "title": "Group D",
          "entries": [
            "TRIO — 9 pts",
            "JLGAZZA94 — 9 pts",
            "DANKU — 8 pts",
            "NOBLESUB — 8 pts",
            "FILLSKILL — 0 pts"
          ]
        }
      ]
    },
    {
      "status": "completed",
      "organizer": "JLGAZZA94",
      "endDate": "",
      "timezone": "BST",
      "registrationMode": "closed",
      "registrationUrl": "",
      "participantSource": "manual",
      "streamUrl": "",
      "rulesUrl": "",
      "bracketMode": "manual",
      "bracketTitle": "Final bracket",
      "bracketEmbedUrl": "",
      "schedule": [],
      "id": "td-home-nations-championship-2023",
      "title": "TD Home Nations Championship 2023",
      "subtitle": "Ten Tiberian Dawn players represented the UK and Ireland in two groups",
      "game": "Command & Conquer: Tiberian Dawn",
      "format": "Group Stage and Single Elimination",
      "competitorStructure": "1v1",
      "startDate": "2023-09-11 19:10",
      "prizePool": "",
      "bannerImage": "/assets/tbanners/td-home-nations-2023.webp",
      "description": "Ten Tiberian Dawn players entered two groups of five. The top two from each group advanced to best-of-nine semi-finals and a best-of-eleven Grand Final.",
      "bracketUrl": "https://challonge.com/4fjkeheh",
      "players": [
        {
          "name": "RASHNAGAR",
          "seed": "1",
          "flag": "",
          "flagImage": "",
          "inGameName": "RASHNAGAR",
          "note": ""
        },
        {
          "name": "CRITICAL MEDS",
          "seed": "2",
          "flag": "",
          "flagImage": "",
          "inGameName": "CRITICAL MEDS",
          "note": ""
        },
        {
          "name": "AARON",
          "seed": "3",
          "flag": "",
          "flagImage": "",
          "inGameName": "AARON",
          "note": ""
        },
        {
          "name": "DANKU",
          "seed": "4",
          "flag": "",
          "flagImage": "",
          "inGameName": "DANKU",
          "note": ""
        },
        {
          "name": "ADAM",
          "seed": "5",
          "flag": "",
          "flagImage": "",
          "inGameName": "ADAM",
          "note": ""
        },
        {
          "name": "JAMIE TD",
          "seed": "6",
          "flag": "",
          "flagImage": "",
          "inGameName": "JAMIE TD",
          "note": ""
        },
        {
          "name": "AOD",
          "seed": "7",
          "flag": "",
          "flagImage": "",
          "inGameName": "AOD",
          "note": ""
        },
        {
          "name": "BROTHERHOOD OF LAG",
          "seed": "8",
          "flag": "",
          "flagImage": "",
          "inGameName": "BROTHERHOOD OF LAG",
          "note": ""
        },
        {
          "name": "BRUZER",
          "seed": "9",
          "flag": "",
          "flagImage": "",
          "inGameName": "BRUZER",
          "note": ""
        },
        {
          "name": "KHANOMANCER",
          "seed": "10",
          "flag": "",
          "flagImage": "",
          "inGameName": "KHANOMANCER",
          "note": ""
        }
      ],
      "rules": {
        "sections": [
          {
            "title": "Tournament format",
            "paragraphs": [
              "Two groups of five determined four semi-finalists. Semi-finals were best-of-nine and the Grand Final was best-of-eleven."
            ],
            "bullets": []
          }
        ],
        "mapPool": [
          "Canyon",
          "Elevation",
          "Green Acres",
          "Tiberium Garden",
          "Monkey in the Middle",
          "One Pass Fits All",
          "Winter Wonderland",
          "Quarry",
          "Field of Greens",
          "Nowhere to Hide",
          "Terrace",
          "Eye of the Storm",
          "Uphill Struggle",
          "The River Raid",
          "Tournament Desert",
          "Desert Heat"
        ],
        "questions": "Historical record sourced from the public Challonge event pages. Contact the organiser for any correction.",
        "closing": "ARCHIVE RECORD"
      },
      "results": [
        {
          "place": "1st",
          "name": "AOD",
          "note": "Champion, won Grand Final 6–4"
        },
        {
          "place": "2nd",
          "name": "CRITICAL MEDS",
          "note": "Runner-up"
        },
        {
          "place": "3rd",
          "name": "JAMIE TD",
          "note": "Semi-finalist"
        },
        {
          "place": "3rd",
          "name": "RASHNAGAR",
          "note": "Semi-finalist"
        }
      ],
      "manualBracketGroups": [
        {
          "key": "main",
          "title": "Knockout Stage",
          "rounds": [
            {
              "title": "Semi-finals",
              "matches": [
                {
                  "id": "sf1",
                  "title": "SF1",
                  "player1": "RASHNAGAR",
                  "player2": "AOD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "5",
                  "winner": "AOD",
                  "note": "Bo9",
                  "time": ""
                },
                {
                  "id": "sf2",
                  "title": "SF2",
                  "player1": "JAMIE TD",
                  "player2": "CRITICAL MEDS",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "5",
                  "winner": "CRITICAL MEDS",
                  "note": "Bo9",
                  "time": ""
                }
              ]
            },
            {
              "title": "Grand Final",
              "matches": [
                {
                  "id": "final",
                  "title": "FINAL",
                  "player1": "AOD",
                  "player2": "CRITICAL MEDS",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "6",
                  "score2": "4",
                  "winner": "AOD",
                  "note": "Bo11",
                  "time": ""
                }
              ]
            }
          ]
        }
      ],
      "stageSummaries": [
        {
          "title": "Group A",
          "entries": [
            "RASHNAGAR — 16 pts",
            "CRITICAL MEDS — 14 pts",
            "AARON — 8 pts",
            "DANKU — 7 pts",
            "ADAM — 5 pts"
          ]
        },
        {
          "title": "Group B",
          "entries": [
            "JAMIE TD — 16 pts",
            "AOD — 15 pts",
            "BROTHERHOOD OF LAG — 11 pts",
            "BRUZER — 7 pts",
            "KHANOMANCER — 4 pts"
          ]
        }
      ]
    },
    {
      "status": "completed",
      "organizer": "JLGAZZA94",
      "endDate": "",
      "timezone": "BST",
      "registrationMode": "closed",
      "registrationUrl": "",
      "participantSource": "manual",
      "streamUrl": "",
      "rulesUrl": "",
      "bracketMode": "manual",
      "bracketTitle": "Round Robin Results",
      "bracketEmbedUrl": "",
      "schedule": [],
      "id": "td-oceania-championship-2023",
      "title": "TD Oceania Championship 2023",
      "subtitle": "Six Tiberian Dawn players contested an Oceania round robin",
      "game": "Command & Conquer: Tiberian Dawn",
      "format": "Round Robin",
      "competitorStructure": "1v1",
      "startDate": "2023-08-21 19:07",
      "prizePool": "",
      "bannerImage": "/assets/tbanners/td-oceania-2023.webp",
      "description": "A six-player Tiberian Dawn round robin in which every player faced all five opponents. The archived table records the completed event standings.",
      "bracketUrl": "https://challonge.com/vaxcgqjl",
      "players": [
        {
          "name": "peasy",
          "seed": "1",
          "flag": "",
          "flagImage": "",
          "inGameName": "peasy",
          "note": ""
        },
        {
          "name": "johnnyknows",
          "seed": "2",
          "flag": "",
          "flagImage": "",
          "inGameName": "johnnyknows",
          "note": ""
        },
        {
          "name": "noble sub",
          "seed": "3",
          "flag": "",
          "flagImage": "",
          "inGameName": "noble sub",
          "note": ""
        },
        {
          "name": "gazeelorps",
          "seed": "4",
          "flag": "",
          "flagImage": "",
          "inGameName": "gazeelorps",
          "note": ""
        },
        {
          "name": "brotherhood of lag",
          "seed": "5",
          "flag": "",
          "flagImage": "",
          "inGameName": "brotherhood of lag",
          "note": ""
        },
        {
          "name": "war machine",
          "seed": "6",
          "flag": "",
          "flagImage": "",
          "inGameName": "war machine",
          "note": ""
        }
      ],
      "rules": {
        "sections": [
          {
            "title": "Tournament format",
            "paragraphs": [
              "Six players met in a best-of-seven round robin. The event archive records the final table from the public bracket."
            ],
            "bullets": []
          }
        ],
        "mapPool": [
          "Tournament maps were selected by the organiser."
        ],
        "questions": "Historical record sourced from the public Challonge event pages. Contact the organiser for any correction.",
        "closing": "ARCHIVE RECORD"
      },
      "results": [
        {
          "place": "1st",
          "name": "peasy",
          "note": "20 pts, 5-0"
        },
        {
          "place": "2nd",
          "name": "johnnyknows",
          "note": "16 pts, 4-1"
        },
        {
          "place": "3rd",
          "name": "noble sub",
          "note": "14 pts, 3-2"
        },
        {
          "place": "4th",
          "name": "gazeelorps",
          "note": "12 pts, 1-4"
        },
        {
          "place": "5th",
          "name": "brotherhood of lag",
          "note": "10 pts, 2-3"
        },
        {
          "place": "6th",
          "name": "war machine",
          "note": "10 pts, 0-5"
        }
      ],
      "manualBracketGroups": [
  {
    "key": "main",
    "title": "Round Robin",
    "rounds": [
      {
        "title": "Round 1",
        "matches": [
          {
            "id": "rr1",
            "title": "Match 1",
            "player1": "NOBLESUB",
            "player2": "peasy",
            "slot1From": "",
            "slot2From": "",
            "score1": "0",
            "score2": "4",
            "winner": "peasy",
            "note": "Bo7",
            "time": ""
          },
          {
            "id": "rr2",
            "title": "Match 2",
            "player1": "war machine",
            "player2": "gazeelorps",
            "slot1From": "",
            "slot2From": "",
            "score1": "2",
            "score2": "4",
            "winner": "gazeelorps",
            "note": "Bo7",
            "time": ""
          },
          {
            "id": "rr3",
            "title": "Match 3",
            "player1": "johnnyknows",
            "player2": "BROTHERHOOD OF LAG",
            "slot1From": "",
            "slot2From": "",
            "score1": "4",
            "score2": "0",
            "winner": "johnnyknows",
            "note": "Bo7",
            "time": ""
          }
        ]
      },
      {
        "title": "Round 2",
        "matches": [
          {
            "id": "rr4",
            "title": "Match 4",
            "player1": "gazeelorps",
            "player2": "johnnyknows",
            "slot1From": "",
            "slot2From": "",
            "score1": "2",
            "score2": "4",
            "winner": "johnnyknows",
            "note": "Bo7",
            "time": ""
          },
          {
            "id": "rr5",
            "title": "Match 5",
            "player1": "BROTHERHOOD OF LAG",
            "player2": "NOBLESUB",
            "slot1From": "",
            "slot2From": "",
            "score1": "2",
            "score2": "4",
            "winner": "NOBLESUB",
            "note": "Bo7",
            "time": ""
          },
          {
            "id": "rr6",
            "title": "Match 6",
            "player1": "peasy",
            "player2": "war machine",
            "slot1From": "",
            "slot2From": "",
            "score1": "4",
            "score2": "2",
            "winner": "peasy",
            "note": "Bo7",
            "time": ""
          }
        ]
      },
      {
        "title": "Round 3",
        "matches": [
          {
            "id": "rr7",
            "title": "Match 7",
            "player1": "BROTHERHOOD OF LAG",
            "player2": "gazeelorps",
            "slot1From": "",
            "slot2From": "",
            "score1": "4",
            "score2": "3",
            "winner": "BROTHERHOOD OF LAG",
            "note": "Bo7",
            "time": ""
          },
          {
            "id": "rr8",
            "title": "Match 8",
            "player1": "johnnyknows",
            "player2": "peasy",
            "slot1From": "",
            "slot2From": "",
            "score1": "0",
            "score2": "4",
            "winner": "peasy",
            "note": "Bo7",
            "time": ""
          },
          {
            "id": "rr9",
            "title": "Match 9",
            "player1": "NOBLESUB",
            "player2": "war machine",
            "slot1From": "",
            "slot2From": "",
            "score1": "4",
            "score2": "2",
            "winner": "NOBLESUB",
            "note": "Bo7",
            "time": ""
          }
        ]
      },
      {
        "title": "Round 4",
        "matches": [
          {
            "id": "rr10",
            "title": "Match 10",
            "player1": "war machine",
            "player2": "johnnyknows",
            "slot1From": "",
            "slot2From": "",
            "score1": "2",
            "score2": "4",
            "winner": "johnnyknows",
            "note": "Bo7",
            "time": ""
          },
          {
            "id": "rr11",
            "title": "Match 11",
            "player1": "peasy",
            "player2": "BROTHERHOOD OF LAG",
            "slot1From": "",
            "slot2From": "",
            "score1": "4",
            "score2": "0",
            "winner": "peasy",
            "note": "Bo7",
            "time": ""
          },
          {
            "id": "rr12",
            "title": "Match 12",
            "player1": "gazeelorps",
            "player2": "NOBLESUB",
            "slot1From": "",
            "slot2From": "",
            "score1": "3",
            "score2": "4",
            "winner": "NOBLESUB",
            "note": "Bo7",
            "time": ""
          }
        ]
      },
      {
        "title": "Round 5",
        "matches": [
          {
            "id": "rr13",
            "title": "Match 13",
            "player1": "BROTHERHOOD OF LAG",
            "player2": "war machine",
            "slot1From": "",
            "slot2From": "",
            "score1": "4",
            "score2": "2",
            "winner": "BROTHERHOOD OF LAG",
            "note": "Bo7",
            "time": ""
          },
          {
            "id": "rr14",
            "title": "Match 14",
            "player1": "NOBLESUB",
            "player2": "johnnyknows",
            "slot1From": "",
            "slot2From": "",
            "score1": "2",
            "score2": "4",
            "winner": "johnnyknows",
            "note": "Bo7",
            "time": ""
          },
          {
            "id": "rr15",
            "title": "Match 15",
            "player1": "gazeelorps",
            "player2": "peasy",
            "slot1From": "",
            "slot2From": "",
            "score1": "0",
            "score2": "4",
            "winner": "peasy",
            "note": "Bo7",
            "time": ""
          }
        ]
      }
    ]
  }
],
      "stageSummaries": [
        {
          "title": "Final round-robin table",
          "entries": [
            "peasy — 20 pts (5-0)",
            "johnnyknows — 16 pts (4-1)",
            "noble sub — 14 pts (3-2)",
            "gazeelorps — 12 pts (1-4)",
            "brotherhood of lag — 10 pts (2-3)",
            "war machine — 10 pts (0-5)"
          ]
        }
      ]
    }
  ]
};
