# Tournament rules PDF workflow

Tournament facts and official rule wording live in `data/tournaments.config.js`. The Python generator contains reusable presentation logic only; it asks the small Node exporter to execute the classic-browser configuration safely and return the selected event as JSON.

To generate the configured static PDF from the repository root:

```text
python tools/generate-tournament-rules.py td-invasion-red-alert-2026
```

The event's `rulesUrl` selects the output, currently `assets/trules/td-invasion-rules.pdf`. The optional `bannerImage` supplies the first-page banner. The shared `assets/logo.png` supplies restrained document branding.

For a future official document:

1. Add or update the event in `data/tournaments.config.js`.
2. Provide structured `rules.sections`, `rules.mapPool`, `rules.questions`, and optionally `rules.closing`.
3. Set a repository-local `.pdf` `rulesUrl`; optionally set an existing repository `bannerImage`.
4. Run the command with that event ID.
5. Review every rendered page and extracted text before committing the generated PDF.

The generator exits with a clear error for an unknown event, legacy/unstructured rules, missing section content, an empty map pool, missing contact guidance, invalid output path, or missing required metadata. Node.js, Python, ReportLab and Pillow are required locally. No browser, backend, account or database is involved.
