---
name: "shop"
description: "Adds items to the user's Instacart cart and flushes their Apple Reminders groceries list into the same cart. Use standalone to push everything in the groceries list to Instacart, or invoked from meal-planning:plan when the Instacart path is chosen."
---

# Groceries → Instacart

This skill moves grocery items into the user's Instacart cart.

## Private profile

The retailer and the reminders list name come from the private profile at
`~/.claude/meal-planning/profile.md` (see `${CLAUDE_PLUGIN_ROOT}/profile.example.md`
for the fields). If the profile is missing, ask the user for the retailer and the
reminders list name. Never write those values into the plugin directory. Below,
"the retailer" and "the groceries list" mean the values from the profile.
It handles two invocation patterns:

## Pattern A — Standalone (no item list in context)

1. Read the groceries list from Apple Reminders.
2. If the list is empty, tell the user and stop.
3. Add all items to the Instacart cart at the retailer using `quick_add_search_queries`
   in a single call — one query per item, plain ingredient name only
   (no quantities, no section labels, no brand unless needed for specificity).
4. Delete each item from Apple Reminders using the Reminders connector's delete
   action, only after the cart add succeeds.
5. Confirm: how many items were added and that the groceries list has been cleared.

## Pattern B — With items (invoked from meal-planning:plan or similar)

When a deduplicated ingredient list is already present in context (provided by the
calling skill or flow):

1. Add the provided ingredient list to the Instacart cart at the retailer using
   `quick_add_search_queries` in a single call — one query per item, plain name only.
2. Read the groceries list from Apple Reminders.
3. If the Reminders list has items, add any NOT already in the ingredient list
   just sent (deduplicate) to the same cart.
4. Delete all items found in the Reminders groceries list using the Reminders
   connector's delete action — only after the cart add(s) succeed.
5. Confirm: total items added to cart, and that the groceries list has been cleared.

## Rules (both patterns)

- Retailer: the one named in the profile
- Use `quick_add_search_queries` for cart additions
- One query per ingredient, plain name only — no quantities, no section labels,
  no brand unless needed for specificity
- Deduplicate: each ingredient appears in the cart once only
- Never delete from Reminders until the cart add has succeeded
- If the cart add fails, do not delete from Reminders; report the failure instead
