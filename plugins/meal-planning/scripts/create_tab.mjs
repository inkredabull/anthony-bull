#!/usr/bin/env node
/**
 * create_tab.mjs
 * Creates a new tab in a Google Doc and prints the new tab ID to stdout.
 *
 * Usage:
 *   node create_tab.mjs --doc-id <documentId> --title <tabTitle> [--index <n>]
 *
 * Prerequisites:
 *   npm install googleapis          (or: npm install -g googleapis)
 *   gcloud auth application-default login \
 *     --scopes=https://www.googleapis.com/auth/documents
 *
 * Exit codes:
 *   0  success — tab ID printed to stdout
 *   1  usage error or API failure — message printed to stderr
 */

import { google } from 'googleapis';

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
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/documents'],
  });

  const docs = google.docs({ version: 'v1', auth });

  const response = await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: [
        {
          createTab: {
            tabProperties: {
              title,
              index,
            },
          },
        },
      ],
    },
  });

  const tabId =
    response.data?.replies?.[0]?.createTab?.tab?.tabProperties?.tabId;

  if (!tabId) {
    console.error('API returned no tabId in reply:', JSON.stringify(response.data));
    process.exit(1);
  }

  // Print only the tab ID so callers can capture it cleanly
  console.log(tabId);
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
