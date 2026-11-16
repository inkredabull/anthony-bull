# Meal planning profile (template)

Copy this file to `~/.claude/meal-planning/profile.md` and fill in your own values.
That path is outside the plugin, so it survives plugin updates and is never
committed or published. Every setting is optional. Anything you leave out falls
back to a sensible default.

## Household
- Cooking for: <number> adults, <number> kids
- Leftovers: <e.g. enough for the next day's lunch>
- Dinners covered by someone else: <days> (<name>). These are not planned and show that name in the table.

## Dietary
- Restrictions and allergies: <list, or none>
- Dislikes: <list, or none>

## Groceries
- Default destination: <Apple Reminders list "<list name>", or leave blank to just show the list>
- Alternative destination: <Instacart cart at <retailer>, or leave blank>
- Standing add-ons (included on every list):
  - <group name>: <item>, <item>, <item>

## Calendar
- Calendar: Google Calendar
- Time zone: <IANA zone, e.g. America/Los_Angeles>
- Event color (colorId): <number, optional>
- Breakfast: <time>, <minutes>
- Lunch: <time>, <minutes>
- Dinner: <time>, <minutes>

## Nutrition tuning
- Style: <e.g. high-protein, Mediterranean, or any program you follow>
- Poultry share cap for lunches: <e.g. 60-70%>
- Tinned fish lunches: <yes or no>
- Caffeine note for breakfast: <optional>
- Leftovers night: <day, or leave blank for none>
