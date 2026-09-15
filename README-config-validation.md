# Site configuration validation

Run this check after changing tournament, music or video source configuration:

```powershell
node tools/validate-site-config.mjs
```

The command has no package dependencies and does not contact external services. It exits with status 1 and lists every detected problem when configuration is incomplete or inconsistent.

It checks:

- tournament event IDs and the explicit `currentEventId` reference;
- supported event status, registration and bracket modes, including fields required by a selected mode;
- local tournament banner, rules and participant-flag paths;
- manual bracket groups, match IDs and upstream match references;
- structured rules and legacy string-array rules;
- music track and playlist IDs, playlist membership and local audio/art paths;
- video category/subtab IDs and required YouTube playlist IDs.

An explicit invalid `currentEventId` is treated as an authoring error. The validator does not silently select a different event because that could publish the wrong tournament as current.

The validator reports configuration contracts only. It does not remove example material or unused assets, rewrite shared page markup, call provider APIs, or replace browser acceptance testing.
