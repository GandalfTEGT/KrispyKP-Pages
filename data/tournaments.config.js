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

SAFE EMPTY DEFAULTS
-------------------
Prefer:
players: []
schedule: []
rules: []
featuredMatches: []
results: []

========================================
END OF GUIDE
========================================
*/

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
        "A fully mocked live tournament used to test the redesigned tournament page. This one includes winners bracket, losers bracket, and a grand final so the full manual bracket layout can be tested.",

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
                { title: "WB1", player1: "KrispyKP", player2: "IronFox", score1: "2", score2: "0", winner: "KrispyKP", note: "Bo3", time: "2026-07-20 18:00 UTC" },
                { title: "WB2", player1: "Meds", player2: "Jamie", score1: "2", score2: "1", winner: "Meds", note: "Bo3", time: "2026-07-20 18:30 UTC" },
                { title: "WB3", player1: "Gazza", player2: "Bruzer", score1: "1", score2: "2", winner: "Bruzer", note: "Bo3", time: "2026-07-20 19:00 UTC" },
                { title: "WB4", player1: "Delta", player2: "Nomad", score1: "0", score2: "2", winner: "Nomad", note: "Bo3", time: "2026-07-20 19:30 UTC" }
              ]
            },
            {
              title: "Winners Semi Finals",
              matches: [
                { title: "WBSF1", player1: "KrispyKP", player2: "Meds", score1: "2", score2: "1", winner: "KrispyKP", note: "Bo3", time: "2026-07-20 20:15 UTC" },
                { title: "WBSF2", player1: "Bruzer", player2: "Nomad", score1: "0", score2: "2", winner: "Nomad", note: "Bo3", time: "2026-07-20 20:45 UTC" }
              ]
            },
            {
              title: "Winners Final",
              matches: [
                { title: "WBF", player1: "KrispyKP", player2: "Nomad", score1: "1", score2: "2", winner: "Nomad", note: "Bo5", time: "2026-07-20 21:30 UTC" }
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
                { title: "LB1", player1: "IronFox", player2: "Jamie", score1: "2", score2: "0", winner: "IronFox", note: "Bo3", time: "2026-07-20 20:00 UTC" },
                { title: "LB2", player1: "Gazza", player2: "Delta", score1: "2", score2: "1", winner: "Gazza", note: "Bo3", time: "2026-07-20 20:00 UTC" }
              ]
            },
            {
              title: "Losers Quarter Finals",
              matches: [
                { title: "LBQF1", player1: "IronFox", player2: "Bruzer", score1: "0", score2: "2", winner: "Bruzer", note: "Bo3", time: "2026-07-20 21:00 UTC" },
                { title: "LBQF2", player1: "Gazza", player2: "Meds", score1: "1", score2: "2", winner: "Meds", note: "Bo3", time: "2026-07-20 21:00 UTC" }
              ]
            },
            {
              title: "Losers Semi Final",
              matches: [
                { title: "LBSF", player1: "Bruzer", player2: "Meds", score1: "2", score2: "1", winner: "Bruzer", note: "Bo3", time: "2026-07-20 21:45 UTC" }
              ]
            },
            {
              title: "Losers Final",
              matches: [
                { title: "LBF", player1: "Bruzer", player2: "KrispyKP", score1: "1", score2: "2", winner: "KrispyKP", note: "Bo5", time: "2026-07-20 22:15 UTC" }
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
                { title: "GF", player1: "Nomad", player2: "KrispyKP", score1: "2", score2: "1", winner: "", note: "Bo7 - Live", time: "2026-07-20 23:00 UTC" }
              ]
            }
          ]
        }
      ],

      players: [
        { name: "KrispyKP", seed: 1, note: "Host", discord: "KrispyKP", flag: "🏴" },
        { name: "IronFox", seed: 2, discord: "ironfox", flag: "🇩🇪" },
        { name: "Meds", seed: 3, discord: "meds", flag: "🏴" },
        { name: "Jamie", seed: 4, discord: "jamie", flag: "🏴" },
        { name: "Gazza", seed: 5, discord: "gazza", flag: "🏴" },
        { name: "Bruzer", seed: 6, discord: "bruzer", flag: "🏴" },
        { name: "Delta", discord: "delta_td", flag: "🇺🇸" },
        { name: "Nomad", flag: "🇬🇧", note: "Guest Player" }
      ],

      schedule: [
        { label: "Player check-in", value: "2026-07-20 17:15 UTC" },
        { label: "Broadcast begins", value: "2026-07-20 17:45 UTC" },
        { label: "Winners Round 1", value: "2026-07-20 18:00 UTC" },
        { label: "Losers Round 1", value: "2026-07-20 20:00 UTC" },
        { label: "Winners Final", value: "2026-07-20 21:30 UTC" },
        { label: "Losers Final", value: "2026-07-20 22:15 UTC" },
        { label: "Grand Final", value: "2026-07-20 23:00 UTC" }
      ],

      rules: [
        "All matches are played on the approved tournament patch version.",
        "Players must be ready within 10 minutes of their scheduled start time.",
        "Map vetoes must be completed before the match lobby is launched.",
        "Disconnect rulings are decided by the tournament admin.",
        "Unsportsmanlike conduct may lead to warnings or disqualification."
      ],

      featuredMatches: [
        { title: "Live Main Event", players: "Nomad vs KrispyKP", time: "2026-07-20 23:00 UTC" },
        { title: "Losers Final Feature", players: "Bruzer vs KrispyKP", time: "2026-07-20 22:15 UTC" }
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
                { title: "QF1", player1: "AlphaOne", player2: "Bravo", score1: "", score2: "", winner: "", note: "Bo3", time: "2026-08-08 18:00 UTC" },
                { title: "QF2", player1: "Charlie", player2: "Delta", score1: "", score2: "", winner: "", note: "Bo3", time: "2026-08-08 18:30 UTC" },
                { title: "QF3", player1: "Echo", player2: "Foxtrot", score1: "", score2: "", winner: "", note: "Bo3", time: "2026-08-08 19:00 UTC" },
                { title: "QF4", player1: "Ghost", player2: "Havoc", score1: "", score2: "", winner: "", note: "Bo3", time: "2026-08-08 19:30 UTC" }
              ]
            },
            {
              title: "Semi Finals",
              matches: [
                { title: "SF1", player1: "TBD", player2: "TBD", score1: "", score2: "", winner: "", note: "Bo5", time: "2026-08-09 19:00 UTC" },
                { title: "SF2", player1: "TBD", player2: "TBD", score1: "", score2: "", winner: "", note: "Bo5", time: "2026-08-09 19:45 UTC" }
              ]
            },
            {
              title: "Final",
              matches: [
                { title: "Final", player1: "TBD", player2: "TBD", score1: "", score2: "", winner: "", note: "Bo7", time: "2026-08-09 21:00 UTC" }
              ]
            }
          ]
        }
      ],

      players: [
        { name: "AlphaOne", seed: 1, discord: "alphaone", flag: "🇬🇧" },
        { name: "Bravo", seed: 2, discord: "bravo", flag: "🇫🇷" },
        { name: "Charlie", seed: 3, discord: "charlie", flag: "🇳🇱" },
        { name: "Delta", seed: 4, discord: "delta", flag: "🇩🇪" },
        { name: "Echo", seed: 5, discord: "echo", flag: "🇸🇪" },
        { name: "Foxtrot", discord: "foxtrot", flag: "🇵🇱" },
        { name: "Ghost", flag: "🇺🇸" },
        { name: "Havoc", note: "Late Signup", flag: "🇨🇦" }
      ],

      schedule: [
        { label: "Signups close", value: "2026-08-06 23:59 UTC" },
        { label: "Bracket reveal", value: "2026-08-07 19:00 UTC" },
        { label: "Quarter Finals", value: "2026-08-08 18:00 UTC" },
        { label: "Semi Finals", value: "2026-08-09 19:00 UTC" },
        { label: "Grand Final", value: "2026-08-09 21:00 UTC" }
      ],

      rules: [
        "Standard tournament maps only.",
        "Observers are allowed only on designated stream matches.",
        "Players must report scores immediately after each match.",
        "Replay files may be requested for admin review."
      ],

      featuredMatches: [
        { title: "Opening Broadcast", players: "AlphaOne vs Bravo", time: "2026-08-08 18:00 UTC" },
        { title: "Expected Final Slot", players: "Top seed vs top seed", time: "2026-08-09 21:00 UTC" }
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
                { title: "SF1", player1: "Nomad", player2: "Rift", score1: "2", score2: "1", winner: "Nomad", note: "Bo3", time: "2026-05-10 19:00 UTC" },
                { title: "SF2", player1: "Vortex", player2: "Shade", score1: "0", score2: "2", winner: "Shade", note: "Bo3", time: "2026-05-10 19:45 UTC" }
              ]
            },
            {
              title: "Grand Final",
              matches: [
                { title: "GF", player1: "Nomad", player2: "Shade", score1: "3", score2: "2", winner: "Nomad", note: "Bo5", time: "2026-05-10 21:00 UTC" }
              ]
            }
          ]
        }
      ],

      players: [
        { name: "Nomad", seed: 1, discord: "nomad", flag: "🇬🇧" },
        { name: "Rift", seed: 2, discord: "rift", flag: "🇺🇸" },
        { name: "Vortex", seed: 3, discord: "vortex", flag: "🇩🇪" },
        { name: "Shade", flag: "🇳🇴" }
      ],

      schedule: [
        { label: "Check-in", value: "2026-05-10 16:30 UTC" },
        { label: "Group stage", value: "2026-05-10 17:00 UTC" },
        { label: "Semi Finals", value: "2026-05-10 19:00 UTC" },
        { label: "Grand Final", value: "2026-05-10 21:00 UTC" }
      ],

      rules: [
        "Round robin standings are decided by wins, then head-to-head.",
        "Grand Final is played as best of five.",
        "Admins may remake lobbies if major technical issues occur."
      ],

      featuredMatches: [
        { title: "Grand Final Replay", players: "Nomad vs Shade", time: "2026-05-10 21:00 UTC" }
      ],

      results: [
        { place: "1st", name: "Nomad", note: "Champion" },
        { place: "2nd", name: "Shade", note: "Runner-up" },
        { place: "3rd", name: "Rift" },
        { place: "4th", name: "Vortex" }
      ]
    }
  ]
};