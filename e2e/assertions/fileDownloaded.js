/**
 * Checks if the specified file with the given file size has been downloaded.
 *
 * ```
 *    this.demoTest = function (client) {
 *      browser.assert.fileDownloaded("downloads/some_file.txt", 2388853);
 *    };
 * ```
 *
 * @method fileDownloaded
 * @param {string} filepath The path of the expected file to be downloaded.
 * @param {int} filesize The file size to check in bytes.
 * @param {string} [msg] Optional log message to display in the output. If missing, one is displayed by default.
 * @api assertions
 */

const fs = require('fs');
const util = require('util');

const POLL_INTERVAL_IN_MS = 1000;
const TIMEOUT_IN_MS = 15000;

exports.assertion = function(filepath, filesize, msg) {
  const DEFAULT_MSG = util.format('Testing if file was downloaded to <%s> and is %d bytes.', filepath, filesize);
  const MSG_FILE_NOT_FOUND = `${DEFAULT_MSG} File not found.`;
  const MSG_FILE_WRONG_SIZE = `${DEFAULT_MSG} Wrong file size.`;

  this.message = msg || DEFAULT_MSG;
  this.expected = filesize;

  this.pass = function(value) {
    const fileExists = value !== null;
    const correctFileSize = value === filesize;

    if (!fileExists) {
      this.message = msg || MSG_FILE_NOT_FOUND;
    } else if (!correctFileSize) {
      this.message = msg || MSG_FILE_WRONG_SIZE;
    }

    return fileExists && correctFileSize;
  };

  this.value = function(result) {
    // file not found
    if (!result || !result.isFile()) {
      result = null;
    }
    return result.size;
  };

  this.command = function(callback) {
    pollStats(Date.now(), filepath, callback);
    return this;
  };
};

function pollStats(startTime, filepath, callback) {
  if (Date.now() - startTime > TIMEOUT_IN_MS) {
    callback(null);
  } else {
    fs.stat(filepath, function(err, stats) {
      if (err) {
        setTimeout(pollStats.bind(this, startTime, filepath, callback), POLL_INTERVAL_IN_MS);
      } else {
        callback(stats);
      }
    })
  }
}
