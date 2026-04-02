/*
========================================
KRISPYKP TOURNAMENT CONFIG GUIDE
========================================

This file controls the tournaments page.

RULE FOR MANUAL BRACKETS
------------------------
Use manualBracketGroups for every manual event.

Single bracket event:
- manualBracketGroups contains 1 entry

Double elimination event:
- manualBracketGroups contains multiple entries
  e.g. Winners Bracket / Losers Bracket / Grand Final

OPTIONAL FLAG IMAGE SUPPORT
---------------------------
Players can now use:
- flag: "Scotland"
- flagImage: "<svg/png path or data URI>"

If flagImage exists, it will be shown instead of emoji text.

SCHEDULE FORMAT
---------------
Prefer:
{
  title: "Winners Final Matches Start",
  date: "2026-07-20",
  time: "21:30",
  timezone: "UTC+0"
}

BRACKET GROUNDWORK
------------------
Manual matches can optionally include:
- id
- slot1From
- slot2From

This gives the renderer enough data to show feed sources now
and makes future connector upgrades easier.

SAFE EMPTY DEFAULTS
-------------------
Prefer:
players: []
schedule: []
rules: []
results: []

========================================
END OF GUIDE
========================================
*/

(function () {
  function svgDataUri(svg) {
    return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
  }

  const FLAG_SVGS = {
    scotland: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="48" fill="#005eb8"/>
        <path d="M0 0 L22 0 L64 31 L64 48 L42 48 L0 17 Z" fill="#fff"/>
        <path d="M64 0 L42 0 L0 31 L0 48 L22 48 L64 17 Z" fill="#fff"/>
      </svg>
    `),
    england: svgDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48">
        <rect width="64" height="48" fill="#ffffff"/>
        <rect x="26" width="12" height="48" fill="#cf142b"/>
        <rect y="18" width="64" height="12" fill="#cf142b"/>
      </svg>
    `)
  };

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
                  {
                    id: "wb2",
                    title: "WB2",
                    player1: "Meds",
                    player2: "Jamie",
                    score1: "2",
                    score2: "1",
                    winner: "Meds",
                    note: "Bo3",
                    time: "2026-07-20 18:30 UTC"
                  },
                  {
                    id: "wb3",
                    title: "WB3",
                    player1: "Gazza",
                    player2: "Bruzer",
                    score1: "1",
                    score2: "2",
                    winner: "Bruzer",
                    note: "Bo3",
                    time: "2026-07-20 19:00 UTC"
                  },
                  {
                    id: "wb4",
                    title: "WB4",
                    player1: "Delta",
                    player2: "Nomad",
                    score1: "0",
                    score2: "2",
                    winner: "Nomad",
                    note: "Bo3",
                    time: "2026-07-20 19:30 UTC"
                  }
                ]
              },
              {
                title: "Winners Semi Finals",
                matches: [
                  {
                    id: "wbsf1",
                    title: "WBSF1",
                    slot1From: "wb1",
                    slot2From: "wb2",
                    player1: "KrispyKP",
                    player2: "Meds",
                    score1: "2",
                    score2: "1",
                    winner: "KrispyKP",
                    note: "Bo3",
                    time: "2026-07-20 20:15 UTC"
                  },
                  {
                    id: "wbsf2",
                    title: "WBSF2",
                    slot1From: "wb3",
                    slot2From: "wb4",
                    player1: "Bruzer",
                    player2: "Nomad",
                    score1: "0",
                    score2: "2",
                    winner: "Nomad",
                    note: "Bo3",
                    time: "2026-07-20 20:45 UTC"
                  }
                ]
              },
              {
                title: "Winners Final",
                matches: [
                  {
                    id: "wbf",
                    title: "WBF",
                    slot1From: "wbsf1",
                    slot2From: "wbsf2",
                    player1: "KrispyKP",
                    player2: "Nomad",
                    score1: "1",
                    score2: "2",
                    winner: "Nomad",
                    note: "Bo5",
                    time: "2026-07-20 21:30 UTC"
                  }
                ]
              }
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
                  {
                    id: "lb2",
                    title: "LB2",
                    player1: "Gazza",
                    player2: "Delta",
                    score1: "2",
                    score2: "1",
                    winner: "Gazza",
                    note: "Bo3",
                    time: "2026-07-20 20:00 UTC"
                  }
                ]
              },
              {
                title: "Losers Quarter Finals",
                matches: [
                  {
                    id: "lbqf1",
                    title: "LBQF1",
                    slot1From: "lb1",
                    slot2From: "wb3",
                    player1: "IronFox",
                    player2: "Bruzer",
                    score1: "0",
                    score2: "2",
                    winner: "Bruzer",
                    note: "Bo3",
                    time: "2026-07-20 21:00 UTC"
                  },
                  {
                    id: "lbqf2",
                    title: "LBQF2",
                    slot1From: "lb2",
                    slot2From: "wb2",
                    player1: "Gazza",
                    player2: "Meds",
                    score1: "1",
                    score2: "2",
                    winner: "Meds",
                    note: "Bo3",
                    time: "2026-07-20 21:00 UTC"
                  }
                ]
              },
              {
                title: "Losers Semi Final",
                matches: [
                  {
                    id: "lbsf",
                    title: "LBSF",
                    slot1From: "lbqf1",
                    slot2From: "lbqf2",
                    player1: "Bruzer",
                    player2: "Meds",
                    score1: "2",
                    score2: "1",
                    winner: "Bruzer",
                    note: "Bo3",
                    time: "2026-07-20 21:45 UTC"
                  }
                ]
              },
              {
                title: "Losers Final",
                matches: [
                  {
                    id: "lbf",
                    title: "LBF",
                    slot1From: "lbsf",
                    slot2From: "wbsf1",
                    player1: "Bruzer",
                    player2: "KrispyKP",
                    score1: "1",
                    score2: "2",
                    winner: "KrispyKP",
                    note: "Bo5",
                    time: "2026-07-20 22:15 UTC"
                  }
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
          { name: "IronFox", seed: 2, discord: "ironfox", flag: "🇩🇪" },
          { name: "Meds", seed: 3, discord: "meds", flag: "Scotland", flagImage: FLAG_SVGS.scotland },
          { name: "Jamie", seed: 4, discord: "jamie", flag: "Scotland", flagImage: FLAG_SVGS.scotland },
          { name: "Gazza", seed: 5, discord: "gazza", flag: "Scotland", flagImage: FLAG_SVGS.scotland },
          { name: "Bruzer", seed: 6, discord: "bruzer", flag: "Scotland", flagImage: FLAG_SVGS.scotland },
          { name: "Delta", discord: "delta_td", flag: "🇺🇸" },
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
          { name: "AlphaOne", seed: 1, discord: "alphaone", flag: "England", flagImage: FLAG_SVGS.england },
          { name: "Bravo", seed: 2, discord: "bravo", flag: "🇫🇷" },
          { name: "Charlie", seed: 3, discord: "charlie", flag: "🇳🇱" },
          { name: "Delta", seed: 4, discord: "delta", flag: "🇩🇪" },
          { name: "Echo", seed: 5, discord: "echo", flag: "🇸🇪" },
          { name: "Foxtrot", discord: "foxtrot", flag: "🇵🇱" },
          { name: "Ghost", flag: "🇺🇸" },
          { name: "Havoc", note: "Late Signup", flag: "🇨🇦" }
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
    ]
  };
})();