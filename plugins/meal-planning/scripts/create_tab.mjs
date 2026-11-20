#!/usr/bin/env node
/**
 * create_tab.mjs
 * Creates a new tab in a Google Doc and prints the new tab ID to stdout.
 *
 * Usage:
 *   node create_tab.mjs --doc-id <documentId> --title <tabTitle> [--index <n>]
 *
 * Prerequisites:
 *   gcloud auth login   (standard gcloud sign-in; no application-default needed)
 *
 * Exit codes:
 *   0  success — tab ID printed to stdout
 *   1  usage error or API failure — message printed to stderr
 */

import { execSync } from 'child_process';

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const argv = process.argv.slice(2);
const getArg = (name) => {
  const idx = argv.indexOf(`--${name}`);
  return idx !== -1 ? argv[idx + 1] ?? null : null;
};

const docId = getArg('doc-id');
const title = getArg('title');
const indexStr = getArg('index');
const index = indexStr !== null ? parseInt(indexStr, 10) : 0;

if (!docId || !title) {
  console.error('Usage: create_tab.mjs --doc-id <id> --title <title> [--index <n>]');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// API call
// ---------------------------------------------------------------------------

try {
  const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim();

  const response = await fetch(
    `https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [{ addDocumentTab: { tabProperties: { title, index } } }],
      }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    console.error(`API error ${response.status}: ${text}`);
    process.exit(1);
  }

  const data = await response.json();
  const tabId = data?.replies?.[0]?.addDocumentTab?.tab?.tabProperties?.tabId;

  if (!tabId) {
    console.error('API returned no tabId:', JSON.stringify(data));
    process.exit(1);
  }

  // Print only the tab ID so callers can capture it cleanly
  console.log(tabId);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
