# Challonge sync setup

This workflow is for future use when you have a live Challonge tournament and want your site repo to pull data from Challonge automatically.

## Files included

- `.github/workflows/challonge-sync.yml`
- `data/challonge.generated.json` will be created by the workflow when it runs

## What the workflow currently does

It fetches, for each configured tournament id:
- tournament details
- participants
- matches

and writes them into:

- `data/challonge.generated.json`

This is a public repository and that generated path is publicly retrievable when deployed. The current workflow stores the complete API responses rather than a reviewed public allowlist. Leave the Challonge secrets and tournament IDs unconfigured until the project owner has approved which tournament, participant and match fields may be published and the workflow has been updated to emit only that schema.

It does **not** yet rewrite `data/tournaments.config.js` automatically.

That is deliberate, because your config file still controls manual/site-specific things such as:
- banner images
- prize pool text
- descriptions
- rules URL
- manual brackets
- external tournaments not on Challonge

## What you need to change later

The public-field review above is a required first step. The following credentials are needed only after that review and the corresponding workflow change.

### 1. Add GitHub repository secrets

In your GitHub repo:

- go to **Settings**
- go to **Secrets and variables**
- go to **Actions**
- add these repository secrets:

#### `CHALLONGE_USERNAME`
Your Challonge username.

#### `CHALLONGE_API_KEY`
Your Challonge API key.

#### `CHALLONGE_TOURNAMENT_IDS`
A comma-separated list of Challonge tournament ids or urls accepted by the API call.

Example:

`td_open_1,ra_open_2`

## Important security note

Do **not** put your Challonge username or API key directly into:
- `tournaments.config.js`
- workflow YAML
- JavaScript files on the site
- committed files anywhere in the repo

Always store credentials in **GitHub Actions secrets**.

## When you have a live Challonge tournament

1. Create the tournament on Challonge.
2. Get your Challonge API credentials.
3. Add the secrets listed above in GitHub.
4. Update your `data/tournaments.config.js` event entry with:
   - `registrationMode: "challonge"`
   - `registrationUrl`
   - `bracketMode: "embed"` or `"link"`
   - `bracketUrl`
   - `bracketEmbedUrl` if embedding
   - `participantSource: "challonge"` or `"mixed"`
5. Run the workflow manually from the GitHub Actions tab, or wait for the scheduled sync.

If credentials or IDs are missing, or if any configured API request fails, the workflow stops without replacing the last successfully generated snapshot. The Challonge and YouTube data writers share a branch-scoped concurrency queue and rebase before push so their same-minute schedules do not race each other.

## If you want the site to use synced data later

A future upgrade can make `tournaments-page.js` read from:
- `data/challonge.generated.json`

and merge that with your config so things like participant lists and match data update automatically.

That is not required to use the current tournaments page.

## Current limitation

The workflow currently uses direct API fetches and stores raw JSON.
It does not transform Challonge data into your exact front-end layout yet.
The current empty snapshot contains no tournament records, and the website does not read this file. A reviewed allowlisted output schema is still required before enabling the workflow for a live tournament.
