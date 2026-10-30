// Kithminie & Brenden wedding – saves guest photos from /memory into Google Drive.
// Standalone project, separate from the RSVP script.
// https://drive.google.com/drive/folders/1NEYxpebbgWwZcvLFKao8xbzHBe6_SjNZ
const MEMORY_FOLDER_ID = '1NEYxpebbgWwZcvLFKao8xbzHBe6_SjNZ';
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};
    const mimeType = String(p.mimeType || '');
    if (mimeType.indexOf('image/') !== 0) {
      return jsonResponse_({ ok: false, error: 'Only images can be uploaded.' });
    }

    const bytes = Utilities.base64Decode(String(p.data || ''));
    if (!bytes.length) return jsonResponse_({ ok: false, error: 'Empty file.' });
    if (bytes.length > MAX_UPLOAD_BYTES) return jsonResponse_({ ok: false, error: 'File is too large.' });

    const original = String(p.fileName || 'photo').replace(/[\\/:*?"<>|\r\n]+/g, ' ').trim().slice(0, 80);
    const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH.mm.ss');

    const file = DriveApp.getFolderById(MEMORY_FOLDER_ID)
      .createFile(Utilities.newBlob(bytes, mimeType, stamp + ' - ' + original));

    return jsonResponse_({ ok: true, id: file.getId() });
  } catch (error) {
    return jsonResponse_({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, message: 'Wedding memory upload endpoint is running.' });
}

/**
 * Run once (select "setup" ▸ Run) and click Allow. It writes and then removes a
 * tiny test file, which makes Google ask for full Drive access up front.
 */
function setup() {
  const folder = DriveApp.getFolderById(MEMORY_FOLDER_ID);
  const test = folder.createFile('permission-test.txt', 'ok');
  test.setTrashed(true);
  Logger.log('Drive access OK for folder: ' + folder.getName());
}

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
