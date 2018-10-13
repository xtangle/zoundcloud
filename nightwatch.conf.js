const path = require('path');
const extensionPath = path.join(__dirname, 'dist');

module.exports = {
  "src_folders" : ["e2e/tests"],
  "output_folder" : "e2e/output",
  "page_objects_path" : "",
  "globals_path" : "e2e/globals.js",
  "selenium" : {
    "start_process" : false
  },
  "test_settings" : {
    "default" : {
      "selenium_port": 9515,
      "selenium_host": "0.0.0.0",
      "default_path_prefix" : "",
      "request_timeout_options": {
        "timeout": 20000
      },

      "desiredCapabilities": {
        "browserName": "chrome",
        "chromeOptions" : {
          "args" : [
            "--no-sandbox",
            "--mute-audio",
            "--disable-gpu",
            "--window-size=1920,1080",
            "--start-maximized",
            `--load-extension=${extensionPath}`
          ]
        },
        "acceptSslCerts": true
      }
    }
  }
};
