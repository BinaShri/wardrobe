// ============================================================
// config.js — Google credentials and IDs
// ============================================================
// This file is committed to the public repo on purpose.
// The Google Sheet is restricted to Bina's account, so the
// client ID alone can't access anything without her sign-in.
// ============================================================

const CONFIG = {
  GOOGLE_CLIENT_ID: '699905325494-ms4iqbfslmm8t897om4s512g38889873.apps.googleusercontent.com',
  SPREADSHEET_ID: '133TIbToMuyWCpFclRoA_ryjfuEPuR0Fr',
  PHOTOS_ALBUM_ID: 'AF1QipMmaK_QDjnXTExuG2z-Gd4eknHiPNw6hNK5KQyx',
  SHEET_NAME: 'Wardrobe',
  ARCHIVE_SHEET_NAME: 'Outfit Archive',
  SCOPES: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/photoslibrary.appendonly',
    'https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata'
  ].join(' ')
};
