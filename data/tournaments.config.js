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
- Options: "upcoming", "live", "awaiting-results", "completed", "cancelled"
- Required.
- Results only show when status is "completed". Completed and cancelled events appear in the archive.
- Use "awaiting-results" after play has ended when authoritative results are not yet published.

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

lastUpdated
- ISO date identifying the latest owner-confirmed lifecycle/content review.
- Required for a current event in "live" or "awaiting-results" state.

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
      "status": "awaiting-results",
      "title": "TD Invasion Red Alert Tournament 2026",
      "subtitle": "The superstars of Tiberian Dawn invade Red Alert",
      "organizer": "JLGAZZA94",
      "game": "Command & Conquer: Red Alert",
      "format": "Double Elimination",
      "competitorStructure": "1v1",
      "startDate": "2026-09-14 12:00",
      "endDate": "",
      "timezone": "BST",
      "lastUpdated": "2026-09-26",
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
                  "note": "Bo7 · Winners-bracket finalist starts 1-0",
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
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20480%22%20aria-label%3D%22Flag%20of%20England%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22800%22%20height%3D%22480%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%22352%22%20y%3D%220%22%20width%3D%2296%22%20height%3D%22480%22%20fill%3D%22%23ce1126%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22192%22%20width%3D%22800%22%20height%3D%2296%22%20fill%3D%22%23ce1126%22%20%2F%3E%3C%2Fsvg%3E",
          "inGameName": "JME",
          "note": ""
        },
        {
          "name": "KRISPY",
          "seed": "2",
          "flag": "Scotland",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20480%22%20aria-label%3D%22Flag%20of%20Scotland%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22800%22%20height%3D%22480%22%20fill%3D%22%23005eb8%22%20%2F%3E%3Cpath%20d%3D%22M0%200%20800%20480M800%200%200%20480%22%20fill%3D%22none%22%20stroke%3D%22%23fff%22%20stroke-width%3D%2280%22%20%2F%3E%3C%2Fsvg%3E",
          "inGameName": "KRISPY",
          "note": ""
        },
        {
          "name": "FULLY",
          "seed": "3",
          "flag": "USA",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20912%20480%22%20aria-label%3D%22Flag%20of%20United%20States%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220.0%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%2236.92307692307692%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%2273.84615384615384%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22110.76923076923077%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22147.69230769230768%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22184.6153846153846%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22221.53846153846155%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22258.46153846153845%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22295.38461538461536%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22332.3076923076923%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22369.2307692307692%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22406.15384615384613%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22443.0769230769231%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22364.8%22%20height%3D%22258.46153846153845%22%20fill%3D%22%233c3b6e%22%20%2F%3E%3Cg%20fill%3D%22%23fff%22%3E%3Cpolygon%20points%3D%2230.40%2C11.07%2033.72%2C21.28%2044.46%2C21.28%2035.77%2C27.59%2039.09%2C37.80%2030.40%2C31.50%2021.71%2C37.80%2025.03%2C27.59%2016.34%2C21.28%2027.08%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C11.07%2094.52%2C21.28%20105.26%2C21.28%2096.57%2C27.59%2099.89%2C37.80%2091.20%2C31.50%2082.51%2C37.80%2085.83%2C27.59%2077.14%2C21.28%2087.88%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C11.07%20155.32%2C21.28%20166.06%2C21.28%20157.37%2C27.59%20160.69%2C37.80%20152.00%2C31.50%20143.31%2C37.80%20146.63%2C27.59%20137.94%2C21.28%20148.68%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C11.07%20216.12%2C21.28%20226.86%2C21.28%20218.17%2C27.59%20221.49%2C37.80%20212.80%2C31.50%20204.11%2C37.80%20207.43%2C27.59%20198.74%2C21.28%20209.48%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C11.07%20276.92%2C21.28%20287.66%2C21.28%20278.97%2C27.59%20282.29%2C37.80%20273.60%2C31.50%20264.91%2C37.80%20268.23%2C27.59%20259.54%2C21.28%20270.28%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C11.07%20337.72%2C21.28%20348.46%2C21.28%20339.77%2C27.59%20343.09%2C37.80%20334.40%2C31.50%20325.71%2C37.80%20329.03%2C27.59%20320.34%2C21.28%20331.08%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C36.91%2064.12%2C47.12%2074.86%2C47.13%2066.17%2C53.44%2069.49%2C63.65%2060.80%2C57.34%2052.11%2C63.65%2055.43%2C53.44%2046.74%2C47.13%2057.48%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C36.91%20124.92%2C47.12%20135.66%2C47.13%20126.97%2C53.44%20130.29%2C63.65%20121.60%2C57.34%20112.91%2C63.65%20116.23%2C53.44%20107.54%2C47.13%20118.28%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C36.91%20185.72%2C47.12%20196.46%2C47.13%20187.77%2C53.44%20191.09%2C63.65%20182.40%2C57.34%20173.71%2C63.65%20177.03%2C53.44%20168.34%2C47.13%20179.08%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C36.91%20246.52%2C47.12%20257.26%2C47.13%20248.57%2C53.44%20251.89%2C63.65%20243.20%2C57.34%20234.51%2C63.65%20237.83%2C53.44%20229.14%2C47.13%20239.88%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C36.91%20307.32%2C47.12%20318.06%2C47.13%20309.37%2C53.44%20312.69%2C63.65%20304.00%2C57.34%20295.31%2C63.65%20298.63%2C53.44%20289.94%2C47.13%20300.68%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C62.76%2033.72%2C72.97%2044.46%2C72.97%2035.77%2C79.28%2039.09%2C89.50%2030.40%2C83.19%2021.71%2C89.50%2025.03%2C79.28%2016.34%2C72.97%2027.08%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C62.76%2094.52%2C72.97%20105.26%2C72.97%2096.57%2C79.28%2099.89%2C89.50%2091.20%2C83.19%2082.51%2C89.50%2085.83%2C79.28%2077.14%2C72.97%2087.88%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C62.76%20155.32%2C72.97%20166.06%2C72.97%20157.37%2C79.28%20160.69%2C89.50%20152.00%2C83.19%20143.31%2C89.50%20146.63%2C79.28%20137.94%2C72.97%20148.68%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C62.76%20216.12%2C72.97%20226.86%2C72.97%20218.17%2C79.28%20221.49%2C89.50%20212.80%2C83.19%20204.11%2C89.50%20207.43%2C79.28%20198.74%2C72.97%20209.48%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C62.76%20276.92%2C72.97%20287.66%2C72.97%20278.97%2C79.28%20282.29%2C89.50%20273.60%2C83.19%20264.91%2C89.50%20268.23%2C79.28%20259.54%2C72.97%20270.28%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C62.76%20337.72%2C72.97%20348.46%2C72.97%20339.77%2C79.28%20343.09%2C89.50%20334.40%2C83.19%20325.71%2C89.50%20329.03%2C79.28%20320.34%2C72.97%20331.08%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C88.60%2064.12%2C98.81%2074.86%2C98.82%2066.17%2C105.13%2069.49%2C115.34%2060.80%2C109.03%2052.11%2C115.34%2055.43%2C105.13%2046.74%2C98.82%2057.48%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C88.60%20124.92%2C98.81%20135.66%2C98.82%20126.97%2C105.13%20130.29%2C115.34%20121.60%2C109.03%20112.91%2C115.34%20116.23%2C105.13%20107.54%2C98.82%20118.28%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C88.60%20185.72%2C98.81%20196.46%2C98.82%20187.77%2C105.13%20191.09%2C115.34%20182.40%2C109.03%20173.71%2C115.34%20177.03%2C105.13%20168.34%2C98.82%20179.08%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C88.60%20246.52%2C98.81%20257.26%2C98.82%20248.57%2C105.13%20251.89%2C115.34%20243.20%2C109.03%20234.51%2C115.34%20237.83%2C105.13%20229.14%2C98.82%20239.88%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C88.60%20307.32%2C98.81%20318.06%2C98.82%20309.37%2C105.13%20312.69%2C115.34%20304.00%2C109.03%20295.31%2C115.34%20298.63%2C105.13%20289.94%2C98.82%20300.68%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C114.45%2033.72%2C124.66%2044.46%2C124.66%2035.77%2C130.98%2039.09%2C141.19%2030.40%2C134.88%2021.71%2C141.19%2025.03%2C130.98%2016.34%2C124.66%2027.08%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C114.45%2094.52%2C124.66%20105.26%2C124.66%2096.57%2C130.98%2099.89%2C141.19%2091.20%2C134.88%2082.51%2C141.19%2085.83%2C130.98%2077.14%2C124.66%2087.88%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C114.45%20155.32%2C124.66%20166.06%2C124.66%20157.37%2C130.98%20160.69%2C141.19%20152.00%2C134.88%20143.31%2C141.19%20146.63%2C130.98%20137.94%2C124.66%20148.68%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C114.45%20216.12%2C124.66%20226.86%2C124.66%20218.17%2C130.98%20221.49%2C141.19%20212.80%2C134.88%20204.11%2C141.19%20207.43%2C130.98%20198.74%2C124.66%20209.48%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C114.45%20276.92%2C124.66%20287.66%2C124.66%20278.97%2C130.98%20282.29%2C141.19%20273.60%2C134.88%20264.91%2C141.19%20268.23%2C130.98%20259.54%2C124.66%20270.28%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C114.45%20337.72%2C124.66%20348.46%2C124.66%20339.77%2C130.98%20343.09%2C141.19%20334.40%2C134.88%20325.71%2C141.19%20329.03%2C130.98%20320.34%2C124.66%20331.08%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C140.30%2064.12%2C150.51%2074.86%2C150.51%2066.17%2C156.82%2069.49%2C167.03%2060.80%2C160.73%2052.11%2C167.03%2055.43%2C156.82%2046.74%2C150.51%2057.48%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C140.30%20124.92%2C150.51%20135.66%2C150.51%20126.97%2C156.82%20130.29%2C167.03%20121.60%2C160.73%20112.91%2C167.03%20116.23%2C156.82%20107.54%2C150.51%20118.28%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C140.30%20185.72%2C150.51%20196.46%2C150.51%20187.77%2C156.82%20191.09%2C167.03%20182.40%2C160.73%20173.71%2C167.03%20177.03%2C156.82%20168.34%2C150.51%20179.08%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C140.30%20246.52%2C150.51%20257.26%2C150.51%20248.57%2C156.82%20251.89%2C167.03%20243.20%2C160.73%20234.51%2C167.03%20237.83%2C156.82%20229.14%2C150.51%20239.88%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C140.30%20307.32%2C150.51%20318.06%2C150.51%20309.37%2C156.82%20312.69%2C167.03%20304.00%2C160.73%20295.31%2C167.03%20298.63%2C156.82%20289.94%2C150.51%20300.68%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C166.14%2033.72%2C176.35%2044.46%2C176.36%2035.77%2C182.67%2039.09%2C192.88%2030.40%2C186.57%2021.71%2C192.88%2025.03%2C182.67%2016.34%2C176.36%2027.08%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C166.14%2094.52%2C176.35%20105.26%2C176.36%2096.57%2C182.67%2099.89%2C192.88%2091.20%2C186.57%2082.51%2C192.88%2085.83%2C182.67%2077.14%2C176.36%2087.88%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C166.14%20155.32%2C176.35%20166.06%2C176.36%20157.37%2C182.67%20160.69%2C192.88%20152.00%2C186.57%20143.31%2C192.88%20146.63%2C182.67%20137.94%2C176.36%20148.68%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C166.14%20216.12%2C176.35%20226.86%2C176.36%20218.17%2C182.67%20221.49%2C192.88%20212.80%2C186.57%20204.11%2C192.88%20207.43%2C182.67%20198.74%2C176.36%20209.48%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C166.14%20276.92%2C176.35%20287.66%2C176.36%20278.97%2C182.67%20282.29%2C192.88%20273.60%2C186.57%20264.91%2C192.88%20268.23%2C182.67%20259.54%2C176.36%20270.28%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C166.14%20337.72%2C176.35%20348.46%2C176.36%20339.77%2C182.67%20343.09%2C192.88%20334.40%2C186.57%20325.71%2C192.88%20329.03%2C182.67%20320.34%2C176.36%20331.08%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C191.99%2064.12%2C202.20%2074.86%2C202.20%2066.17%2C208.52%2069.49%2C218.73%2060.80%2C212.42%2052.11%2C218.73%2055.43%2C208.52%2046.74%2C202.20%2057.48%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C191.99%20124.92%2C202.20%20135.66%2C202.20%20126.97%2C208.52%20130.29%2C218.73%20121.60%2C212.42%20112.91%2C218.73%20116.23%2C208.52%20107.54%2C202.20%20118.28%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C191.99%20185.72%2C202.20%20196.46%2C202.20%20187.77%2C208.52%20191.09%2C218.73%20182.40%2C212.42%20173.71%2C218.73%20177.03%2C208.52%20168.34%2C202.20%20179.08%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C191.99%20246.52%2C202.20%20257.26%2C202.20%20248.57%2C208.52%20251.89%2C218.73%20243.20%2C212.42%20234.51%2C218.73%20237.83%2C208.52%20229.14%2C202.20%20239.88%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C191.99%20307.32%2C202.20%20318.06%2C202.20%20309.37%2C208.52%20312.69%2C218.73%20304.00%2C212.42%20295.31%2C218.73%20298.63%2C208.52%20289.94%2C202.20%20300.68%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C217.84%2033.72%2C228.04%2044.46%2C228.05%2035.77%2C234.36%2039.09%2C244.57%2030.40%2C238.27%2021.71%2C244.57%2025.03%2C234.36%2016.34%2C228.05%2027.08%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C217.84%2094.52%2C228.04%20105.26%2C228.05%2096.57%2C234.36%2099.89%2C244.57%2091.20%2C238.27%2082.51%2C244.57%2085.83%2C234.36%2077.14%2C228.05%2087.88%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C217.84%20155.32%2C228.04%20166.06%2C228.05%20157.37%2C234.36%20160.69%2C244.57%20152.00%2C238.27%20143.31%2C244.57%20146.63%2C234.36%20137.94%2C228.05%20148.68%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C217.84%20216.12%2C228.04%20226.86%2C228.05%20218.17%2C234.36%20221.49%2C244.57%20212.80%2C238.27%20204.11%2C244.57%20207.43%2C234.36%20198.74%2C228.05%20209.48%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C217.84%20276.92%2C228.04%20287.66%2C228.05%20278.97%2C234.36%20282.29%2C244.57%20273.60%2C238.27%20264.91%2C244.57%20268.23%2C234.36%20259.54%2C228.05%20270.28%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C217.84%20337.72%2C228.04%20348.46%2C228.05%20339.77%2C234.36%20343.09%2C244.57%20334.40%2C238.27%20325.71%2C244.57%20329.03%2C234.36%20320.34%2C228.05%20331.08%2C228.04%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E",
          "inGameName": "FULLY_DGAF",
          "note": ""
        },
        {
          "name": "DANKU",
          "seed": "4",
          "flag": "Ireland",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20960%20480%22%20aria-label%3D%22Flag%20of%20Ireland%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22320%22%20height%3D%22480%22%20fill%3D%22%23169b62%22%20%2F%3E%3Crect%20x%3D%22320%22%20y%3D%220%22%20width%3D%22320%22%20height%3D%22480%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%22640%22%20y%3D%220%22%20width%3D%22320%22%20height%3D%22480%22%20fill%3D%22%23ff883e%22%20%2F%3E%3C%2Fsvg%3E",
          "inGameName": "Danku",
          "note": ""
        },
        {
          "name": "MC RUSTY",
          "seed": "5",
          "flag": "Canada",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20960%20480%22%20aria-label%3D%22Flag%20of%20Canada%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22960%22%20height%3D%22480%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22240%22%20height%3D%22480%22%20fill%3D%22%23d52b1e%22%20%2F%3E%3Crect%20x%3D%22720%22%20y%3D%220%22%20width%3D%22240%22%20height%3D%22480%22%20fill%3D%22%23d52b1e%22%20%2F%3E%3Cg%20transform%3D%22translate(160%200)%22%3E%3Cpath%20d%3D%22M201%20232l-13.3%204.4%2061.4%2054c4.7%2013.7-1.6%2017.8-5.6%2025l66.6-8.4-1.6%2067%2013.9-.3-3.1-66.6%2066.7%208c-4.1-8.7-7.8-13.3-4-27.2l61.3-51-10.7-4c-8.8-6.8%203.8-32.6%205.6-48.9%200%200-35.7%2012.3-38%205.8l-9.2-17.5-32.6%2035.8c-3.5.9-5-.5-5.9-3.5l15-74.8-23.8%2013.4q-3.2%201.3-5.2-2.2l-23-46-23.6%2047.8q-2.8%202.5-5%20.7L264%20130.8l13.7%2074.1c-1.1%203-3.7%203.8-6.7%202.2l-31.2-35.3c-4%206.5-6.8%2017.1-12.2%2019.5s-23.5-4.5-35.6-7c4.2%2014.8%2017%2039.6%209%2047.7%22%20fill%3D%22%23d52b1e%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E",
          "inGameName": "MC RUSTY",
          "note": ""
        },
        {
          "name": "WTF",
          "seed": "6",
          "flag": "Canada",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20960%20480%22%20aria-label%3D%22Flag%20of%20Canada%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22960%22%20height%3D%22480%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22240%22%20height%3D%22480%22%20fill%3D%22%23d52b1e%22%20%2F%3E%3Crect%20x%3D%22720%22%20y%3D%220%22%20width%3D%22240%22%20height%3D%22480%22%20fill%3D%22%23d52b1e%22%20%2F%3E%3Cg%20transform%3D%22translate(160%200)%22%3E%3Cpath%20d%3D%22M201%20232l-13.3%204.4%2061.4%2054c4.7%2013.7-1.6%2017.8-5.6%2025l66.6-8.4-1.6%2067%2013.9-.3-3.1-66.6%2066.7%208c-4.1-8.7-7.8-13.3-4-27.2l61.3-51-10.7-4c-8.8-6.8%203.8-32.6%205.6-48.9%200%200-35.7%2012.3-38%205.8l-9.2-17.5-32.6%2035.8c-3.5.9-5-.5-5.9-3.5l15-74.8-23.8%2013.4q-3.2%201.3-5.2-2.2l-23-46-23.6%2047.8q-2.8%202.5-5%20.7L264%20130.8l13.7%2074.1c-1.1%203-3.7%203.8-6.7%202.2l-31.2-35.3c-4%206.5-6.8%2017.1-12.2%2019.5s-23.5-4.5-35.6-7c4.2%2014.8%2017%2039.6%209%2047.7%22%20fill%3D%22%23d52b1e%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E",
          "inGameName": "WTF.VAG",
          "note": ""
        },
        {
          "name": "SHEPPARD",
          "seed": "7",
          "flag": "Slovenia",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20960%20480%22%20aria-label%3D%22Flag%20of%20Slovenia%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220.0%22%20width%3D%22960%22%20height%3D%22160.0%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22160.0%22%20width%3D%22960%22%20height%3D%22160.0%22%20fill%3D%22%230000bf%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22320.0%22%20width%3D%22960%22%20height%3D%22160.0%22%20fill%3D%22%23d50000%22%20%2F%3E%3Cg%20transform%3D%22translate(82.5%200)%22%3E%3Cg%20fill-rule%3D%22evenodd%22%20stroke-width%3D%221pt%22%20transform%3D%22translate(14.1)scale(.9375)%22%3E%3Cpath%20fill%3D%22%23d50000%22%20d%3D%22M228.4%2093c-4%2061.6-6.4%2095.4-15.7%20111-10.2%2016.8-20%2029.1-59.7%2044-39.6-14.9-49.4-27.2-59.6-44-9.4-15.6-11.7-49.4-15.7-111l5.8-2c11.8-3.6%2020.6-6.5%2027.1-7.8%209.3-2%2017.3-4.2%2042.3-4.7%2025%20.4%2033%202.8%2042.3%204.8q9.7%202.1%2027.3%207.7z%22%20%2F%3E%0A%0A%20%20%20%20%3Cpath%20fill%3D%22%230000bf%22%20d%3D%22M222.6%2091c-3.8%2061.5-7%2089.7-12%20103.2-9.6%2023.2-24.8%2035.9-57.6%2048-32.8-12.1-48-24.8-57.7-48-5-13.6-8-41.7-11.8-103.3q17.4-5.6%2027.1-7.7c9.3-2%2017.3-4.3%2042.3-4.7%2025%20.4%2033%202.7%2042.3%204.7a284%20284%200%200%201%2027.4%207.7z%22%20%2F%3E%0A%0A%20%20%20%20%3Cpath%20fill%3D%22%23ffdf00%22%20d%3D%22m153%20109.8%201.5%203.7%207%201-4.5%202.7%204.3%202.9-6.3%201-2%203.4-2-3.5-6-.8%204-3-4.2-2.7%206.7-1z%22%20%2F%3E%0A%0A%20%20%20%20%3Cpath%20fill%3D%22%23fff%22%20d%3D%22m208.3%20179.6-3.9-3-2.7-4.6-5.4-4.7-2.9-4.7-5.4-4.9-2.6-4.7-3-2.3-1.8-1.9-5%204.3-2.6%204.7-3.3%203-3.7-2.9-2.7-4.8-10.3-18.3-10.3%2018.3-2.7%204.8-3.7%202.9-3.3-3-2.7-4.7-4.9-4.3-1.9%201.8-2.9%202.4-2.6%204.7-5.4%204.9-2.9%204.7-5.4%204.7-2.7%204.6-3.9%203a66%2066%200%200%200%2018.6%2036.3%20107%20107%200%200%200%2036.6%2020.5%20104%20104%200%200%200%2036.8-20.5c5.8-6%2016.6-19.3%2018.6-36.3%22%20%2F%3E%0A%0A%20%20%20%20%3Cpath%20fill%3D%22%23ffdf00%22%20d%3D%22m169.4%2083.9%201.6%203.7%207%201-4.6%202.7%204.4%202.9-6.3%201-2%203.4-2-3.5-6-.8%204-3-4.2-2.7%206.6-1zm-33%200%201.6%203.7%207%20.9-4.5%202.7%204.3%202.9-6.3%201-2%203.4-2-3.4-6-.9%204-3-4.2-2.7%206.7-1z%22%20%2F%3E%0A%0A%20%20%20%20%3Cpath%20fill%3D%22%230000bf%22%20d%3D%22M199.7%20203h-7.4l-7-.5-8.3-4h-9.4l-8.1%204-6.5.6-6.4-.6-8.1-4H129l-8.4%204-6.9.6-7.6-.1-3.6-6.2.1-.2%2011.2%201.9%206.9-.5%208.3-4.1h9.4l8.2%204%206.4.6%206.5-.6%208.1-4h9.4l8.4%204%206.9.6%2010.8-2%20.2.4zm-86.4%209.5%207.4-.5%208.3-4h9.4l8.2%204%206.4.5%206.4-.5%208.2-4h9.4l8.3%204%207.5.5%204.8-6h-.1l-5.2%201.4-6.9-.5-8.3-4h-9.4l-8.2%204-6.4.6-6.5-.6-8.1-4H129l-8.4%204-6.9.6-5-1.3v.2l4.5%205.6z%22%20%2F%3E%0A%0A%20%20%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E",
          "inGameName": "[ZeroG]SheppardSG1",
          "note": ""
        },
        {
          "name": "TRIOTD",
          "seed": "8",
          "flag": "Finland",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20792%20484%22%20aria-label%3D%22Flag%20of%20Finland%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22792%22%20height%3D%22484%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%22220%22%20y%3D%220%22%20width%3D%22132%22%20height%3D%22484%22%20fill%3D%22%23003580%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22176%22%20width%3D%22792%22%20height%3D%22132%22%20fill%3D%22%23003580%22%20%2F%3E%3C%2Fsvg%3E",
          "inGameName": "TrioTD",
          "note": ""
        },
        {
          "name": "JLGAZZA94",
          "seed": "9",
          "flag": "England",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20480%22%20aria-label%3D%22Flag%20of%20England%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22800%22%20height%3D%22480%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%22352%22%20y%3D%220%22%20width%3D%2296%22%20height%3D%22480%22%20fill%3D%22%23ce1126%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22192%22%20width%3D%22800%22%20height%3D%2296%22%20fill%3D%22%23ce1126%22%20%2F%3E%3C%2Fsvg%3E",
          "inGameName": "JLGAZZA94",
          "note": ""
        },
        {
          "name": "DR.MURK",
          "seed": "10",
          "flag": "USA",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20912%20480%22%20aria-label%3D%22Flag%20of%20United%20States%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220.0%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%2236.92307692307692%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%2273.84615384615384%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22110.76923076923077%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22147.69230769230768%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22184.6153846153846%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22221.53846153846155%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22258.46153846153845%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22295.38461538461536%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22332.3076923076923%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22369.2307692307692%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22406.15384615384613%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22443.0769230769231%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22364.8%22%20height%3D%22258.46153846153845%22%20fill%3D%22%233c3b6e%22%20%2F%3E%3Cg%20fill%3D%22%23fff%22%3E%3Cpolygon%20points%3D%2230.40%2C11.07%2033.72%2C21.28%2044.46%2C21.28%2035.77%2C27.59%2039.09%2C37.80%2030.40%2C31.50%2021.71%2C37.80%2025.03%2C27.59%2016.34%2C21.28%2027.08%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C11.07%2094.52%2C21.28%20105.26%2C21.28%2096.57%2C27.59%2099.89%2C37.80%2091.20%2C31.50%2082.51%2C37.80%2085.83%2C27.59%2077.14%2C21.28%2087.88%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C11.07%20155.32%2C21.28%20166.06%2C21.28%20157.37%2C27.59%20160.69%2C37.80%20152.00%2C31.50%20143.31%2C37.80%20146.63%2C27.59%20137.94%2C21.28%20148.68%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C11.07%20216.12%2C21.28%20226.86%2C21.28%20218.17%2C27.59%20221.49%2C37.80%20212.80%2C31.50%20204.11%2C37.80%20207.43%2C27.59%20198.74%2C21.28%20209.48%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C11.07%20276.92%2C21.28%20287.66%2C21.28%20278.97%2C27.59%20282.29%2C37.80%20273.60%2C31.50%20264.91%2C37.80%20268.23%2C27.59%20259.54%2C21.28%20270.28%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C11.07%20337.72%2C21.28%20348.46%2C21.28%20339.77%2C27.59%20343.09%2C37.80%20334.40%2C31.50%20325.71%2C37.80%20329.03%2C27.59%20320.34%2C21.28%20331.08%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C36.91%2064.12%2C47.12%2074.86%2C47.13%2066.17%2C53.44%2069.49%2C63.65%2060.80%2C57.34%2052.11%2C63.65%2055.43%2C53.44%2046.74%2C47.13%2057.48%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C36.91%20124.92%2C47.12%20135.66%2C47.13%20126.97%2C53.44%20130.29%2C63.65%20121.60%2C57.34%20112.91%2C63.65%20116.23%2C53.44%20107.54%2C47.13%20118.28%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C36.91%20185.72%2C47.12%20196.46%2C47.13%20187.77%2C53.44%20191.09%2C63.65%20182.40%2C57.34%20173.71%2C63.65%20177.03%2C53.44%20168.34%2C47.13%20179.08%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C36.91%20246.52%2C47.12%20257.26%2C47.13%20248.57%2C53.44%20251.89%2C63.65%20243.20%2C57.34%20234.51%2C63.65%20237.83%2C53.44%20229.14%2C47.13%20239.88%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C36.91%20307.32%2C47.12%20318.06%2C47.13%20309.37%2C53.44%20312.69%2C63.65%20304.00%2C57.34%20295.31%2C63.65%20298.63%2C53.44%20289.94%2C47.13%20300.68%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C62.76%2033.72%2C72.97%2044.46%2C72.97%2035.77%2C79.28%2039.09%2C89.50%2030.40%2C83.19%2021.71%2C89.50%2025.03%2C79.28%2016.34%2C72.97%2027.08%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C62.76%2094.52%2C72.97%20105.26%2C72.97%2096.57%2C79.28%2099.89%2C89.50%2091.20%2C83.19%2082.51%2C89.50%2085.83%2C79.28%2077.14%2C72.97%2087.88%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C62.76%20155.32%2C72.97%20166.06%2C72.97%20157.37%2C79.28%20160.69%2C89.50%20152.00%2C83.19%20143.31%2C89.50%20146.63%2C79.28%20137.94%2C72.97%20148.68%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C62.76%20216.12%2C72.97%20226.86%2C72.97%20218.17%2C79.28%20221.49%2C89.50%20212.80%2C83.19%20204.11%2C89.50%20207.43%2C79.28%20198.74%2C72.97%20209.48%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C62.76%20276.92%2C72.97%20287.66%2C72.97%20278.97%2C79.28%20282.29%2C89.50%20273.60%2C83.19%20264.91%2C89.50%20268.23%2C79.28%20259.54%2C72.97%20270.28%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C62.76%20337.72%2C72.97%20348.46%2C72.97%20339.77%2C79.28%20343.09%2C89.50%20334.40%2C83.19%20325.71%2C89.50%20329.03%2C79.28%20320.34%2C72.97%20331.08%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C88.60%2064.12%2C98.81%2074.86%2C98.82%2066.17%2C105.13%2069.49%2C115.34%2060.80%2C109.03%2052.11%2C115.34%2055.43%2C105.13%2046.74%2C98.82%2057.48%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C88.60%20124.92%2C98.81%20135.66%2C98.82%20126.97%2C105.13%20130.29%2C115.34%20121.60%2C109.03%20112.91%2C115.34%20116.23%2C105.13%20107.54%2C98.82%20118.28%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C88.60%20185.72%2C98.81%20196.46%2C98.82%20187.77%2C105.13%20191.09%2C115.34%20182.40%2C109.03%20173.71%2C115.34%20177.03%2C105.13%20168.34%2C98.82%20179.08%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C88.60%20246.52%2C98.81%20257.26%2C98.82%20248.57%2C105.13%20251.89%2C115.34%20243.20%2C109.03%20234.51%2C115.34%20237.83%2C105.13%20229.14%2C98.82%20239.88%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C88.60%20307.32%2C98.81%20318.06%2C98.82%20309.37%2C105.13%20312.69%2C115.34%20304.00%2C109.03%20295.31%2C115.34%20298.63%2C105.13%20289.94%2C98.82%20300.68%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C114.45%2033.72%2C124.66%2044.46%2C124.66%2035.77%2C130.98%2039.09%2C141.19%2030.40%2C134.88%2021.71%2C141.19%2025.03%2C130.98%2016.34%2C124.66%2027.08%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C114.45%2094.52%2C124.66%20105.26%2C124.66%2096.57%2C130.98%2099.89%2C141.19%2091.20%2C134.88%2082.51%2C141.19%2085.83%2C130.98%2077.14%2C124.66%2087.88%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C114.45%20155.32%2C124.66%20166.06%2C124.66%20157.37%2C130.98%20160.69%2C141.19%20152.00%2C134.88%20143.31%2C141.19%20146.63%2C130.98%20137.94%2C124.66%20148.68%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C114.45%20216.12%2C124.66%20226.86%2C124.66%20218.17%2C130.98%20221.49%2C141.19%20212.80%2C134.88%20204.11%2C141.19%20207.43%2C130.98%20198.74%2C124.66%20209.48%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C114.45%20276.92%2C124.66%20287.66%2C124.66%20278.97%2C130.98%20282.29%2C141.19%20273.60%2C134.88%20264.91%2C141.19%20268.23%2C130.98%20259.54%2C124.66%20270.28%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C114.45%20337.72%2C124.66%20348.46%2C124.66%20339.77%2C130.98%20343.09%2C141.19%20334.40%2C134.88%20325.71%2C141.19%20329.03%2C130.98%20320.34%2C124.66%20331.08%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C140.30%2064.12%2C150.51%2074.86%2C150.51%2066.17%2C156.82%2069.49%2C167.03%2060.80%2C160.73%2052.11%2C167.03%2055.43%2C156.82%2046.74%2C150.51%2057.48%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C140.30%20124.92%2C150.51%20135.66%2C150.51%20126.97%2C156.82%20130.29%2C167.03%20121.60%2C160.73%20112.91%2C167.03%20116.23%2C156.82%20107.54%2C150.51%20118.28%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C140.30%20185.72%2C150.51%20196.46%2C150.51%20187.77%2C156.82%20191.09%2C167.03%20182.40%2C160.73%20173.71%2C167.03%20177.03%2C156.82%20168.34%2C150.51%20179.08%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C140.30%20246.52%2C150.51%20257.26%2C150.51%20248.57%2C156.82%20251.89%2C167.03%20243.20%2C160.73%20234.51%2C167.03%20237.83%2C156.82%20229.14%2C150.51%20239.88%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C140.30%20307.32%2C150.51%20318.06%2C150.51%20309.37%2C156.82%20312.69%2C167.03%20304.00%2C160.73%20295.31%2C167.03%20298.63%2C156.82%20289.94%2C150.51%20300.68%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C166.14%2033.72%2C176.35%2044.46%2C176.36%2035.77%2C182.67%2039.09%2C192.88%2030.40%2C186.57%2021.71%2C192.88%2025.03%2C182.67%2016.34%2C176.36%2027.08%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C166.14%2094.52%2C176.35%20105.26%2C176.36%2096.57%2C182.67%2099.89%2C192.88%2091.20%2C186.57%2082.51%2C192.88%2085.83%2C182.67%2077.14%2C176.36%2087.88%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C166.14%20155.32%2C176.35%20166.06%2C176.36%20157.37%2C182.67%20160.69%2C192.88%20152.00%2C186.57%20143.31%2C192.88%20146.63%2C182.67%20137.94%2C176.36%20148.68%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C166.14%20216.12%2C176.35%20226.86%2C176.36%20218.17%2C182.67%20221.49%2C192.88%20212.80%2C186.57%20204.11%2C192.88%20207.43%2C182.67%20198.74%2C176.36%20209.48%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C166.14%20276.92%2C176.35%20287.66%2C176.36%20278.97%2C182.67%20282.29%2C192.88%20273.60%2C186.57%20264.91%2C192.88%20268.23%2C182.67%20259.54%2C176.36%20270.28%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C166.14%20337.72%2C176.35%20348.46%2C176.36%20339.77%2C182.67%20343.09%2C192.88%20334.40%2C186.57%20325.71%2C192.88%20329.03%2C182.67%20320.34%2C176.36%20331.08%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C191.99%2064.12%2C202.20%2074.86%2C202.20%2066.17%2C208.52%2069.49%2C218.73%2060.80%2C212.42%2052.11%2C218.73%2055.43%2C208.52%2046.74%2C202.20%2057.48%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C191.99%20124.92%2C202.20%20135.66%2C202.20%20126.97%2C208.52%20130.29%2C218.73%20121.60%2C212.42%20112.91%2C218.73%20116.23%2C208.52%20107.54%2C202.20%20118.28%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C191.99%20185.72%2C202.20%20196.46%2C202.20%20187.77%2C208.52%20191.09%2C218.73%20182.40%2C212.42%20173.71%2C218.73%20177.03%2C208.52%20168.34%2C202.20%20179.08%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C191.99%20246.52%2C202.20%20257.26%2C202.20%20248.57%2C208.52%20251.89%2C218.73%20243.20%2C212.42%20234.51%2C218.73%20237.83%2C208.52%20229.14%2C202.20%20239.88%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C191.99%20307.32%2C202.20%20318.06%2C202.20%20309.37%2C208.52%20312.69%2C218.73%20304.00%2C212.42%20295.31%2C218.73%20298.63%2C208.52%20289.94%2C202.20%20300.68%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C217.84%2033.72%2C228.04%2044.46%2C228.05%2035.77%2C234.36%2039.09%2C244.57%2030.40%2C238.27%2021.71%2C244.57%2025.03%2C234.36%2016.34%2C228.05%2027.08%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C217.84%2094.52%2C228.04%20105.26%2C228.05%2096.57%2C234.36%2099.89%2C244.57%2091.20%2C238.27%2082.51%2C244.57%2085.83%2C234.36%2077.14%2C228.05%2087.88%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C217.84%20155.32%2C228.04%20166.06%2C228.05%20157.37%2C234.36%20160.69%2C244.57%20152.00%2C238.27%20143.31%2C244.57%20146.63%2C234.36%20137.94%2C228.05%20148.68%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C217.84%20216.12%2C228.04%20226.86%2C228.05%20218.17%2C234.36%20221.49%2C244.57%20212.80%2C238.27%20204.11%2C244.57%20207.43%2C234.36%20198.74%2C228.05%20209.48%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C217.84%20276.92%2C228.04%20287.66%2C228.05%20278.97%2C234.36%20282.29%2C244.57%20273.60%2C238.27%20264.91%2C244.57%20268.23%2C234.36%20259.54%2C228.05%20270.28%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C217.84%20337.72%2C228.04%20348.46%2C228.05%20339.77%2C234.36%20343.09%2C244.57%20334.40%2C238.27%20325.71%2C244.57%20329.03%2C234.36%20320.34%2C228.05%20331.08%2C228.04%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E",
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
      "results": [],
      "stageSummaries": []
    },
    {
      "id": "td-invasion-red-alert-2025",
      "status": "completed",
      "title": "TD Invasion Red Alert Tournament 2025",
      "subtitle": "Tiberian Dawn players crossed into Command & Conquer: Red Alert",
      "organizer": "JLGAZZA94",
      "game": "Command & Conquer: Red Alert",
      "format": "Group Stage and Grand Final",
      "competitorStructure": "1v1",
      "startDate": "2025-08-18 00:00",
      "endDate": "",
      "timezone": "BST",
      "prizePool": "£25 winner / £10 runner-up",
      "bannerImage": "/assets/tbanners/td-invasion-red-alert-2025.webp",
      "description": "The original 2025 TD Invasion Red Alert tournament brought ten Tiberian Dawn community players into Red Alert. Two groups of five produced one finalist each for a best-of-seven Grand Final.",
      "registrationMode": "closed",
      "registrationUrl": "",
      "participantSource": "manual",
      "streamUrl": "",
      "rulesUrl": "/assets/trules/td-invasion-red-alert-2025-rules.pdf",
      "bracketMode": "manual",
      "bracketTitle": "Final bracket",
      "bracketEmbedUrl": "",
      "bracketUrl": "https://challonge.com/READYCOMRADE",
      "manualBracketGroups": [
        {
          "key": "group-a",
          "title": "Group A",
          "rounds": [
            {
              "title": "Round 1",
              "matches": [
                {
                  "id": "a-r1m1",
                  "title": "A-R1M1",
                  "player1": "FULLY ",
                  "player2": "WTF",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "WTF",
                  "note": "Group stage ",
                  "time": ""
                },
                {
                  "id": "a-r1m2",
                  "title": "A-R1M2",
                  "player1": "DR.MURK",
                  "player2": "MC RUSTY",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "MC RUSTY",
                  "note": "Group stage ",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 2",
              "matches": [
                {
                  "id": "a-r2m1",
                  "title": "A-R2M1",
                  "player1": "WTF",
                  "player2": "DR.MURK",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "WTF",
                  "note": "Group stage ",
                  "time": ""
                },
                {
                  "id": "a-r2m2",
                  "title": "A-R2M2",
                  "player1": "JLGAZZA94",
                  "player2": "FULLY",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "2",
                  "winner": "JLGAZZA94",
                  "note": "Group stage ",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 3",
              "matches": [
                {
                  "id": "a-r3m1",
                  "title": "A-R3M1",
                  "player1": "DR.MURK",
                  "player2": "JLGAZZA94",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "3",
                  "winner": "JLGAZZA94",
                  "note": "Group stage ",
                  "time": ""
                },
                {
                  "id": "a-r3m2",
                  "title": "A-R3M2",
                  "player1": "MC RUSTY",
                  "player2": "WTF",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "WTF",
                  "note": "Group stage ",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 4",
              "matches": [
                {
                  "id": "a-r4m1",
                  "title": "A-R4M1",
                  "player1": "JLGAZZA94",
                  "player2": "MC RUSTY",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "3",
                  "winner": "MC RUSTY",
                  "note": "Group stage ",
                  "time": ""
                },
                {
                  "id": "a-r4m2",
                  "title": "A-R4M2",
                  "player1": "FULLY ",
                  "player2": "DR.MURK",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "FULLY ",
                  "note": "Group stage ",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 5",
              "matches": [
                {
                  "id": "a-r5m1",
                  "title": "A-R5M1",
                  "player1": "MC RUSTY",
                  "player2": "FULLY ",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "MC RUSTY",
                  "note": "Group stage",
                  "time": ""
                },
                {
                  "id": "a-r5m2",
                  "title": "A-R5M2",
                  "player1": "WTF",
                  "player2": "JLGAZZA94",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "WTF",
                  "note": "Group stage ",
                  "time": ""
                }
              ]
            }
          ]
        },
        {
          "key": "group-b",
          "title": "Group B",
          "rounds": [
            {
              "title": "Round 1",
              "matches": [
                {
                  "id": "b-r1m1",
                  "title": "B-R1M1",
                  "player1": "TRIOTD",
                  "player2": "JAMIETD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "TRIOTD",
                  "note": "Group stage ",
                  "time": ""
                },
                {
                  "id": "b-r1m2",
                  "title": "-R1M2",
                  "player1": "MYNAME",
                  "player2": "CRITICAL MEDS",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "CRITICAL MEDS",
                  "note": "Group stage ",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 2",
              "matches": [
                {
                  "id": "b-r2m1",
                  "title": "B-R2M1",
                  "player1": "JAMIETD",
                  "player2": "MYNAME",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "JAMIETD",
                  "note": "Group stage ",
                  "time": ""
                },
                {
                  "id": "b-r2m2",
                  "title": "B-R2M2",
                  "player1": "ARZA",
                  "player2": "TRIOTD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "TRIOTD",
                  "note": "Group stage ",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 3",
              "matches": [
                {
                  "id": "b-r3m1",
                  "title": "B-R3M1",
                  "player1": "MYNAME",
                  "player2": "ARZA",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "MYNAME",
                  "note": "Group stage",
                  "time": ""
                },
                {
                  "id": "b-r3m2",
                  "title": "B-R3M2",
                  "player1": "CRITICAL MEDS",
                  "player2": "JAMIETD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "CRITICAL MEDS",
                  "note": "Group stage ",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 4",
              "matches": [
                {
                  "id": "b-r4m1",
                  "title": "B-R4M1",
                  "player1": "ARZA",
                  "player2": "CRITICAL MEDS",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "ARZA",
                  "note": "Group stage ",
                  "time": ""
                },
                {
                  "id": "b-r4m2",
                  "title": "B-R4M2",
                  "player1": "TRIOTD",
                  "player2": "MYNAME",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "TRIOTD",
                  "note": "Group stage ",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 5",
              "matches": [
                {
                  "id": "b-r5m1",
                  "title": "B-R5M1",
                  "player1": "CRITICAL MEDS",
                  "player2": "TRIOTD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "1",
                  "winner": "CRITICAL MEDS",
                  "note": "Group stage ",
                  "time": ""
                },
                {
                  "id": "b-r5m2",
                  "title": "B-R5M2",
                  "player1": "JAMIETD",
                  "player2": "ARZA",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "0",
                  "winner": "",
                  "note": "Group stage",
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
                  "id": "final",
                  "title": "FINAL",
                  "player1": "WTF",
                  "player2": "TRIOTD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "4",
                  "score2": "3",
                  "winner": "WTF",
                  "note": "Bo7",
                  "time": ""
                }
              ]
            }
          ]
        }
      ],
      "players": [
        {
          "name": "WTF",
          "seed": "1",
          "flag": "Canada",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20960%20480%22%20aria-label%3D%22Flag%20of%20Canada%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22960%22%20height%3D%22480%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22240%22%20height%3D%22480%22%20fill%3D%22%23d52b1e%22%20%2F%3E%3Crect%20x%3D%22720%22%20y%3D%220%22%20width%3D%22240%22%20height%3D%22480%22%20fill%3D%22%23d52b1e%22%20%2F%3E%3Cg%20transform%3D%22translate(160%200)%22%3E%3Cpath%20d%3D%22M201%20232l-13.3%204.4%2061.4%2054c4.7%2013.7-1.6%2017.8-5.6%2025l66.6-8.4-1.6%2067%2013.9-.3-3.1-66.6%2066.7%208c-4.1-8.7-7.8-13.3-4-27.2l61.3-51-10.7-4c-8.8-6.8%203.8-32.6%205.6-48.9%200%200-35.7%2012.3-38%205.8l-9.2-17.5-32.6%2035.8c-3.5.9-5-.5-5.9-3.5l15-74.8-23.8%2013.4q-3.2%201.3-5.2-2.2l-23-46-23.6%2047.8q-2.8%202.5-5%20.7L264%20130.8l13.7%2074.1c-1.1%203-3.7%203.8-6.7%202.2l-31.2-35.3c-4%206.5-6.8%2017.1-12.2%2019.5s-23.5-4.5-35.6-7c4.2%2014.8%2017%2039.6%209%2047.7%22%20fill%3D%22%23d52b1e%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E",
          "inGameName": "WTF.RAG",
          "note": ""
        },
        {
          "name": "MC RUSTY",
          "seed": "2",
          "flag": "Canada",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20960%20480%22%20aria-label%3D%22Flag%20of%20Canada%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22960%22%20height%3D%22480%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22240%22%20height%3D%22480%22%20fill%3D%22%23d52b1e%22%20%2F%3E%3Crect%20x%3D%22720%22%20y%3D%220%22%20width%3D%22240%22%20height%3D%22480%22%20fill%3D%22%23d52b1e%22%20%2F%3E%3Cg%20transform%3D%22translate(160%200)%22%3E%3Cpath%20d%3D%22M201%20232l-13.3%204.4%2061.4%2054c4.7%2013.7-1.6%2017.8-5.6%2025l66.6-8.4-1.6%2067%2013.9-.3-3.1-66.6%2066.7%208c-4.1-8.7-7.8-13.3-4-27.2l61.3-51-10.7-4c-8.8-6.8%203.8-32.6%205.6-48.9%200%200-35.7%2012.3-38%205.8l-9.2-17.5-32.6%2035.8c-3.5.9-5-.5-5.9-3.5l15-74.8-23.8%2013.4q-3.2%201.3-5.2-2.2l-23-46-23.6%2047.8q-2.8%202.5-5%20.7L264%20130.8l13.7%2074.1c-1.1%203-3.7%203.8-6.7%202.2l-31.2-35.3c-4%206.5-6.8%2017.1-12.2%2019.5s-23.5-4.5-35.6-7c4.2%2014.8%2017%2039.6%209%2047.7%22%20fill%3D%22%23d52b1e%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E",
          "inGameName": "RA RUSTY",
          "note": ""
        },
        {
          "name": "JLGAZZA94",
          "seed": "3",
          "flag": "England",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20480%22%20aria-label%3D%22Flag%20of%20England%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22800%22%20height%3D%22480%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%22352%22%20y%3D%220%22%20width%3D%2296%22%20height%3D%22480%22%20fill%3D%22%23ce1126%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22192%22%20width%3D%22800%22%20height%3D%2296%22%20fill%3D%22%23ce1126%22%20%2F%3E%3C%2Fsvg%3E",
          "inGameName": "RAGAZZA94",
          "note": ""
        },
        {
          "name": "FULLY ",
          "seed": "4",
          "flag": "USA",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20912%20480%22%20aria-label%3D%22Flag%20of%20United%20States%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220.0%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%2236.92307692307692%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%2273.84615384615384%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22110.76923076923077%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22147.69230769230768%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22184.6153846153846%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22221.53846153846155%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22258.46153846153845%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22295.38461538461536%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22332.3076923076923%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22369.2307692307692%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22406.15384615384613%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22443.0769230769231%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22364.8%22%20height%3D%22258.46153846153845%22%20fill%3D%22%233c3b6e%22%20%2F%3E%3Cg%20fill%3D%22%23fff%22%3E%3Cpolygon%20points%3D%2230.40%2C11.07%2033.72%2C21.28%2044.46%2C21.28%2035.77%2C27.59%2039.09%2C37.80%2030.40%2C31.50%2021.71%2C37.80%2025.03%2C27.59%2016.34%2C21.28%2027.08%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C11.07%2094.52%2C21.28%20105.26%2C21.28%2096.57%2C27.59%2099.89%2C37.80%2091.20%2C31.50%2082.51%2C37.80%2085.83%2C27.59%2077.14%2C21.28%2087.88%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C11.07%20155.32%2C21.28%20166.06%2C21.28%20157.37%2C27.59%20160.69%2C37.80%20152.00%2C31.50%20143.31%2C37.80%20146.63%2C27.59%20137.94%2C21.28%20148.68%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C11.07%20216.12%2C21.28%20226.86%2C21.28%20218.17%2C27.59%20221.49%2C37.80%20212.80%2C31.50%20204.11%2C37.80%20207.43%2C27.59%20198.74%2C21.28%20209.48%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C11.07%20276.92%2C21.28%20287.66%2C21.28%20278.97%2C27.59%20282.29%2C37.80%20273.60%2C31.50%20264.91%2C37.80%20268.23%2C27.59%20259.54%2C21.28%20270.28%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C11.07%20337.72%2C21.28%20348.46%2C21.28%20339.77%2C27.59%20343.09%2C37.80%20334.40%2C31.50%20325.71%2C37.80%20329.03%2C27.59%20320.34%2C21.28%20331.08%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C36.91%2064.12%2C47.12%2074.86%2C47.13%2066.17%2C53.44%2069.49%2C63.65%2060.80%2C57.34%2052.11%2C63.65%2055.43%2C53.44%2046.74%2C47.13%2057.48%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C36.91%20124.92%2C47.12%20135.66%2C47.13%20126.97%2C53.44%20130.29%2C63.65%20121.60%2C57.34%20112.91%2C63.65%20116.23%2C53.44%20107.54%2C47.13%20118.28%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C36.91%20185.72%2C47.12%20196.46%2C47.13%20187.77%2C53.44%20191.09%2C63.65%20182.40%2C57.34%20173.71%2C63.65%20177.03%2C53.44%20168.34%2C47.13%20179.08%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C36.91%20246.52%2C47.12%20257.26%2C47.13%20248.57%2C53.44%20251.89%2C63.65%20243.20%2C57.34%20234.51%2C63.65%20237.83%2C53.44%20229.14%2C47.13%20239.88%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C36.91%20307.32%2C47.12%20318.06%2C47.13%20309.37%2C53.44%20312.69%2C63.65%20304.00%2C57.34%20295.31%2C63.65%20298.63%2C53.44%20289.94%2C47.13%20300.68%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C62.76%2033.72%2C72.97%2044.46%2C72.97%2035.77%2C79.28%2039.09%2C89.50%2030.40%2C83.19%2021.71%2C89.50%2025.03%2C79.28%2016.34%2C72.97%2027.08%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C62.76%2094.52%2C72.97%20105.26%2C72.97%2096.57%2C79.28%2099.89%2C89.50%2091.20%2C83.19%2082.51%2C89.50%2085.83%2C79.28%2077.14%2C72.97%2087.88%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C62.76%20155.32%2C72.97%20166.06%2C72.97%20157.37%2C79.28%20160.69%2C89.50%20152.00%2C83.19%20143.31%2C89.50%20146.63%2C79.28%20137.94%2C72.97%20148.68%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C62.76%20216.12%2C72.97%20226.86%2C72.97%20218.17%2C79.28%20221.49%2C89.50%20212.80%2C83.19%20204.11%2C89.50%20207.43%2C79.28%20198.74%2C72.97%20209.48%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C62.76%20276.92%2C72.97%20287.66%2C72.97%20278.97%2C79.28%20282.29%2C89.50%20273.60%2C83.19%20264.91%2C89.50%20268.23%2C79.28%20259.54%2C72.97%20270.28%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C62.76%20337.72%2C72.97%20348.46%2C72.97%20339.77%2C79.28%20343.09%2C89.50%20334.40%2C83.19%20325.71%2C89.50%20329.03%2C79.28%20320.34%2C72.97%20331.08%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C88.60%2064.12%2C98.81%2074.86%2C98.82%2066.17%2C105.13%2069.49%2C115.34%2060.80%2C109.03%2052.11%2C115.34%2055.43%2C105.13%2046.74%2C98.82%2057.48%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C88.60%20124.92%2C98.81%20135.66%2C98.82%20126.97%2C105.13%20130.29%2C115.34%20121.60%2C109.03%20112.91%2C115.34%20116.23%2C105.13%20107.54%2C98.82%20118.28%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C88.60%20185.72%2C98.81%20196.46%2C98.82%20187.77%2C105.13%20191.09%2C115.34%20182.40%2C109.03%20173.71%2C115.34%20177.03%2C105.13%20168.34%2C98.82%20179.08%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C88.60%20246.52%2C98.81%20257.26%2C98.82%20248.57%2C105.13%20251.89%2C115.34%20243.20%2C109.03%20234.51%2C115.34%20237.83%2C105.13%20229.14%2C98.82%20239.88%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C88.60%20307.32%2C98.81%20318.06%2C98.82%20309.37%2C105.13%20312.69%2C115.34%20304.00%2C109.03%20295.31%2C115.34%20298.63%2C105.13%20289.94%2C98.82%20300.68%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C114.45%2033.72%2C124.66%2044.46%2C124.66%2035.77%2C130.98%2039.09%2C141.19%2030.40%2C134.88%2021.71%2C141.19%2025.03%2C130.98%2016.34%2C124.66%2027.08%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C114.45%2094.52%2C124.66%20105.26%2C124.66%2096.57%2C130.98%2099.89%2C141.19%2091.20%2C134.88%2082.51%2C141.19%2085.83%2C130.98%2077.14%2C124.66%2087.88%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C114.45%20155.32%2C124.66%20166.06%2C124.66%20157.37%2C130.98%20160.69%2C141.19%20152.00%2C134.88%20143.31%2C141.19%20146.63%2C130.98%20137.94%2C124.66%20148.68%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C114.45%20216.12%2C124.66%20226.86%2C124.66%20218.17%2C130.98%20221.49%2C141.19%20212.80%2C134.88%20204.11%2C141.19%20207.43%2C130.98%20198.74%2C124.66%20209.48%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C114.45%20276.92%2C124.66%20287.66%2C124.66%20278.97%2C130.98%20282.29%2C141.19%20273.60%2C134.88%20264.91%2C141.19%20268.23%2C130.98%20259.54%2C124.66%20270.28%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C114.45%20337.72%2C124.66%20348.46%2C124.66%20339.77%2C130.98%20343.09%2C141.19%20334.40%2C134.88%20325.71%2C141.19%20329.03%2C130.98%20320.34%2C124.66%20331.08%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C140.30%2064.12%2C150.51%2074.86%2C150.51%2066.17%2C156.82%2069.49%2C167.03%2060.80%2C160.73%2052.11%2C167.03%2055.43%2C156.82%2046.74%2C150.51%2057.48%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C140.30%20124.92%2C150.51%20135.66%2C150.51%20126.97%2C156.82%20130.29%2C167.03%20121.60%2C160.73%20112.91%2C167.03%20116.23%2C156.82%20107.54%2C150.51%20118.28%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C140.30%20185.72%2C150.51%20196.46%2C150.51%20187.77%2C156.82%20191.09%2C167.03%20182.40%2C160.73%20173.71%2C167.03%20177.03%2C156.82%20168.34%2C150.51%20179.08%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C140.30%20246.52%2C150.51%20257.26%2C150.51%20248.57%2C156.82%20251.89%2C167.03%20243.20%2C160.73%20234.51%2C167.03%20237.83%2C156.82%20229.14%2C150.51%20239.88%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C140.30%20307.32%2C150.51%20318.06%2C150.51%20309.37%2C156.82%20312.69%2C167.03%20304.00%2C160.73%20295.31%2C167.03%20298.63%2C156.82%20289.94%2C150.51%20300.68%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C166.14%2033.72%2C176.35%2044.46%2C176.36%2035.77%2C182.67%2039.09%2C192.88%2030.40%2C186.57%2021.71%2C192.88%2025.03%2C182.67%2016.34%2C176.36%2027.08%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C166.14%2094.52%2C176.35%20105.26%2C176.36%2096.57%2C182.67%2099.89%2C192.88%2091.20%2C186.57%2082.51%2C192.88%2085.83%2C182.67%2077.14%2C176.36%2087.88%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C166.14%20155.32%2C176.35%20166.06%2C176.36%20157.37%2C182.67%20160.69%2C192.88%20152.00%2C186.57%20143.31%2C192.88%20146.63%2C182.67%20137.94%2C176.36%20148.68%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C166.14%20216.12%2C176.35%20226.86%2C176.36%20218.17%2C182.67%20221.49%2C192.88%20212.80%2C186.57%20204.11%2C192.88%20207.43%2C182.67%20198.74%2C176.36%20209.48%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C166.14%20276.92%2C176.35%20287.66%2C176.36%20278.97%2C182.67%20282.29%2C192.88%20273.60%2C186.57%20264.91%2C192.88%20268.23%2C182.67%20259.54%2C176.36%20270.28%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C166.14%20337.72%2C176.35%20348.46%2C176.36%20339.77%2C182.67%20343.09%2C192.88%20334.40%2C186.57%20325.71%2C192.88%20329.03%2C182.67%20320.34%2C176.36%20331.08%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C191.99%2064.12%2C202.20%2074.86%2C202.20%2066.17%2C208.52%2069.49%2C218.73%2060.80%2C212.42%2052.11%2C218.73%2055.43%2C208.52%2046.74%2C202.20%2057.48%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C191.99%20124.92%2C202.20%20135.66%2C202.20%20126.97%2C208.52%20130.29%2C218.73%20121.60%2C212.42%20112.91%2C218.73%20116.23%2C208.52%20107.54%2C202.20%20118.28%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C191.99%20185.72%2C202.20%20196.46%2C202.20%20187.77%2C208.52%20191.09%2C218.73%20182.40%2C212.42%20173.71%2C218.73%20177.03%2C208.52%20168.34%2C202.20%20179.08%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C191.99%20246.52%2C202.20%20257.26%2C202.20%20248.57%2C208.52%20251.89%2C218.73%20243.20%2C212.42%20234.51%2C218.73%20237.83%2C208.52%20229.14%2C202.20%20239.88%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C191.99%20307.32%2C202.20%20318.06%2C202.20%20309.37%2C208.52%20312.69%2C218.73%20304.00%2C212.42%20295.31%2C218.73%20298.63%2C208.52%20289.94%2C202.20%20300.68%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C217.84%2033.72%2C228.04%2044.46%2C228.05%2035.77%2C234.36%2039.09%2C244.57%2030.40%2C238.27%2021.71%2C244.57%2025.03%2C234.36%2016.34%2C228.05%2027.08%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C217.84%2094.52%2C228.04%20105.26%2C228.05%2096.57%2C234.36%2099.89%2C244.57%2091.20%2C238.27%2082.51%2C244.57%2085.83%2C234.36%2077.14%2C228.05%2087.88%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C217.84%20155.32%2C228.04%20166.06%2C228.05%20157.37%2C234.36%20160.69%2C244.57%20152.00%2C238.27%20143.31%2C244.57%20146.63%2C234.36%20137.94%2C228.05%20148.68%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C217.84%20216.12%2C228.04%20226.86%2C228.05%20218.17%2C234.36%20221.49%2C244.57%20212.80%2C238.27%20204.11%2C244.57%20207.43%2C234.36%20198.74%2C228.05%20209.48%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C217.84%20276.92%2C228.04%20287.66%2C228.05%20278.97%2C234.36%20282.29%2C244.57%20273.60%2C238.27%20264.91%2C244.57%20268.23%2C234.36%20259.54%2C228.05%20270.28%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C217.84%20337.72%2C228.04%20348.46%2C228.05%20339.77%2C234.36%20343.09%2C244.57%20334.40%2C238.27%20325.71%2C244.57%20329.03%2C234.36%20320.34%2C228.05%20331.08%2C228.04%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E",
          "inGameName": "FULLY RED ALERT PLAYER",
          "note": ""
        },
        {
          "name": "DR.MURK",
          "seed": "5",
          "flag": "USA",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20912%20480%22%20aria-label%3D%22Flag%20of%20United%20States%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220.0%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%2236.92307692307692%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%2273.84615384615384%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22110.76923076923077%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22147.69230769230768%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22184.6153846153846%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22221.53846153846155%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22258.46153846153845%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22295.38461538461536%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22332.3076923076923%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22369.2307692307692%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22406.15384615384613%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22443.0769230769231%22%20width%3D%22912%22%20height%3D%2236.92307692307692%22%20fill%3D%22%23b22234%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22364.8%22%20height%3D%22258.46153846153845%22%20fill%3D%22%233c3b6e%22%20%2F%3E%3Cg%20fill%3D%22%23fff%22%3E%3Cpolygon%20points%3D%2230.40%2C11.07%2033.72%2C21.28%2044.46%2C21.28%2035.77%2C27.59%2039.09%2C37.80%2030.40%2C31.50%2021.71%2C37.80%2025.03%2C27.59%2016.34%2C21.28%2027.08%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C11.07%2094.52%2C21.28%20105.26%2C21.28%2096.57%2C27.59%2099.89%2C37.80%2091.20%2C31.50%2082.51%2C37.80%2085.83%2C27.59%2077.14%2C21.28%2087.88%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C11.07%20155.32%2C21.28%20166.06%2C21.28%20157.37%2C27.59%20160.69%2C37.80%20152.00%2C31.50%20143.31%2C37.80%20146.63%2C27.59%20137.94%2C21.28%20148.68%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C11.07%20216.12%2C21.28%20226.86%2C21.28%20218.17%2C27.59%20221.49%2C37.80%20212.80%2C31.50%20204.11%2C37.80%20207.43%2C27.59%20198.74%2C21.28%20209.48%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C11.07%20276.92%2C21.28%20287.66%2C21.28%20278.97%2C27.59%20282.29%2C37.80%20273.60%2C31.50%20264.91%2C37.80%20268.23%2C27.59%20259.54%2C21.28%20270.28%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C11.07%20337.72%2C21.28%20348.46%2C21.28%20339.77%2C27.59%20343.09%2C37.80%20334.40%2C31.50%20325.71%2C37.80%20329.03%2C27.59%20320.34%2C21.28%20331.08%2C21.28%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C36.91%2064.12%2C47.12%2074.86%2C47.13%2066.17%2C53.44%2069.49%2C63.65%2060.80%2C57.34%2052.11%2C63.65%2055.43%2C53.44%2046.74%2C47.13%2057.48%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C36.91%20124.92%2C47.12%20135.66%2C47.13%20126.97%2C53.44%20130.29%2C63.65%20121.60%2C57.34%20112.91%2C63.65%20116.23%2C53.44%20107.54%2C47.13%20118.28%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C36.91%20185.72%2C47.12%20196.46%2C47.13%20187.77%2C53.44%20191.09%2C63.65%20182.40%2C57.34%20173.71%2C63.65%20177.03%2C53.44%20168.34%2C47.13%20179.08%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C36.91%20246.52%2C47.12%20257.26%2C47.13%20248.57%2C53.44%20251.89%2C63.65%20243.20%2C57.34%20234.51%2C63.65%20237.83%2C53.44%20229.14%2C47.13%20239.88%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C36.91%20307.32%2C47.12%20318.06%2C47.13%20309.37%2C53.44%20312.69%2C63.65%20304.00%2C57.34%20295.31%2C63.65%20298.63%2C53.44%20289.94%2C47.13%20300.68%2C47.12%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C62.76%2033.72%2C72.97%2044.46%2C72.97%2035.77%2C79.28%2039.09%2C89.50%2030.40%2C83.19%2021.71%2C89.50%2025.03%2C79.28%2016.34%2C72.97%2027.08%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C62.76%2094.52%2C72.97%20105.26%2C72.97%2096.57%2C79.28%2099.89%2C89.50%2091.20%2C83.19%2082.51%2C89.50%2085.83%2C79.28%2077.14%2C72.97%2087.88%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C62.76%20155.32%2C72.97%20166.06%2C72.97%20157.37%2C79.28%20160.69%2C89.50%20152.00%2C83.19%20143.31%2C89.50%20146.63%2C79.28%20137.94%2C72.97%20148.68%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C62.76%20216.12%2C72.97%20226.86%2C72.97%20218.17%2C79.28%20221.49%2C89.50%20212.80%2C83.19%20204.11%2C89.50%20207.43%2C79.28%20198.74%2C72.97%20209.48%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C62.76%20276.92%2C72.97%20287.66%2C72.97%20278.97%2C79.28%20282.29%2C89.50%20273.60%2C83.19%20264.91%2C89.50%20268.23%2C79.28%20259.54%2C72.97%20270.28%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C62.76%20337.72%2C72.97%20348.46%2C72.97%20339.77%2C79.28%20343.09%2C89.50%20334.40%2C83.19%20325.71%2C89.50%20329.03%2C79.28%20320.34%2C72.97%20331.08%2C72.97%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C88.60%2064.12%2C98.81%2074.86%2C98.82%2066.17%2C105.13%2069.49%2C115.34%2060.80%2C109.03%2052.11%2C115.34%2055.43%2C105.13%2046.74%2C98.82%2057.48%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C88.60%20124.92%2C98.81%20135.66%2C98.82%20126.97%2C105.13%20130.29%2C115.34%20121.60%2C109.03%20112.91%2C115.34%20116.23%2C105.13%20107.54%2C98.82%20118.28%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C88.60%20185.72%2C98.81%20196.46%2C98.82%20187.77%2C105.13%20191.09%2C115.34%20182.40%2C109.03%20173.71%2C115.34%20177.03%2C105.13%20168.34%2C98.82%20179.08%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C88.60%20246.52%2C98.81%20257.26%2C98.82%20248.57%2C105.13%20251.89%2C115.34%20243.20%2C109.03%20234.51%2C115.34%20237.83%2C105.13%20229.14%2C98.82%20239.88%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C88.60%20307.32%2C98.81%20318.06%2C98.82%20309.37%2C105.13%20312.69%2C115.34%20304.00%2C109.03%20295.31%2C115.34%20298.63%2C105.13%20289.94%2C98.82%20300.68%2C98.81%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C114.45%2033.72%2C124.66%2044.46%2C124.66%2035.77%2C130.98%2039.09%2C141.19%2030.40%2C134.88%2021.71%2C141.19%2025.03%2C130.98%2016.34%2C124.66%2027.08%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C114.45%2094.52%2C124.66%20105.26%2C124.66%2096.57%2C130.98%2099.89%2C141.19%2091.20%2C134.88%2082.51%2C141.19%2085.83%2C130.98%2077.14%2C124.66%2087.88%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C114.45%20155.32%2C124.66%20166.06%2C124.66%20157.37%2C130.98%20160.69%2C141.19%20152.00%2C134.88%20143.31%2C141.19%20146.63%2C130.98%20137.94%2C124.66%20148.68%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C114.45%20216.12%2C124.66%20226.86%2C124.66%20218.17%2C130.98%20221.49%2C141.19%20212.80%2C134.88%20204.11%2C141.19%20207.43%2C130.98%20198.74%2C124.66%20209.48%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C114.45%20276.92%2C124.66%20287.66%2C124.66%20278.97%2C130.98%20282.29%2C141.19%20273.60%2C134.88%20264.91%2C141.19%20268.23%2C130.98%20259.54%2C124.66%20270.28%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C114.45%20337.72%2C124.66%20348.46%2C124.66%20339.77%2C130.98%20343.09%2C141.19%20334.40%2C134.88%20325.71%2C141.19%20329.03%2C130.98%20320.34%2C124.66%20331.08%2C124.66%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C140.30%2064.12%2C150.51%2074.86%2C150.51%2066.17%2C156.82%2069.49%2C167.03%2060.80%2C160.73%2052.11%2C167.03%2055.43%2C156.82%2046.74%2C150.51%2057.48%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C140.30%20124.92%2C150.51%20135.66%2C150.51%20126.97%2C156.82%20130.29%2C167.03%20121.60%2C160.73%20112.91%2C167.03%20116.23%2C156.82%20107.54%2C150.51%20118.28%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C140.30%20185.72%2C150.51%20196.46%2C150.51%20187.77%2C156.82%20191.09%2C167.03%20182.40%2C160.73%20173.71%2C167.03%20177.03%2C156.82%20168.34%2C150.51%20179.08%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C140.30%20246.52%2C150.51%20257.26%2C150.51%20248.57%2C156.82%20251.89%2C167.03%20243.20%2C160.73%20234.51%2C167.03%20237.83%2C156.82%20229.14%2C150.51%20239.88%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C140.30%20307.32%2C150.51%20318.06%2C150.51%20309.37%2C156.82%20312.69%2C167.03%20304.00%2C160.73%20295.31%2C167.03%20298.63%2C156.82%20289.94%2C150.51%20300.68%2C150.51%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C166.14%2033.72%2C176.35%2044.46%2C176.36%2035.77%2C182.67%2039.09%2C192.88%2030.40%2C186.57%2021.71%2C192.88%2025.03%2C182.67%2016.34%2C176.36%2027.08%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C166.14%2094.52%2C176.35%20105.26%2C176.36%2096.57%2C182.67%2099.89%2C192.88%2091.20%2C186.57%2082.51%2C192.88%2085.83%2C182.67%2077.14%2C176.36%2087.88%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C166.14%20155.32%2C176.35%20166.06%2C176.36%20157.37%2C182.67%20160.69%2C192.88%20152.00%2C186.57%20143.31%2C192.88%20146.63%2C182.67%20137.94%2C176.36%20148.68%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C166.14%20216.12%2C176.35%20226.86%2C176.36%20218.17%2C182.67%20221.49%2C192.88%20212.80%2C186.57%20204.11%2C192.88%20207.43%2C182.67%20198.74%2C176.36%20209.48%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C166.14%20276.92%2C176.35%20287.66%2C176.36%20278.97%2C182.67%20282.29%2C192.88%20273.60%2C186.57%20264.91%2C192.88%20268.23%2C182.67%20259.54%2C176.36%20270.28%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C166.14%20337.72%2C176.35%20348.46%2C176.36%20339.77%2C182.67%20343.09%2C192.88%20334.40%2C186.57%20325.71%2C192.88%20329.03%2C182.67%20320.34%2C176.36%20331.08%2C176.35%22%20%2F%3E%3Cpolygon%20points%3D%2260.80%2C191.99%2064.12%2C202.20%2074.86%2C202.20%2066.17%2C208.52%2069.49%2C218.73%2060.80%2C212.42%2052.11%2C218.73%2055.43%2C208.52%2046.74%2C202.20%2057.48%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22121.60%2C191.99%20124.92%2C202.20%20135.66%2C202.20%20126.97%2C208.52%20130.29%2C218.73%20121.60%2C212.42%20112.91%2C218.73%20116.23%2C208.52%20107.54%2C202.20%20118.28%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22182.40%2C191.99%20185.72%2C202.20%20196.46%2C202.20%20187.77%2C208.52%20191.09%2C218.73%20182.40%2C212.42%20173.71%2C218.73%20177.03%2C208.52%20168.34%2C202.20%20179.08%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22243.20%2C191.99%20246.52%2C202.20%20257.26%2C202.20%20248.57%2C208.52%20251.89%2C218.73%20243.20%2C212.42%20234.51%2C218.73%20237.83%2C208.52%20229.14%2C202.20%20239.88%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%22304.00%2C191.99%20307.32%2C202.20%20318.06%2C202.20%20309.37%2C208.52%20312.69%2C218.73%20304.00%2C212.42%20295.31%2C218.73%20298.63%2C208.52%20289.94%2C202.20%20300.68%2C202.20%22%20%2F%3E%3Cpolygon%20points%3D%2230.40%2C217.84%2033.72%2C228.04%2044.46%2C228.05%2035.77%2C234.36%2039.09%2C244.57%2030.40%2C238.27%2021.71%2C244.57%2025.03%2C234.36%2016.34%2C228.05%2027.08%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%2291.20%2C217.84%2094.52%2C228.04%20105.26%2C228.05%2096.57%2C234.36%2099.89%2C244.57%2091.20%2C238.27%2082.51%2C244.57%2085.83%2C234.36%2077.14%2C228.05%2087.88%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22152.00%2C217.84%20155.32%2C228.04%20166.06%2C228.05%20157.37%2C234.36%20160.69%2C244.57%20152.00%2C238.27%20143.31%2C244.57%20146.63%2C234.36%20137.94%2C228.05%20148.68%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22212.80%2C217.84%20216.12%2C228.04%20226.86%2C228.05%20218.17%2C234.36%20221.49%2C244.57%20212.80%2C238.27%20204.11%2C244.57%20207.43%2C234.36%20198.74%2C228.05%20209.48%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22273.60%2C217.84%20276.92%2C228.04%20287.66%2C228.05%20278.97%2C234.36%20282.29%2C244.57%20273.60%2C238.27%20264.91%2C244.57%20268.23%2C234.36%20259.54%2C228.05%20270.28%2C228.04%22%20%2F%3E%3Cpolygon%20points%3D%22334.40%2C217.84%20337.72%2C228.04%20348.46%2C228.05%20339.77%2C234.36%20343.09%2C244.57%20334.40%2C238.27%20325.71%2C244.57%20329.03%2C234.36%20320.34%2C228.05%20331.08%2C228.04%22%20%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E",
          "inGameName": "DR.MURKINSTEIN APC ENGIED ME ON STREAM",
          "note": ""
        },
        {
          "name": "TRIOTD",
          "seed": "6",
          "flag": "Finland",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20792%20484%22%20aria-label%3D%22Flag%20of%20Finland%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22792%22%20height%3D%22484%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%22220%22%20y%3D%220%22%20width%3D%22132%22%20height%3D%22484%22%20fill%3D%22%23003580%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22176%22%20width%3D%22792%22%20height%3D%22132%22%20fill%3D%22%23003580%22%20%2F%3E%3C%2Fsvg%3E",
          "inGameName": "TRIORA",
          "note": ""
        },
        {
          "name": "CRITICAL MEDS",
          "seed": "7",
          "flag": "England",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20480%22%20aria-label%3D%22Flag%20of%20England%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22800%22%20height%3D%22480%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%22352%22%20y%3D%220%22%20width%3D%2296%22%20height%3D%22480%22%20fill%3D%22%23ce1126%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22192%22%20width%3D%22800%22%20height%3D%2296%22%20fill%3D%22%23ce1126%22%20%2F%3E%3C%2Fsvg%3E",
          "inGameName": "CRITICAL LIGHTS",
          "note": ""
        },
        {
          "name": "JAMIETD",
          "seed": "8",
          "flag": "England",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20800%20480%22%20aria-label%3D%22Flag%20of%20England%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%22800%22%20height%3D%22480%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%22352%22%20y%3D%220%22%20width%3D%2296%22%20height%3D%22480%22%20fill%3D%22%23ce1126%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22192%22%20width%3D%22800%22%20height%3D%2296%22%20fill%3D%22%23ce1126%22%20%2F%3E%3C%2Fsvg%3E",
          "inGameName": "JAMIERA",
          "note": ""
        },
        {
          "name": "MYNAME ",
          "seed": "9",
          "flag": "Russia",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20720%20480%22%20aria-label%3D%22Flag%20of%20Russia%22%20role%3D%22img%22%3E%3Crect%20x%3D%220%22%20y%3D%220.0%22%20width%3D%22720%22%20height%3D%22160.0%22%20fill%3D%22%23fff%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22160.0%22%20width%3D%22720%22%20height%3D%22160.0%22%20fill%3D%22%230039a6%22%20%2F%3E%3Crect%20x%3D%220%22%20y%3D%22320.0%22%20width%3D%22720%22%20height%3D%22160.0%22%20fill%3D%22%23d52b1e%22%20%2F%3E%3C%2Fsvg%3E",
          "inGameName": "MYNAME = RAPLAYER",
          "note": ""
        },
        {
          "name": "ARZA",
          "seed": "10",
          "flag": "Norway",
          "flagImage": "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20880%20640%22%20aria-label%3D%22Flag%20of%20Norway%22%20role%3D%22img%22%3E%0A%20%20%20%20%20%20%3Crect%20width%3D%22880%22%20height%3D%22640%22%20fill%3D%22%23ba0c2f%22%2F%3E%0A%20%20%20%20%20%20%3Cpath%20d%3D%22M240%200h160v640H240zM0%20240h880v160H0z%22%20fill%3D%22%23fff%22%2F%3E%0A%20%20%20%20%20%20%3Cpath%20d%3D%22M280%200h80v640h-80zM0%20280h880v80H0z%22%20fill%3D%22%2300205b%22%2F%3E%0A%20%20%20%20%3C%2Fsvg%3E",
          "inGameName": "RARZA",
          "note": ""
        }
      ],
      "schedule": [],
      "rules": {
        "sections": [
          {
            "title": "Tournament format",
            "paragraphs": [
              "Two groups of five played best-of-five matches. Group winners advanced to a best-of-seven Grand Final. Game wins determined group points, with head-to-head used as the tie-break."
            ],
            "bullets": [
              "PLEASE USE STANDARD QUICKMATCH RULES WHEN HOSTING THEY ARE THE SAME FOR RA AS TD",
              "FIRST HOST AND MAP SELECTOR IS DECIDED BY A COIN TOSS THE OTHER PLAYER GETS SPAWN PICK CHOICE. ROTATE MAPPICKER/HOST AND SPAWN PICKER EACH GAME AFTERWARDS UNTIL THE MATCH IS COMPLETE",
              "THERE ARE NO IN GAME RULES!!!! I HAVE NO IDEA WHAT'S GOOD AND WHATS NOT EXPECT LIGHT TANKS OP AND SINCE IT'S JUST A MESS AROUND TOURNAMENT EVERYTHING IS LEGAL."
            ]
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
      "id": "td-champions-league-2024",
      "status": "completed",
      "title": "TD Champions League 2024",
      "subtitle": "Twenty Command & Conquer: Tiberian Dawn players contested four groups and a knockout stage",
      "organizer": "JLGAZZA94",
      "game": "Command & Conquer: Tiberian Dawn",
      "format": "Group Stage and Single Elimination",
      "competitorStructure": "1v1",
      "startDate": "2024-05-13 00:00",
      "endDate": "",
      "timezone": "BST",
      "prizePool": "£100 winner / £50 runner-up",
      "bannerImage": "/assets/tbanners/td-champions-league-2024.webp",
      "description": "A twenty-player Tiberian Dawn championship. Four groups of five sent their top two players to quarter-finals, semi-finals and a best-of-eleven Grand Final.",
      "registrationMode": "closed",
      "registrationUrl": "",
      "participantSource": "manual",
      "streamUrl": "",
      "rulesUrl": "/assets/trules/td-champions-league-2024-rules.pdf",
      "bracketMode": "manual",
      "bracketTitle": "Final bracket",
      "bracketEmbedUrl": "",
      "bracketUrl": "https://challonge.com/AODISTOXICKEKW",
      "manualBracketGroups": [
        {
          "key": "group-a",
          "title": "Group A",
          "rounds": [
            {
              "title": "Round 1",
              "matches": [
                {
                  "id": "2024a-r1m1",
                  "title": "2024A-R1M1",
                  "player1": "AARON",
                  "player2": "RAMBO",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "RAMBO",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024a-r1m2",
                  "title": "2024A-R1M2",
                  "player1": "WTF",
                  "player2": "SHEPPARD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "WTF",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 2",
              "matches": [
                {
                  "id": "2024a-r2m1",
                  "title": "2024A-R2M1",
                  "player1": "RAMBO",
                  "player2": "WTF",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "1",
                  "winner": "RAMBO",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024a-r2m2",
                  "title": "2024A-R2M2",
                  "player1": "FULLY",
                  "player2": "AARON",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "1",
                  "winner": "FULLY",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 3",
              "matches": [
                {
                  "id": "2024a-r3m1",
                  "title": "2024A-R3M1",
                  "player1": "WTF",
                  "player2": "FULLY",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "WTF",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024a-r3m2",
                  "title": "2024A-R3M2",
                  "player1": "SHEPPARD",
                  "player2": "RAMBO",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "RAMBO",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 4",
              "matches": [
                {
                  "id": "2024a-r4m1",
                  "title": "2024A-R4M1",
                  "player1": "FULLY",
                  "player2": "SHEPPARD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "FULLY",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024a-r4m2",
                  "title": "2024A-R4M2",
                  "player1": "AARON",
                  "player2": "WTF",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "WTF",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 5",
              "matches": [
                {
                  "id": "2024a-r5m1",
                  "title": "2024A-R5M1",
                  "player1": "SHEPPARD",
                  "player2": "AARON",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "AARON",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024a-r5m2",
                  "title": "2024A-R5M2",
                  "player1": "RAMBO",
                  "player2": "FULLY",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "RAMBO",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            }
          ]
        },
        {
          "key": "group-b",
          "title": "Group B",
          "rounds": [
            {
              "title": "Round 1",
              "matches": [
                {
                  "id": "2024b-r1m1",
                  "title": "2024B-R1M1",
                  "player1": "FERRET",
                  "player2": "GLORY PRUSSIA",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "2",
                  "winner": "FERRET",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024b-r1m2",
                  "title": "2024B-R1M2",
                  "player1": "KEREKOBAR",
                  "player2": "BROWN PUDDLE",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "KEREKOBAR",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 2",
              "matches": [
                {
                  "id": "2024b-r2m1",
                  "title": "2024B-R2M1",
                  "player1": "GLORY PRUSSIA",
                  "player2": "KEREKOBAR",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "GLORY PRUSSIA",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024b-r2m2",
                  "title": "2024B-R2M2",
                  "player1": "INCIA 3000",
                  "player2": "FERRET",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "3",
                  "winner": "FERRET",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 3",
              "matches": [
                {
                  "id": "2024b-r3m1",
                  "title": "2024B-R3M1",
                  "player1": "KEREKOBAR",
                  "player2": "INCIA 3000",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "INCIA 3000",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024b-r3m2",
                  "title": "2024B-R3M2",
                  "player1": "BROWN PUDDLE",
                  "player2": "GLORY PRUSSIA",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "2",
                  "score2": "3",
                  "winner": "GLORY PRUSSIA",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 4",
              "matches": [
                {
                  "id": "2024b-r4m1",
                  "title": "2024B-R4M1",
                  "player1": "INCIA 3000",
                  "player2": "BROWN PUDDLE",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "BROWN PUDDLE",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024b-r4m2",
                  "title": "2024B-R4M2",
                  "player1": "FERRET",
                  "player2": "KEREKOBAR",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "1",
                  "winner": "FERRET",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 5",
              "matches": [
                {
                  "id": "2024b-r5m1",
                  "title": "2024B-R5M1",
                  "player1": "BROWN PUDDLE",
                  "player2": "FERRET",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "3",
                  "winner": "FERRET",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024b-r5m2",
                  "title": "2024B-R5M2",
                  "player1": "GLORY PRUSSIA",
                  "player2": "INCIA 3000",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "GLORY PRUSSIA",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            }
          ]
        },
        {
          "key": "group-c",
          "title": "Group C",
          "rounds": [
            {
              "title": "Round 1",
              "matches": [
                {
                  "id": "2024c-r1m1",
                  "title": "2024C-R1M1",
                  "player1": "BRUZER",
                  "player2": "SAI",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "SAI",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024c-r1m2",
                  "title": "2024C-R1M2",
                  "player1": "KRISPY",
                  "player2": "JAMIETD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "JAMIETD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 2",
              "matches": [
                {
                  "id": "2024c-r2m1",
                  "title": "2024C-R2M1",
                  "player1": "SAI",
                  "player2": "KRISPY",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "SAI",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024c-r2m2",
                  "title": "2024C-R2M2",
                  "player1": "AOD",
                  "player2": "BRUZER",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "1",
                  "winner": "AOD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 3",
              "matches": [
                {
                  "id": "2024c-r3m1",
                  "title": "2024C-R3M1",
                  "player1": "KRISPY",
                  "player2": "AOD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "AOD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024c-r3m2",
                  "title": "2024C-R3M2",
                  "player1": "JAMIETD",
                  "player2": "SAI",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "3",
                  "winner": "SAI",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 4",
              "matches": [
                {
                  "id": "2024c-r4m1",
                  "title": "2024C-R4M1",
                  "player1": "AOD",
                  "player2": "JAMIETD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "2",
                  "score2": "3",
                  "winner": "JAMIETD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024c-r4m2",
                  "title": "2024C-R4M2",
                  "player1": "BRUZER",
                  "player2": "KRISPY",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "BRUZER",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 5",
              "matches": [
                {
                  "id": "2024c-r5m1",
                  "title": "2024C-R5M1",
                  "player1": "JAMIETD",
                  "player2": "BRUZER",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "2",
                  "winner": "JAMIETD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024c-r5m2",
                  "title": "2024C-R5M2",
                  "player1": "SAI",
                  "player2": "AOD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "3",
                  "winner": "AOD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            }
          ]
        },
        {
          "key": "group-d",
          "title": "Group D",
          "rounds": [
            {
              "title": "Round 1",
              "matches": [
                {
                  "id": "2024d-r1m1",
                  "title": "2024D-R1M1",
                  "player1": "DANKU",
                  "player2": "FILLSKILL",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "DANKU",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024d-r1m2",
                  "title": "2024D-R1M2",
                  "player1": "TRIOTD",
                  "player2": "JLGAZZA94",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "TRIOTD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 2",
              "matches": [
                {
                  "id": "2024d-r2m1",
                  "title": "2024D-R2M1",
                  "player1": "FILLSKILL",
                  "player2": "TRIOTD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "TRIOTD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024d-r2m2",
                  "title": "2024D-R2M2",
                  "player1": "NOBLESUB",
                  "player2": "DANKU",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "2",
                  "score2": "3",
                  "winner": "DANKU",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 3",
              "matches": [
                {
                  "id": "2024d-r3m1",
                  "title": "2024D-R3M1",
                  "player1": "TRIOTD",
                  "player2": "NOBLESUB",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "NOBLESUB",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024d-r3m2",
                  "title": "2024D-R3M2",
                  "player1": "JLGAZZA94",
                  "player2": "FILLSKILL",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "0",
                  "winner": "JLGAZZA94",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 4",
              "matches": [
                {
                  "id": "2024d-r4m1",
                  "title": "2024D-R4M1",
                  "player1": "NOBLESUB",
                  "player2": "JLGAZZA94",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "JLGAZZA94",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024d-r4m2",
                  "title": "2024D-R4M2",
                  "player1": "DANKU",
                  "player2": "TRIOTD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "3",
                  "winner": "TRIOTD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 5",
              "matches": [
                {
                  "id": "2024d-r5m1",
                  "title": "2024D-R5M1",
                  "player1": "JLGAZZA94",
                  "player2": "DANKU",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "1",
                  "winner": "JLGAZZA94",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2024d-r5m2",
                  "title": "2024D-R5M2",
                  "player1": "FILLSKILL",
                  "player2": "NOBLESUB",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "3",
                  "winner": "NOBLESUB",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            }
          ]
        },
        {
          "key": "replacement-playoff",
          "title": "Replacement Playoff",
          "rounds": [
            {
              "title": "Replacement Playoff",
              "matches": [
                {
                  "id": "replacement-playoff",
                  "title": "Replacement Playoff",
                  "player1": "FERRET",
                  "player2": "KRISPY",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "2",
                  "score2": "1",
                  "winner": "FERRET",
                  "note": "Bo3 · FERRET replaced RAMBO after withdrawal · owner-supplied historical recollection",
                  "time": ""
                }
              ]
            }
          ]
        },
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
                  "player1": "TRIOTD",
                  "player2": "WTF",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "4",
                  "winner": "WTF",
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
                  "player1": "FERRET",
                  "player2": "AOD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "",
                  "score2": "",
                  "winner": "AOD",
                  "note": "Bo9 · AOD won; exact score unknown · owner-supplied historical recollection",
                  "time": ""
                },
                {
                  "id": "sf2",
                  "title": "SF2",
                  "player1": "WTF",
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
          "name": "WTF",
          "seed": "2",
          "flag": "",
          "flagImage": "",
          "inGameName": "WTF CCC",
          "note": "Historical alias: WTF CCC"
        },
        {
          "name": "FULLY",
          "seed": "3",
          "flag": "",
          "flagImage": "",
          "inGameName": "FULLY CCC",
          "note": "Historical alias: FULLY CCC"
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
          "name": "JAMIETD",
          "seed": "13",
          "flag": "",
          "flagImage": "",
          "inGameName": "JAMIE",
          "note": "Historical alias: JAMIE"
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
          "name": "TRIOTD",
          "seed": "16",
          "flag": "",
          "flagImage": "",
          "inGameName": "TRIO",
          "note": "Historical alias: TRIO"
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
      "schedule": [],
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
          "name": "FERRET",
          "note": "Semi-finalist after replacing withdrawn RAMBO"
        },
        {
          "place": "3rd",
          "name": "WTF",
          "note": "Semi-finalist"
        }
      ],
      "stageSummaries": [
        {
          "title": "Group A",
          "entries": [
            "RAMBO — 12 pts",
            "WTF — 10 pts",
            "FULLY — 6 pts",
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
            "JAMIETD — 10 pts",
            "BRUZER — 6 pts",
            "KRISPY — 0 pts"
          ]
        },
        {
          "title": "Group D",
          "entries": [
            "TRIOTD — 9 pts",
            "JLGAZZA94 — 9 pts",
            "DANKU — 8 pts",
            "NOBLESUB — 8 pts",
            "FILLSKILL — 0 pts"
          ]
        }
      ]
    },
    {
      "id": "td-home-nations-championship-2023",
      "status": "completed",
      "title": "TD Home Nations Championship 2023",
      "subtitle": "Ten Tiberian Dawn players represented the UK and Ireland in two groups",
      "organizer": "JLGAZZA94",
      "game": "Command & Conquer: Tiberian Dawn",
      "format": "Group Stage and Single Elimination",
      "competitorStructure": "1v1",
      "startDate": "2023-09-11 19:10",
      "endDate": "",
      "timezone": "BST",
      "prizePool": "",
      "bannerImage": "/assets/tbanners/td-home-nations-2023.webp",
      "description": "Ten Tiberian Dawn players entered two groups of five. The top two from each group advanced to best-of-nine semi-finals and a best-of-eleven Grand Final.",
      "registrationMode": "closed",
      "registrationUrl": "",
      "participantSource": "manual",
      "streamUrl": "",
      "rulesUrl": "/assets/trules/td-home-nations-2023-rules.pdf",
      "bracketMode": "manual",
      "bracketTitle": "Final bracket",
      "bracketEmbedUrl": "",
      "bracketUrl": "https://challonge.com/4fjkeheh",
      "manualBracketGroups": [
        {
          "key": "group-a",
          "title": "Group A",
          "rounds": [
            {
              "title": "Round 1",
              "matches": [
                {
                  "id": "2023ha-r1m1",
                  "title": "2023HA-R1M1",
                  "player1": "CRITICAL MEDS",
                  "player2": "RASHNAGAR",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "2",
                  "score2": "4",
                  "winner": "RASHNAGAR",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2023ha-r1m2",
                  "title": "2023HA-R1M2",
                  "player1": "ADAM",
                  "player2": "DANKU",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "4",
                  "score2": "2",
                  "winner": "ADAM",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 2",
              "matches": [
                {
                  "id": "2023ha-r2m1",
                  "title": "2023HA-R2M1",
                  "player1": "RASHNAGAR",
                  "player2": "ADAM",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "4",
                  "score2": "0",
                  "winner": "RASHNAGAR",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2023ha-r2m2",
                  "title": "2023HA-R2M2",
                  "player1": "AARON",
                  "player2": "CRITICAL MEDS",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "4",
                  "winner": "CRITICAL MEDS",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 3",
              "matches": [
                {
                  "id": "2023ha-r3m1",
                  "title": "2023HA-R3M1",
                  "player1": "ADAM",
                  "player2": "AARON",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "4",
                  "winner": "AARON",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2023ha-r3m2",
                  "title": "2023HA-R3M2",
                  "player1": "DANKU",
                  "player2": "RASHNAGAR",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "2",
                  "score2": "4",
                  "winner": "RASHNAGAR",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 4",
              "matches": [
                {
                  "id": "2023ha-r4m1",
                  "title": "2023HA-R4M1",
                  "player1": "AARON",
                  "player2": "DANKU",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "4",
                  "score2": "3",
                  "winner": "AARON",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2023ha-r4m2",
                  "title": "2023HA-R4M2",
                  "player1": "CRITICAL MEDS",
                  "player2": "ADAM",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "4",
                  "score2": "1",
                  "winner": "CRITICAL MEDS",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 5",
              "matches": [
                {
                  "id": "2023ha-r5m1",
                  "title": "2023HA-R5M1",
                  "player1": "DANKU",
                  "player2": "CRITICAL MEDS",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "4",
                  "winner": "CRITICAL MEDS",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2023ha-r5m2",
                  "title": "2023HA-R5M2",
                  "player1": "RASHNAGAR",
                  "player2": "AARON",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "4",
                  "score2": "0",
                  "winner": "RASHNAGAR",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            }
          ]
        },
        {
          "key": "group-b",
          "title": "Group B",
          "rounds": [
            {
              "title": "Round 1",
              "matches": [
                {
                  "id": "2023hb-r1m1",
                  "title": "2023HB-R1M1",
                  "player1": "AOD",
                  "player2": "BRUZER",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "4",
                  "score2": "1",
                  "winner": "AOD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2023hb-r1m2",
                  "title": "2023HB-R1M2",
                  "player1": "JAMIETD",
                  "player2": "KHANOMANCER",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "4",
                  "score2": "0",
                  "winner": "JAMIETD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 2",
              "matches": [
                {
                  "id": "2023hb-r2m1",
                  "title": "2023HB-R2M1",
                  "player1": "BRUZER",
                  "player2": "JAMIETD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "4",
                  "winner": "JAMIETD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2023hb-r2m2",
                  "title": "2023HB-R2M2",
                  "player1": "BROTHERHOOD OF LAG",
                  "player2": "AOD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "0",
                  "score2": "4",
                  "winner": "AOD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 3",
              "matches": [
                {
                  "id": "2023hb-r3m1",
                  "title": "2023HB-R3M1",
                  "player1": "JAMIETD",
                  "player2": "BROTHERHOOD OF LAG",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "4",
                  "score2": "3",
                  "winner": "JAMIETD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2023hb-r3m2",
                  "title": "2023HB-R3M2",
                  "player1": "KHANOMANCER",
                  "player2": "BRUZER",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "2",
                  "score2": "4",
                  "winner": "BRUZER",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 4",
              "matches": [
                {
                  "id": "2023hb-r4m1",
                  "title": "2023HB-R4M1",
                  "player1": "BROTHERHOOD OF LAG",
                  "player2": "KHANOMANCER",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "4",
                  "score2": "1",
                  "winner": "BROTHERHOOD OF LAG",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2023hb-r4m2",
                  "title": "2023HB-R4M2",
                  "player1": "AOD",
                  "player2": "JAMIETD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "3",
                  "score2": "4",
                  "winner": "JAMIETD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            },
            {
              "title": "Round 5",
              "matches": [
                {
                  "id": "2023hb-r5m1",
                  "title": "2023HB-R5M1",
                  "player1": "KHANOMANCER",
                  "player2": "AOD",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "4",
                  "winner": "AOD",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                },
                {
                  "id": "2023hb-r5m2",
                  "title": "2023HB-R5M2",
                  "player1": "BRUZER",
                  "player2": "BROTHERHOOD OF LAG",
                  "slot1From": "",
                  "slot2From": "",
                  "score1": "1",
                  "score2": "4",
                  "winner": "BROTHERHOOD OF LAG",
                  "note": "Group stage · screenshot evidence supplied by owner",
                  "time": ""
                }
              ]
            }
          ]
        },
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
                  "player1": "JAMIETD",
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
          "name": "JAMIETD",
          "seed": "6",
          "flag": "",
          "flagImage": "",
          "inGameName": "JAMIE TD",
          "note": "Historical alias: JAMIE TD"
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
      "schedule": [],
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
          "name": "JAMIETD",
          "note": "Semi-finalist"
        },
        {
          "place": "3rd",
          "name": "RASHNAGAR",
          "note": "Semi-finalist"
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
            "JAMIETD — 16 pts",
            "AOD — 15 pts",
            "BROTHERHOOD OF LAG — 11 pts",
            "BRUZER — 7 pts",
            "KHANOMANCER — 4 pts"
          ]
        }
      ]
    },
    {
      "id": "td-oceania-championship-2023",
      "status": "completed",
      "title": "TD Oceania Championship 2023",
      "subtitle": "Six Tiberian Dawn players contested an Oceania round robin",
      "organizer": "JLGAZZA94",
      "game": "Command & Conquer: Tiberian Dawn",
      "format": "Round Robin",
      "competitorStructure": "1v1",
      "startDate": "2023-08-21 19:07",
      "endDate": "",
      "timezone": "BST",
      "prizePool": "",
      "bannerImage": "/assets/tbanners/td-oceania-2023.webp",
      "description": "A six-player Tiberian Dawn round robin in which every player faced all five opponents. The archived table records the completed event standings.",
      "registrationMode": "closed",
      "registrationUrl": "",
      "participantSource": "manual",
      "streamUrl": "",
      "rulesUrl": "/assets/trules/td-oceania-2023-rules.pdf",
      "bracketMode": "manual",
      "bracketTitle": "Round Robin Results",
      "bracketEmbedUrl": "",
      "bracketUrl": "https://challonge.com/vaxcgqjl",
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
      "schedule": [],
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
