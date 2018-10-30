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
 * @param {string} [msg] Optional log message to display in the output.
 *        If missing, one is displayed by default.
 * @api assertions
 */

const fs = require('fs');
const util = require('util');

const POLL_INTERVAL_IN_MS = 1000;
const TIMEOUT_IN_MS = 30000;

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

exports.assertion = function (filepath, msg) {
  const DEFAULT_MSG = `Testing if file was downloaded to '${filepath}'.`;
  const MSG_SUCCESSFUL = `${DEFAULT_MSG} File found after %d ms.`;
  const MSG_FILE_NOT_FOUND = `${DEFAULT_MSG} File not found after %d ms.`;
  let startTime;

  this.message = msg || DEFAULT_MSG;
  this.expected = true;

  this.pass = function (value) {
    const elapsedTime = Date.now() - startTime;
    this.message = msg || util.format(value ? MSG_SUCCESSFUL : MSG_FILE_NOT_FOUND, elapsedTime);
    return value;
  };

  this.value = function (result) {
    return !!result && result.isFile();
  };

  this.command = function (callback) {
    startTime = Date.now();
    pollStats(startTime, filepath, callback);
    return this;
  };
};
