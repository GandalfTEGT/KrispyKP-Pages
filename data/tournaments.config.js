/*
========================================
KRISPYKP TOURNAMENT CONFIG GUIDE
========================================

This file controls the tournaments page.

QUICK STATE REFERENCE
---------------------
No tournaments:
- currentEventId: null
- events: []

Single tournament:
- add one event object to events
- it becomes the featured event automatically

Multiple tournaments:
- add more event objects to events
- one becomes featured
- other live/upcoming events appear underneath as switchable cards
- completed events appear in the past events area

MAIN STRUCTURE
--------------
currentEventId:
- Set to an event id to force that event to be featured on page load.
- Use null to auto-pick:
  1. first live event
  2. otherwise first upcoming event
  3. otherwise first completed event
  4. otherwise empty state

events:
- Array of tournament objects.

========================================
END OF GUIDE
========================================
*/

window.KRISPY_TOURNAMENTS = {
  currentEventId: null,
  events: [
    {
      id: "td-live-showcase",
      status: "live",
      title: "Tiberian Dawn Radar Clash",
      subtitle: "Live community 1v1 showcase event",

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
        "A fully mocked live event for testing the redesigned tournament page. This one is filled out with enough data to show the hero, details, bracket, players, schedule, featured matches, and results layout properly on both desktop and mobile.",

      registrationMode: "closed",
      participantSource: "manual",

      streamUrl: "https://www.twitch.tv/KrispyKP",
      rulesUrl: "assets/tournaments/test-live-rules.pdf",

      bracketMode: "manual",
      bracketTitle: "Live Bracket",

      manualBracket: {
        rounds: [
          {
            title: "Quarter Finals",
            matches: [
              {
                title: "QF1",
                player1: "KrispyKP",
                player2: "IronFox",
                score1: "2",
                score2: "0",
                winner: "KrispyKP",
                note: "Bo3",
                time: "2026-07-20 18:00 UTC"
              },
              {
                title: "QF2",
                player1: "Meds",
                player2: "Jamie",
                score1: "2",
                score2: "1",
                winner: "Meds",
                note: "Bo3",
                time: "2026-07-20 18:30 UTC"
              },
              {
                title: "QF3",
                player1: "Gazza",
                player2: "Bruzer",
                score1: "0",
                score2: "2",
                winner: "Bruzer",
                note: "Bo3",
                time: "2026-07-20 19:00 UTC"
              },
              {
                title: "QF4",
                player1: "Player Eight",
                player2: "Player Nine",
                score1: "2",
                score2: "1",
                winner: "Player Eight",
                note: "Bo3",
                time: "2026-07-20 19:30 UTC"
              }
            ]
          },
          {
            title: "Semi Finals",
            matches: [
              {
                title: "SF1",
                player1: "KrispyKP",
                player2: "Meds",
                score1: "2",
                score2: "1",
                winner: "KrispyKP",
                note: "Bo3",
                time: "2026-07-20 20:15 UTC"
              },
              {
                title: "SF2",
                player1: "Bruzer",
                player2: "Player Eight",
                score1: "2",
                score2: "0",
                winner: "Bruzer",
                note: "Bo3",
                time: "2026-07-20 20:45 UTC"
              }
            ]
          },
          {
            title: "Grand Final",
            matches: [
              {
                title: "GF",
                player1: "KrispyKP",
                player2: "Bruzer",
                score1: "1",
                score2: "1",
                winner: "",
                note: "Bo5 - Live",
                time: "2026-07-20 21:30 UTC"
              }
            ]
          }
        ]
      },

      players: [
        { name: "KrispyKP", seed: 1, note: "Host", discord: "KrispyKP", flag: "🏴" },
        { name: "IronFox", seed: 2, discord: "ironfox", flag: "🇩🇪" },
        { name: "Meds", seed: 3, discord: "meds", flag: "🏴" },
        { name: "Jamie", seed: 4, discord: "jamie", flag: "🏴" },
        { name: "Gazza", seed: 5, discord: "gazza", flag: "🏴" },
        { name: "Bruzer", seed: 6, discord: "bruzer", flag: "🏴" },
        { name: "Player Eight", seed: 7, discord: "p8", flag: "🇺🇸" },
        { name: "Player Nine", seed: 8, discord: "p9", flag: "🇨🇦" }
      ],

      schedule: [
        { label: "Check-in opens", value: "2026-07-20 17:15 UTC" },
        { label: "Broadcast begins", value: "2026-07-20 17:45 UTC" },
        { label: "Quarter Finals", value: "2026-07-20 18:00 UTC" },
        { label: "Semi Finals", value: "2026-07-20 20:15 UTC" },
        { label: "Grand Final", value: "2026-07-20 21:30 UTC" }
      ],

      rules: [
        "All matches are played on the approved tournament version.",
        "Players must be ready within 10 minutes of their scheduled start time.",
        "Map vetoes must be completed before the lobby is launched.",
        "Disconnect rulings are made by the tournament admin.",
        "Unsportsmanlike conduct may result in warnings or removal."
      ],

      featuredMatches: [
        {
          title: "Main Broadcast Match",
          players: "KrispyKP vs Bruzer",
          time: "2026-07-20 21:30 UTC"
        },
        {
          title: "Semi Final Feature",
          players: "KrispyKP vs Meds",
          time: "2026-07-20 20:15 UTC"
        }
      ],

      results: [
        { place: "1st", name: "TBD", note: "Live event in progress" },
        { place: "2nd", name: "TBD" },
        { place: "3rd", name: "TBD" }
      ]
    },

    {
      id: "ra-open-2",
      status: "upcoming",
      title: "Red Alert Open #2",
      subtitle: "Upcoming weekend bracket test event",

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
        "A second fake event added mainly so the switcher cards and multi-event flow can be tested. This one is upcoming, so it should appear as an alternate event beneath the featured live event.",

      registrationMode: "external",
      registrationUrl: "https://example.com/register/red-alert-open-2",
      participantSource: "manual",

      streamUrl: "https://www.twitch.tv/KrispyKP",
      rulesUrl: "assets/tournaments/test-upcoming-rules.pdf",

      bracketMode: "manual",
      bracketTitle: "Projected Bracket",

      manualBracket: {
        rounds: [
          {
            title: "Round of 8",
            matches: [
              {
                title: "R8-1",
                player1: "AlphaOne",
                player2: "Bravo",
                score1: "",
                score2: "",
                winner: "",
                note: "Bo3",
                time: "2026-08-08 18:00 UTC"
              },
              {
                title: "R8-2",
                player1: "Charlie",
                player2: "Delta",
                score1: "",
                score2: "",
                winner: "",
                note: "Bo3",
                time: "2026-08-08 18:30 UTC"
              },
              {
                title: "R8-3",
                player1: "Echo",
                player2: "Foxtrot",
                score1: "",
                score2: "",
                winner: "",
                note: "Bo3",
                time: "2026-08-08 19:00 UTC"
              },
              {
                title: "R8-4",
                player1: "Ghost",
                player2: "Havoc",
                score1: "",
                score2: "",
                winner: "",
                note: "Bo3",
                time: "2026-08-08 19:30 UTC"
              }
            ]
          },
          {
            title: "Semi Finals",
            matches: [
              {
                title: "SF1",
                player1: "TBD",
                player2: "TBD",
                score1: "",
                score2: "",
                winner: "",
                note: "Bo5",
                time: "2026-08-09 19:00 UTC"
              },
              {
                title: "SF2",
                player1: "TBD",
                player2: "TBD",
                score1: "",
                score2: "",
                winner: "",
                note: "Bo5",
                time: "2026-08-09 19:45 UTC"
              }
            ]
          },
          {
            title: "Final",
            matches: [
              {
                title: "Final",
                player1: "TBD",
                player2: "TBD",
                score1: "",
                score2: "",
                winner: "",
                note: "Bo7",
                time: "2026-08-09 21:00 UTC"
              }
            ]
          }
        ]
      },

      players: [
        { name: "AlphaOne", seed: 1, discord: "alphaone", flag: "🇬🇧" },
        { name: "Bravo", seed: 2, discord: "bravo", flag: "🇫🇷" },
        { name: "Charlie", seed: 3, discord: "charlie", flag: "🇳🇱" },
        { name: "Delta", seed: 4, discord: "delta", flag: "🇩🇪" },
        { name: "Echo", seed: 5, discord: "echo", flag: "🇸🇪" },
        { name: "Foxtrot", seed: 6, discord: "foxtrot", flag: "🇵🇱" },
        { name: "Ghost", seed: 7, discord: "ghost", flag: "🇺🇸" },
        { name: "Havoc", seed: 8, discord: "havoc", flag: "🇨🇦" }
      ],

      schedule: [
        { label: "Signups close", value: "2026-08-06 23:59 UTC" },
        { label: "Bracket reveal", value: "2026-08-07 19:00 UTC" },
        { label: "Round of 8", value: "2026-08-08 18:00 UTC" },
        { label: "Semi Finals", value: "2026-08-09 19:00 UTC" },
        { label: "Final", value: "2026-08-09 21:00 UTC" }
      ],

      rules: [
        "Standard tournament maps only.",
        "Observers are allowed only on stream matches.",
        "Players must report scores immediately after match completion.",
        "Replay files may be requested for admin review."
      ],

      featuredMatches: [
        {
          title: "Opening Broadcast",
          players: "AlphaOne vs Bravo",
          time: "2026-08-08 18:00 UTC"
        },
        {
          title: "Expected Final",
          players: "Top Seed vs Top Seed",
          time: "2026-08-09 21:00 UTC"
        }
      ],

      results: []
    },

    {
      id: "sun-cup-classic",
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
        "A completed mock event used to populate the archive and results sections. This is useful for checking how past events display once an event has finished.",

      registrationMode: "none",
      participantSource: "manual",

      streamUrl: "https://www.twitch.tv/KrispyKP",
      rulesUrl: "assets/tournaments/test-completed-rules.pdf",

      bracketMode: "manual",
      bracketTitle: "Completed Bracket",

      manualBracket: {
        rounds: [
          {
            title: "Semi Finals",
            matches: [
              {
                title: "SF1",
                player1: "Nomad",
                player2: "Rift",
                score1: "2",
                score2: "1",
                winner: "Nomad",
                note: "Bo3",
                time: "2026-05-10 19:00 UTC"
              },
              {
                title: "SF2",
                player1: "Vortex",
                player2: "Shade",
                score1: "0",
                score2: "2",
                winner: "Shade",
                note: "Bo3",
                time: "2026-05-10 19:45 UTC"
              }
            ]
          },
          {
            title: "Grand Final",
            matches: [
              {
                title: "GF",
                player1: "Nomad",
                player2: "Shade",
                score1: "3",
                score2: "2",
                winner: "Nomad",
                note: "Bo5",
                time: "2026-05-10 21:00 UTC"
              }
            ]
          }
        ]
      },

      players: [
        { name: "Nomad", seed: 1, discord: "nomad", flag: "🇬🇧" },
        { name: "Rift", seed: 2, discord: "rift", flag: "🇺🇸" },
        { name: "Vortex", seed: 3, discord: "vortex", flag: "🇩🇪" },
        { name: "Shade", seed: 4, discord: "shade", flag: "🇳🇴" }
      ],

      schedule: [
        { label: "Check-in", value: "2026-05-10 16:30 UTC" },
        { label: "Group stage", value: "2026-05-10 17:00 UTC" },
        { label: "Semi Finals", value: "2026-05-10 19:00 UTC" },
        { label: "Grand Final", value: "2026-05-10 21:00 UTC" }
      ],

      rules: [
        "Round robin standings decided by wins, then head-to-head.",
        "Final played as best of five.",
        "Admins reserve the right to remake lobbies if technical issues occur."
      ],

      featuredMatches: [
        {
          title: "Grand Final Replay",
          players: "Nomad vs Shade",
          time: "2026-05-10 21:00 UTC"
        }
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