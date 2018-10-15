/**
 * Checks if a file has been downloaded to the specified file path.
 *
 * ```
 *    this.demoTest = function (client) {
 *      browser.assert.fileDownloaded("downloads/some_file.txt");
 *    };
 * ```
 *
 * @method fileDownloaded
 * @param {string} filepath The path of the expected file to be downloaded.
 * @param {string} [msg] Optional log message to display in the output. If missing, one is displayed by default.
 * @api assertions
 */

const fs = require('fs');

const POLL_INTERVAL_IN_MS = 1000;
const TIMEOUT_IN_MS = 15000;

exports.assertion = function (filepath, msg) {
  const DEFAULT_MSG = `Testing if file was downloaded to '${filepath}'.`;
  const MSG_FILE_NOT_FOUND = `${DEFAULT_MSG} File was not found after ${TIMEOUT_IN_MS} ms.`;

  this.message = msg || DEFAULT_MSG;
  this.expected = true;

  this.pass = function (value) {
    if (!value) {
      this.message = msg || MSG_FILE_NOT_FOUND;
    }
    return value;
  };

  this.value = function (result) {
    return !!result && result.isFile();
  };

  this.command = function (callback) {
    pollStats(Date.now(), filepath, callback);
    return this;
  };
};

function pollStats(startTime, filepath, callback) {
  if (Date.now() - startTime > TIMEOUT_IN_MS) {
    callback(null);
  } else {
    fs.stat(filepath, function (err, stats) {
      if (err) {
        setTimeout(pollStats.bind(this, startTime, filepath, callback), POLL_INTERVAL_IN_MS);
      } else {
        callback(stats);
      }
    });
  }
}
