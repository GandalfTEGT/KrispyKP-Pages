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

It does **not** yet rewrite `data/tournaments.config.js` automatically.

That is deliberate, because your config file still controls manual/site-specific things such as:
- banner images
- prize pool text
- descriptions
- rules URL
- manual brackets
- external tournaments not on Challonge

## What you need to change later

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

## If you want the site to use synced data later

A future upgrade can make `tournaments-page.js` read from:
- `data/challonge.generated.json`

and merge that with your config so things like participant lists and match data update automatically.

That is not required to use the current tournaments page.

## Current limitation

The workflow currently uses direct API fetches and stores raw JSON.
It does not transform Challonge data into your exact front-end layout yet.
That keeps the setup simple and safe until you have a real live tournament to test against.
