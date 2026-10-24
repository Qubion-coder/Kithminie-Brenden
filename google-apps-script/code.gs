// Kithminie & Brenden wedding – saves RSVPs into the Google Sheet.
// https://docs.google.com/spreadsheets/d/1cVGUcmnMWsgHjDN5KyS97ch4JkcbGhh1QrxaDoovpSo/edit
const SPREADSHEET_ID = '1cVGUcmnMWsgHjDN5KyS97ch4JkcbGhh1QrxaDoovpSo';

const SHEET_NAME = 'rsvp';
const HEADERS = ['Timestamp', 'Guest Name', 'Attending', 'Seats', 'Message', 'Invitation Link'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    const p = (e && e.parameter) || {};
    const attending = p.attendance !== 'no';

    lock.waitLock(10000); // keep simultaneous submissions from clashing
    getSheet_().appendRow([
      new Date(),
      p.fullName || '',
      attending ? 'Yes' : 'No',
      attending ? Number(p.guests) || 1 : 0,
      p.thoughts || '',
      p.link || '',
    ]);

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error && error.message ? error.message : error) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return jsonResponse_({ ok: true, message: 'Wedding RSVP endpoint is running.' });
}

/** Run once from the editor (select "setup" ▸ Run) to create the rsvp tab with headers. */
function setup() {
  getSheet_();
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
