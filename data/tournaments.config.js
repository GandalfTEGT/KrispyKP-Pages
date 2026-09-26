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
    }
  ]
};
