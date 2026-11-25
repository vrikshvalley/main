/**
 * Vriksh Valley newsletter -> Google Sheet.
 *
 * Setup:
 * 1. Create a Google Sheet (name it e.g. "Vriksh Valley Newsletter").
 * 2. Extensions > Apps Script. Paste this file over the default code.
 * 3. Project Settings > Script properties > add  SECRET = <a long random string>.
 * 4. Deploy > New deployment > type "Web app":
 *      Execute as: Me      Who has access: Anyone
 *    Copy the Web app URL.
 * 5. In the site's environment: NEWSLETTER_SHEET_URL = that URL,
 *    NEWSLETTER_SECRET = the same string as SECRET. Redeploy the site.
 * After editing this script later: Deploy > Manage deployments > edit > New version.
 */
var SHEET_NAME = "Subscribers";
var HEADERS = ["Subscribed at (IST)", "Email", "Source"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var body = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty("SECRET");
    if (!secret || body.secret !== secret) return json_({ ok: false, error: "unauthorized" });

    var email = String(body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return json_({ ok: false, error: "invalid_email" });

    var sheet = getSheet_();
    var last = sheet.getLastRow();
    if (last > 1) {
      var existing = sheet.getRange(2, 2, last - 1, 1).getValues();
      for (var i = 0; i < existing.length; i++) {
        if (String(existing[i][0]).toLowerCase() === email) return json_({ ok: true, duplicate: true });
      }
    }
    var when = Utilities.formatDate(new Date(), "Asia/Kolkata", "yyyy-MM-dd HH:mm:ss");
    sheet.appendRow([when, email, String(body.source || "footer").slice(0, 40)]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: "server_error" });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json_({ ok: true, service: "vriksh-valley-newsletter" });
}

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
