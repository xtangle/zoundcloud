/**
 * Checks if the specified file has the given size in bytes.
 *
 * ```
 *    this.demoTest = function (client) {
 *      browser.assert.fileHasSize("downloads/some_file.txt", 2388853);
 *    };
 * ```
 *
 * @method fileDownloaded
 * @param {string} filepath The path of the file to check.
 * @param {int} size The size to check in bytes.
 * @param {string} [msg] Optional log message to display in the output. If missing, one is displayed by default.
 * @api assertions
 */

const fs = require('fs');

exports.assertion = function (filepath, size, msg) {
  const DEFAULT_MSG = `Testing if file at '${filepath}' has ${size} bytes.`;
  const MSG_FILE_NOT_FOUND = `${DEFAULT_MSG} File not found.`;
  const MSG_FILE_WRONG_SIZE = `${DEFAULT_MSG} Wrong file size.`;

  this.message = msg || DEFAULT_MSG;
  this.expected = size;

  this.pass = function (value) {
    const fileExists = value !== null;
    const correctFileSize = value === size;

    if (!fileExists) {
      this.message = msg || MSG_FILE_NOT_FOUND;
    } else if (!correctFileSize) {
      this.message = msg || MSG_FILE_WRONG_SIZE;
    }

    return fileExists && correctFileSize;
  };

  this.value = function (result) {
    // file not found
    if (!result || !result.isFile()) {
      return null;
    }
    return result.size;
  };

  this.command = function (callback) {
    fs.stat(filepath, function (err, stats) {
      callback(stats);
    });
    return this;
  };
};