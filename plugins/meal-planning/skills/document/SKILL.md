---
name: "document"
description: "Creates a new weekly tab in the meal-planning Google Doc, fills in Mon–Thu dinners, and emails the list with a link. Invoked automatically by meal-planning:shop on successful completion, or run standalone to document the current week's plan."
---

# Document this week's dinners

This skill writes Mon–Thu dinners into a new tab of the meal-planning Google Doc,
then emails the dinner list with a link to the new tab.

## Google Doc

Doc ID: `1K8AlBAs_Ir8yau7onNdsyi76YKK8-46bSD8OX0TJumA`

## Tab title convention

Tabs are named **"Week of M/DD"** using the **Saturday** date of the planning weekend in
America/Los_Angeles time. When invoked from `meal-planning:shop`, the week's Saturday date
is already in context (from the plan-meals output). When invoked standalone, derive it:
"planning Saturday" = the most recent Saturday on or before today (PT).

Examples: "Week of 11/21", "Week of 10/30" — no leading zero on the month or day.

## Steps

### 1 — Determine the tab title

Compute the planning Saturday in PT and format it as "Week of M/DD".

### 2 — Check for an existing tab

Call `mcp__Google_Docs__read_doc` with the doc ID (no `tab_id`). Scan `tabs[*].tabProperties`
for a title matching the computed title. If a tab with that exact title already exists,
report it and skip to Step 7 (email) using the existing tab's ID.

### 3 — Create the tab

**Preferred path — local script**

Locate the script on the user's machine:

```bash
ls ~/.claude/plugins/synced/*/meal-planning/scripts/create_tab.mjs 2>/dev/null | head -1
```

If the path resolves, run it via `device_bash`:

```bash
SCRIPT=$(ls ~/.claude/plugins/synced/*/meal-planning/scripts/create_tab.mjs 2>/dev/null | head -1)
node "$SCRIPT" \
  --doc-id 1K8AlBAs_Ir8yau7onNdsyi76YKK8-46bSD8OX0TJumA \
  --title "<computed title>" \
  --index 0
```

The script prints the new tab ID to stdout and exits 0. Capture it.
If the script exits non-zero or is not found, fall back to the browser path below.

**Fallback — browser automation**

If the script is unavailable or fails:

1. Open the doc in the built-in browser:
   `https://docs.google.com/document/d/1K8AlBAs_Ir8yau7onNdsyi76YKK8-46bSD8OX0TJumA/edit`
2. Click the **+** button in the tab bar at the bottom of the document to add a new tab.
3. Double-click the new tab's default name and rename it to the computed title.
4. Re-read the doc via `mcp__Google_Docs__read_doc` to get the new tab's ID from
   `tabs[*].tabProperties` (it will be the one with the matching title).

### 4 — Insert the full text

Build the content string. The dinners come from the week's plan in context (Mon–Thu).
Leave Sat and Sun blank (they are filled in manually):

```
Week of M/DD\nWeekend \nSat: \nSun: \nWeek\nMon: <Monday dinner>\nTue: <Tuesday dinner>\nWed: <Wednesday dinner>\nThu: <Thursday dinner>\n
```

Note the trailing space after "Weekend " — required for correct bullet formatting.

Call `mcp__Google_Docs__update_doc` targeting the new tab (`tab_id: <tabId>`), inserting the
full string at index 1:

```json
{
  "requests": [
    {
      "insertText": {
        "location": { "index": 1, "tabId": "<tabId>" },
        "text": "<full content string>"
      }
    }
  ]
}
```

### 5 — Apply formatting

After insertion, calculate the character offsets for each line and apply all formatting in a
single `batchUpdate` call targeting the same tab (`tab_id: <tabId>`). The requests, in order:

**a. Title line — HEADING_2, centered**

The title line starts at index 1 and ends just before the `\n` (exclusive end = 1 + len(title) + 1).

```json
{
  "updateParagraphStyle": {
    "range": { "startIndex": 1, "endIndex": <title_end>, "tabId": "<tabId>" },
    "paragraphStyle": {
      "namedStyleType": "HEADING_2",
      "alignment": "CENTER"
    },
    "fields": "namedStyleType,alignment"
  }
}
```

**b. Bullet list — all lines after the title**

Apply `createParagraphBullets` to every line from "Weekend " through the last Thursday line:

```json
{
  "createParagraphBullets": {
    "range": {
      "startIndex": <weekend_start>,
      "endIndex": <thu_end>,
      "tabId": "<tabId>"
    },
    "bulletPreset": "BULLET_DISC_CIRCLE_SQUARE"
  }
}
```

**c. Line spacing — all bullet lines**

Apply `lineSpacing: 150` to the same range:

```json
{
  "updateParagraphStyle": {
    "range": { "startIndex": <weekend_start>, "endIndex": <thu_end>, "tabId": "<tabId>" },
    "paragraphStyle": { "lineSpacing": 150 },
    "fields": "lineSpacing"
  }
}
```

**d. Level-0 indent — "Weekend " and "Week" lines**

For each of the two section-header lines ("Weekend " and "Week"), apply:

```json
{
  "updateParagraphStyle": {
    "range": { "startIndex": <line_start>, "endIndex": <line_end>, "tabId": "<tabId>" },
    "paragraphStyle": {
      "indentFirstLine": { "magnitude": 18, "unit": "PT" },
      "indentStart":     { "magnitude": 36, "unit": "PT" }
    },
    "fields": "indentFirstLine,indentStart"
  }
}
```

**e. Level-1 indent — Sat, Sun, Mon, Tue, Wed, Thu lines**

For each of the six day lines, apply:

```json
{
  "updateParagraphStyle": {
    "range": { "startIndex": <line_start>, "endIndex": <line_end>, "tabId": "<tabId>" },
    "paragraphStyle": {
      "indentFirstLine": { "magnitude": 54, "unit": "PT" },
      "indentStart":     { "magnitude": 72, "unit": "PT" }
    },
    "fields": "indentFirstLine,indentStart"
  }
}
```

**f. Bold text — "Weekend " and "Week" runs**

For the text content (not the newline) of "Weekend " and "Week":

```json
{
  "updateTextStyle": {
    "range": { "startIndex": <line_start>, "endIndex": <text_end>, "tabId": "<tabId>" },
    "textStyle": { "bold": true },
    "fields": "bold"
  }
}
```

### 6 — Confirm

Report: tab created ("Week of M/DD"), dinners for Mon–Thu written in.

### 7 — Email the dinner list

Send an email via the Gmail connector:

- **To**: anthony@bluxomelabs.com
- **Subject**: `Week of <tab title> — Dinners`
- **Body** (plain text):

```
<tab title>

Mon: <dinner>
Tue: <dinner>
Wed: <dinner>
Thu: <dinner or blank>

https://docs.google.com/document/d/1K8AlBAs_Ir8yau7onNdsyi76YKK8-46bSD8OX0TJumA/edit?tab=<tabId>
```

Confirm: email sent to anthony@bluxomelabs.com.

## Rules

- Never create a duplicate tab; check first (Step 2). If the tab already exists,
  skip to Step 7 and email from the existing tab.
- If Mon–Thu dinners are not in context (standalone invocation without a prior plan), ask the
  user to provide them before proceeding.
- If the Google Docs update call fails at any step, report the error and stop — do not leave
  a partially-formatted tab without noting it.
- Do not write to the "Meal Planning" base tab (`t.0`) or the "Division of Responsibilities"
  draft tab.
- Send the email (Step 7) only after the tab content is successfully written. If tab
  creation or formatting fails, skip the email and report the failure instead.
