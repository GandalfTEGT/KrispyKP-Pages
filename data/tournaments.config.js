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

TOURNAMENT OBJECT FIELDS
------------------------

id:
- Unique internal id.
- Example: "td-open-1"

status:
- "upcoming" | "live" | "completed"

title:
- Main event title.

subtitle:
- Short line under the title.

hostType:
- "self" | "external"
- self = your event
- external = someone else's event featured on your site

organizer:
- Name of organizer shown on page.

game:
- Game title.

format:
- Tournament format.
- Example: "Double Elimination", "Single Elimination", "Round Robin"

startDate:
- Start date/time text.

endDate:
- End date/time text.

timezone:
- Timezone text.
- Example: "UTC+0"

prizePool:
- Prize pool text.
- Example: "£100"

bannerImage:
- Path to banner image.
- Example: "assets/tournaments/td-open-1/banner.jpg"

description:
- Main event description paragraph.

registrationMode:
- "challonge" | "external" | "closed" | "none"
- challonge = register button goes to Challonge
- external = register button goes somewhere else
- closed = no register button, page says signups closed
- none = no public signup route shown

registrationUrl:
- Register button link.
- Only needed for "challonge" or "external"

participantSource:
- "manual" | "challonge" | "mixed"
- manual = page player list is entered manually here
- challonge = players mainly come from Challonge sync
- mixed = Challonge event, but you still keep a manual player list here too

streamUrl:
- Link to stream if any.

rulesUrl:
- Link to rules PDF/page if any.

BRACKET FIELDS
--------------
bracketMode:
- "embed" | "link" | "manual" | "none"
- embed = show Challonge/embed iframe
- link = show external bracket button only
- manual = render bracket from manualBracket data
- none = no bracket block

bracketTitle:
- Heading above bracket section.

bracketUrl:
- External bracket page link.

bracketEmbedUrl:
- Embed iframe URL.
- For Challonge, typically:
  https://challonge.com/YOUR_TOURNAMENT/module
- Optional theme/options can be appended.
- Challonge bracket module instructions show /module and theme query support.

manualBracket:
- Only used when bracketMode = "manual"
- Structure:
  manualBracket: {
    rounds: [
      {
        title: "Quarter Finals",
        matches: [
          {
            title: "QF1",
            player1: "Player One",
            player2: "Player Two",
            score1: "2",
            score2: "1",
            winner: "Player One",
            note: "Bo3",
            time: "2026-07-20 19:00 UTC"
          }
        ]
      }
    ]
  }

PLAYERS
-------
players:
- Array of manual player entries.
- Can be used for manual, mixed, or even pure Challonge events if you want a curated on-page list.
- Supported player fields:
  - name
  - seed
  - note
  - discord
  - flag

schedule:
- Array of { label, value }

rules:
- Array of rule strings

featuredMatches:
- Array of objects with:
  - title
  - players
  - time

results:
- Array of objects with:
  - place
  - name
  - note

WHEN TO REMOVE / COMMENT OUT FIELDS
-----------------------------------
No signup:
- registrationMode: "none" or "closed"
- remove/comment registrationUrl

No bracket:
- bracketMode: "none"
- remove/comment bracketUrl
- remove/comment bracketEmbedUrl
- remove/comment manualBracket

Bracket link only:
- bracketMode: "link"
- keep bracketUrl
- remove/comment bracketEmbedUrl
- remove/comment manualBracket

Embed bracket:
- bracketMode: "embed"
- keep bracketUrl
- keep bracketEmbedUrl
- remove/comment manualBracket unless you also want to keep it for later

Manual bracket:
- bracketMode: "manual"
- keep manualBracket
- bracketUrl optional
- remove/comment bracketEmbedUrl unless you want it saved for later use

No stream:
- remove/comment streamUrl

No rules document:
- remove/comment rulesUrl

No banner:
- remove/comment bannerImage

SAFE EMPTY DEFAULTS
-------------------
Prefer:
players: []
schedule: []
rules: []
featuredMatches: []
results: []

NO TOURNAMENTS SETUP
--------------------
window.KRISPY_TOURNAMENTS = {
  currentEventId: null,
  events: []
};

CHALLONGE JSON / SYNC NOTE
--------------------------
You can keep using just the embed.
If you later use Challonge API sync, that is most useful for:
- on-site custom match/player summaries
- future automatic list updates
- richer non-iframe displays

The page still supports plain embed mode even if no sync is set up.

========================================
END OF GUIDE
========================================
*/

window.KRISPY_TOURNAMENTS = {
  currentEventId: null,
  events: [
    /*
    {
      id: "td-open-1",
      status: "upcoming",
      title: "Tiberian Dawn Open #1",
      subtitle: "Community 1v1 tournament",

      hostType: "self",
      organizer: "KrispyKP",

      game: "Command & Conquer: Tiberian Dawn",
      format: "Double Elimination",
      startDate: "2026-07-20",
      endDate: "2026-07-21",
      timezone: "UTC+0",
      prizePool: "£100",
      bannerImage: "assets/tournaments/td-open-1/banner.jpg",

      description: "A community Tiberian Dawn event with full bracket coverage.",

      registrationMode: "challonge",
      registrationUrl: "https://challonge.com/your_signup_page",

      participantSource: "mixed",

      streamUrl: "https://www.twitch.tv/KrispyKP",
      rulesUrl: "assets/tournaments/td-open-1/rules.pdf",

      bracketMode: "embed",
      bracketTitle: "Tournament Bracket",
      bracketUrl: "https://challonge.com/your_bracket_page",
      bracketEmbedUrl: "https://challonge.com/your_bracket_page/module",

      // Only used when bracketMode = "manual"
      manualBracket: {
        rounds: [
          {
            title: "Quarter Finals",
            matches: [
              {
                title: "QF1",
                player1: "Player One",
                player2: "Player Two",
                score1: "2",
                score2: "1",
                winner: "Player One",
                note: "Bo3",
                time: "2026-07-20 19:00 UTC"
              }
            ]
          }
        ]
      },

      players: [
        { name: "KrispyKP", seed: 1, note: "Host" },
        { name: "Player Two", seed: 2, discord: "player_two" },
        { name: "Player Three", seed: 3, flag: "UK" }
      ],

      schedule: [
        { label: "Signups close", value: "2026-07-18 23:59 UTC" },
        { label: "Bracket published", value: "2026-07-19 18:00 UTC" },
        { label: "Round 1", value: "2026-07-20 19:00 UTC" },
        { label: "Finals", value: "2026-07-21 20:00 UTC" }
      ],

      rules: [
        "All matches must be played on the correct game version.",
        "Players must be ready at their scheduled time.",
        "Admins decide disconnect rulings where needed."
      ],

      featuredMatches: [
        { title: "Opening Match", players: "Player One vs Player Two", time: "2026-07-20 19:00 UTC" }
      ],

      results: [
        { place: "1st", name: "Player One", note: "Champion" },
        { place: "2nd", name: "Player Two" },
        { place: "3rd", name: "Player Three" }
      ]
    }
    */
  ]
};