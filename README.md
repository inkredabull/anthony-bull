# anthony-bull

Personal and household Claude plugins.

## Plugins

| Plugin | What it does |
| --- | --- |
| `meal-planning` | Plan meals, build the grocery list or cart, and schedule dinners |

## Install

```
/plugin marketplace add inkredabull/anthony-bull
/plugin install meal-planning@anthony-bull
```

## Skills in `meal-planning`

- `meal-planning:plan-meals`
- `meal-planning:shop`

## Layout

```
anthony-bull/
  .claude-plugin/marketplace.json
  plugins/
    meal-planning/
      .claude-plugin/plugin.json
      profile.example.md      (template only)
      skills/
        plan/SKILL.md
        shop/SKILL.md
```

## How it works

The plugin contains no personal data and works out of the box with sensible
defaults. Optional connectors (Google Calendar, Apple Reminders, Instacart) are
used when available. Without them the plan and grocery list are shown in the reply
and an .ics file is offered for the calendar.

## Private profile (optional)

To personalize the plans, copy `plugins/meal-planning/profile.example.md` to
`~/.claude/meal-planning/profile.md` and fill in what you want. If the file is
missing, `meal-planning:plan-meals` will ask a few questions and offer to create it.
It lives in your home folder, so it survives plugin updates and never ends up in
a repo. `.gitignore` also excludes any `profile.md` as a safety net.

## Local testing

```
/plugin marketplace add ./anthony-bull
/plugin install meal-planning@anthony-bull
```

## License

MIT. See `LICENSE`.
