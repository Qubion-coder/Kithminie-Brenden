// Kithminie & Brenden wedding – saves RSVPs into the Google Sheet and
// guest photos (from /memory) into the Google Drive folder.
// https://docs.google.com/spreadsheets/d/1cVGUcmnMWsgHjDN5KyS97ch4JkcbGhh1QrxaDoovpSo/edit
// https://drive.google.com/drive/folders/1NEYxpebbgWwZcvLFKao8xbzHBe6_SjNZ
const SPREADSHEET_ID = '1cVGUcmnMWsgHjDN5KyS97ch4JkcbGhh1QrxaDoovpSo';
const MEMORY_FOLDER_ID = '1NEYxpebbgWwZcvLFKao8xbzHBe6_SjNZ';

const SHEET_NAME = 'rsvp';
const HEADERS = ['Timestamp', 'Guest Name', 'Attending', 'Seats', 'Message', 'Invitation Link'];

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    if (p.action === 'upload') return jsonResponse_(saveMemory_(p));
    return jsonResponse_(saveRsvp_(p));
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, message: 'Wedding RSVP endpoint is running.' });
}

/**
 * Run once from the editor (select "setup" ▸ Run) to create the rsvp tab and
 * grant the script access to the memories Drive folder.
 */
function setup() {
  getSheet_();
  DriveApp.getFolderById(MEMORY_FOLDER_ID).getName();
}

function saveRsvp_(p) {
  const attending = p.attendance !== 'no';
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // keep simultaneous submissions from clashing
  try {
    getSheet_().appendRow([
      new Date(),
      p.fullName || '',
      attending ? 'Yes' : 'No',
      attending ? Number(p.guests) || 1 : 0,
      p.thoughts || '',
      p.link || '',
    ]);
  } finally {
    lock.releaseLock();
  }
  return { ok: true };
}

/** Saves one base64-encoded image into the memories folder (Drive only, nothing in the sheet). */
function saveMemory_(p) {
  const mimeType = String(p.mimeType || '');
  if (mimeType.indexOf('image/') !== 0) {
    return { ok: false, error: 'Only images can be uploaded.' };
  }

  const bytes = Utilities.base64Decode(String(p.data || ''));
  if (!bytes.length) return { ok: false, error: 'Empty file.' };
  if (bytes.length > MAX_UPLOAD_BYTES) return { ok: false, error: 'File is too large.' };

  const original = clean_(p.fileName) || 'photo';
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');

  const file = DriveApp.getFolderById(MEMORY_FOLDER_ID)
    .createFile(Utilities.newBlob(bytes, mimeType, stamp + ' - ' + original));

  return { ok: true, id: file.getId() };
}

/** Strips characters Drive file names should not carry. */
function clean_(value) {
  return String(value || '').replace(/[\\/:*?"<>|\r\n]+/g, ' ').trim().slice(0, 80);
}

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setFontWeight('bold')
      .setBackground('#F4E6CE');
    sheet.setFrozenRows(1);
    sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd hh:mm');
  }
  return sheet;
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
