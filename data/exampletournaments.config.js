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
- Options: "live", "upcoming", "completed"
- Required.
- Results only show when status is "completed".

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
rules: [
  "Rule one",
  "Rule two"
]

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

window.KRISPY_TOURNAMENTS = {
  currentEventId: null,
  events: [
    /*
    ADD EVENT OBJECTS HERE.

    EXAMPLE SINGLE ELIMINATION EVENT:
    {
      id: "my-single-elim-event",
      status: "upcoming",
      title: "My Tournament Title",
      subtitle: "Optional short subtitle",
      organizer: "Your Name",
      game: "Game Name",
      format: "Single Elimination",
      startDate: "2026-07-20 18:00",
      endDate: "2026-07-20 22:00",
      timezone: "UTC+0",
      prizePool: "£0",
      bannerImage: "",
      description: "Optional description.",
      registrationMode: "external",
      registrationUrl: "https://krispykp.com/contact.html#tournament-signup",
      streamUrl: "",
      rulesUrl: "",
      bracketMode: "manual",
      bracketTitle: "Tournament Bracket",
      manualBracketGroups: [
        {
          key: "main",
          title: "Tournament Bracket",
          rounds: [
            {
              title: "Semi Finals",
              matches: [
                {
                  id: "sf1",
                  title: "SF1",
                  player1: "Player A",
                  player2: "Player B",
                  score1: "",
                  score2: "",
                  winner: "",
                  note: "Bo3",
                  time: "2026-07-20 18:00 UTC"
                }
              ]
            }
          ]
        }
      ],
      players: [],
      schedule: [],
      rules: [],
      results: []
    }
    */

    /*

    ====================================================================================================
    ====================================================================================================
    ====================================================================================================
    ====================================================================================================
    ====================================================================================================
    ====================================================================================================

    window.KRISPY_TOURNAMENTS = {
    currentEventId: null,
    events: [
      {
        id: "td-double-elim-live",
        status: "live",
        title: "Tiberian Dawn Double Elim Showcase",
        subtitle: "Live community broadcast event",

        hostType: "self",
        organizer: "KrispyKP",

        game: "Command & Conquer: Tiberian Dawn",
        format: "Double Elimination",
        startDate: "2026-07-20 18:00",
        endDate: "2026-07-20 23:30",
        timezone: "UTC+0",
        prizePool: "£150",
        bannerImage: "assets/tournaments/test-live-banner.jpg",

        description:
          "A fully mocked live tournament used to test the redesigned tournament page. This event includes winners bracket, losers bracket, and a grand final so the grouped manual bracket layout can be tested properly.",

        registrationMode: "closed",
        registrationUrl: "",
        participantSource: "manual",

        streamUrl: "https://www.twitch.tv/KrispyKP",
        rulesUrl: "assets/tournaments/test-live-rules.pdf",

        bracketMode: "manual",
        bracketTitle: "Tournament Bracket",

        manualBracketGroups: [
          {
            key: "winners",
            title: "Winners Bracket",
            rounds: [
              {
                title: "Winners Round 1",
                matches: [
                  {
                    id: "wb1",
                    title: "WB1",
                    player1: "KrispyKP",
                    player2: "IronFox",
                    score1: "2",
                    score2: "0",
                    winner: "KrispyKP",
                    note: "Bo3",
                    time: "2026-07-20 18:00 UTC"
                  },
                ]
              },
            ]
          },
          {
            key: "losers",
            title: "Losers Bracket",
            rounds: [
              {
                title: "Losers Round 1",
                matches: [
                  {
                    id: "lb1",
                    title: "LB1",
                    player1: "IronFox",
                    player2: "Jamie",
                    score1: "2",
                    score2: "0",
                    winner: "IronFox",
                    note: "Bo3",
                    time: "2026-07-20 20:00 UTC"
                  },
                ]
              }
            ]
          },
          {
            key: "grand-final",
            title: "Grand Final",
            rounds: [
              {
                title: "Grand Final",
                matches: [
                  {
                    id: "gf",
                    title: "GF",
                    slot1From: "wbf",
                    slot2From: "lbf",
                    player1: "Nomad",
                    player2: "KrispyKP",
                    score1: "2",
                    score2: "1",
                    winner: "",
                    note: "Bo7 - Live",
                    time: "2026-07-20 23:00 UTC"
                  }
                ]
              }
            ]
          }
        ],

        players: [
          { name: "KrispyKP", seed: 1, note: "Host", discord: "KrispyKP", flag: "Scotland", flagImage: FLAG_SVGS.scotland },
          { name: "IronFox", seed: 2, discord: "ironfox", flag: "Germany", flagImage: FLAG_SVGS.germany },
          { name: "Meds", seed: 3, discord: "meds", flag: "England", flagImage: FLAG_SVGS.england },
          { name: "Jamie", seed: 4, discord: "jamie", flag: "Wales", flagImage: FLAG_SVGS.wales },
          { name: "Gazza", seed: 5, discord: "gazza", flag: "Croatia", flagImage: FLAG_SVGS.croatia },
          { name: "Bruzer", seed: 6, discord: "bruzer", flag: "Canada", flagImage: FLAG_SVGS.canada },
          { name: "Delta", discord: "delta_td", flag: "Ireland", flagImage: FLAG_SVGS.ireland },
          { name: "Nomad", flag: "England", flagImage: FLAG_SVGS.england, note: "Guest Player" }
        ],

        schedule: [
          { title: "Player Check-In Opens", date: "2026-07-20", time: "17:15", timezone: "UTC+0" },
          { title: "Broadcast Begins", date: "2026-07-20", time: "17:45", timezone: "UTC+0" },
          { title: "Winners Round 1 Matches Start", date: "2026-07-20", time: "18:00", timezone: "UTC+0" },
          { title: "Losers Round 1 Matches Start", date: "2026-07-20", time: "20:00", timezone: "UTC+0" },
          { title: "Winners Final Matches Start", date: "2026-07-20", time: "21:30", timezone: "UTC+0" },
          { title: "Losers Final Matches Start", date: "2026-07-20", time: "22:15", timezone: "UTC+0" },
          { title: "Grand Final Matches Start", date: "2026-07-20", time: "23:00", timezone: "UTC+0" }
        ],

        rules: [
          "All matches are played on the approved tournament patch version.",
          "Players must be ready within 10 minutes of their scheduled start time.",
          "Map vetoes must be completed before the match lobby is launched.",
          "Disconnect rulings are decided by the tournament admin.",
          "Unsportsmanlike conduct may lead to warnings or disqualification."
        ],

        results: []
      },

      {
        id: "ra-weekender-upcoming",
        status: "upcoming",
        title: "Red Alert Weekender #2",
        subtitle: "Upcoming bracket preview event",

        hostType: "self",
        organizer: "KrispyKP",

        game: "Command & Conquer: Red Alert",
        format: "Single Elimination",
        startDate: "2026-08-08 18:00",
        endDate: "2026-08-09 22:00",
        timezone: "UTC+0",
        prizePool: "£75",
        bannerImage: "assets/tournaments/test-upcoming-banner.jpg",

        description:
          "A second fake event included to populate the event switcher and test how upcoming tournaments sit beneath a featured live one. This one uses a single manual bracket group.",

        registrationMode: "external",
        registrationUrl: "https://example.com/register/red-alert-weekender-2",
        participantSource: "manual",

        streamUrl: "https://www.twitch.tv/KrispyKP",
        rulesUrl: "assets/tournaments/test-upcoming-rules.pdf",

        bracketMode: "manual",
        bracketTitle: "Projected Bracket",

        manualBracketGroups: [
          {
            key: "main",
            title: "Projected Bracket",
            rounds: [
              {
                title: "Quarter Finals",
                matches: [
                  { id: "raqf1", title: "QF1", player1: "AlphaOne", player2: "Bravo", score1: "", score2: "", winner: "", note: "Bo3", time: "2026-08-08 18:00 UTC" },
                  { id: "raqf2", title: "QF2", player1: "Charlie", player2: "Delta", score1: "", score2: "", winner: "", note: "Bo3", time: "2026-08-08 18:30 UTC" },
                  { id: "raqf3", title: "QF3", player1: "Echo", player2: "Foxtrot", score1: "", score2: "", winner: "", note: "Bo3", time: "2026-08-08 19:00 UTC" },
                  { id: "raqf4", title: "QF4", player1: "Ghost", player2: "Havoc", score1: "", score2: "", winner: "", note: "Bo3", time: "2026-08-08 19:30 UTC" }
                ]
              },
              {
                title: "Semi Finals",
                matches: [
                  { id: "rasf1", title: "SF1", slot1From: "raqf1", slot2From: "raqf2", player1: "TBD", player2: "TBD", score1: "", score2: "", winner: "", note: "Bo5", time: "2026-08-09 19:00 UTC" },
                  { id: "rasf2", title: "SF2", slot1From: "raqf3", slot2From: "raqf4", player1: "TBD", player2: "TBD", score1: "", score2: "", winner: "", note: "Bo5", time: "2026-08-09 19:45 UTC" }
                ]
              },
              {
                title: "Final",
                matches: [
                  { id: "raf", title: "Final", slot1From: "rasf1", slot2From: "rasf2", player1: "TBD", player2: "TBD", score1: "", score2: "", winner: "", note: "Bo7", time: "2026-08-09 21:00 UTC" }
                ]
              }
            ]
          }
        ],

        players: [
          { name: "AlphaOne", seed: 1, discord: "alphaone", flag: "USA", flagImage: FLAG_SVGS.usa },
          { name: "Bravo", seed: 2, discord: "bravo", flag: "Spain", flagImage: FLAG_SVGS.spain },
          { name: "Charlie", seed: 3, discord: "charlie", flag: "Sweden", flagImage: FLAG_SVGS.sweden },
          { name: "Delta", seed: 4, discord: "delta", flag: "Finland", flagImage: FLAG_SVGS.finland },
          { name: "Echo", seed: 5, discord: "echo", flag: "Belgium", flagImage: FLAG_SVGS.belgium },
          { name: "Foxtrot", discord: "foxtrot", flag: "Slovenia", flagImage: FLAG_SVGS.slovenia },
          { name: "Ghost", flag: "Russia", flagImage: FLAG_SVGS.russia },
          { name: "Havoc", note: "Late Signup", flag: "Ukraine", flagImage: FLAG_SVGS.ukraine }
        ],

        schedule: [
          { title: "Signups Close", date: "2026-08-06", time: "23:59", timezone: "UTC+0" },
          { title: "Bracket Reveal", date: "2026-08-07", time: "19:00", timezone: "UTC+0" },
          { title: "Quarter Finals Matches Start", date: "2026-08-08", time: "18:00", timezone: "UTC+0" },
          { title: "Semi Finals Matches Start", date: "2026-08-09", time: "19:00", timezone: "UTC+0" },
          { title: "Grand Final Matches Start", date: "2026-08-09", time: "21:00", timezone: "UTC+0" }
        ],

        rules: [
          "Standard tournament maps only.",
          "Observers are allowed only on designated stream matches.",
          "Players must report scores immediately after each match.",
          "Replay files may be requested for admin review."
        ],

        results: []
      },

      {
        id: "sole-survivor-classic-complete",
        status: "completed",
        title: "Sole Survivor Cup Classic",
        subtitle: "Completed archive test event",

        hostType: "self",
        organizer: "KrispyKP",

        game: "Command & Conquer: Sole Survivor",
        format: "Round Robin into Final",
        startDate: "2026-05-10 17:00",
        endDate: "2026-05-10 22:00",
        timezone: "UTC+0",
        prizePool: "£50",
        bannerImage: "assets/tournaments/test-completed-banner.jpg",

        description:
          "A completed mock event used to populate the archive and results areas. This gives you a proper past-event example with filled results.",

        registrationMode: "none",
        registrationUrl: "",
        participantSource: "manual",

        streamUrl: "https://www.twitch.tv/KrispyKP",
        rulesUrl: "assets/tournaments/test-completed-rules.pdf",

        bracketMode: "manual",
        bracketTitle: "Completed Bracket",

        manualBracketGroups: [
          {
            key: "main",
            title: "Completed Bracket",
            rounds: [
              {
                title: "Semi Finals",
                matches: [
                  { id: "sssf1", title: "SF1", player1: "Nomad", player2: "Rift", score1: "2", score2: "1", winner: "Nomad", note: "Bo3", time: "2026-05-10 19:00 UTC" },
                  { id: "sssf2", title: "SF2", player1: "Vortex", player2: "Shade", score1: "0", score2: "2", winner: "Shade", note: "Bo3", time: "2026-05-10 19:45 UTC" }
                ]
              },
              {
                title: "Grand Final",
                matches: [
                  { id: "ssgf", title: "GF", slot1From: "sssf1", slot2From: "sssf2", player1: "Nomad", player2: "Shade", score1: "3", score2: "2", winner: "Nomad", note: "Bo5", time: "2026-05-10 21:00 UTC" }
                ]
              }
            ]
          }
        ],

        players: [
          { name: "Nomad", seed: 1, discord: "nomad", flag: "England", flagImage: FLAG_SVGS.england },
          { name: "Rift", seed: 2, discord: "rift", flag: "🇺🇸" },
          { name: "Vortex", seed: 3, discord: "vortex", flag: "🇩🇪" },
          { name: "Shade", flag: "🇳🇴" }
        ],

        schedule: [
          { title: "Check-In Opens", date: "2026-05-10", time: "16:30", timezone: "UTC+0" },
          { title: "Group Stage Matches Start", date: "2026-05-10", time: "17:00", timezone: "UTC+0" },
          { title: "Semi Finals Matches Start", date: "2026-05-10", time: "19:00", timezone: "UTC+0" },
          { title: "Grand Final Matches Start", date: "2026-05-10", time: "21:00", timezone: "UTC+0" }
        ],

        rules: [
          "Round robin standings are decided by wins, then head-to-head.",
          "Grand Final is played as best of five.",
          "Admins may remake lobbies if major technical issues occur."
        ],

        results: [
          { place: "1st", name: "Nomad", note: "Champion" },
          { place: "2nd", name: "Shade", note: "Runner-up" },
          { place: "3rd", name: "Rift", note: "Semi Finalist" },
          { place: "4th", name: "Vortex", note: "Semi Finalist" }
        ]
      } 
    */
  ]
};