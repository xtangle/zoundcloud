const path = require('path');
const extensionPath = path.join(__dirname, 'dist');

module.exports = {
  "src_folders" : ["e2e/tests"],
  "output_folder" : "e2e/reports",
  "page_objects_path" : "",
  "globals_path" : "e2e/globals.js",
  "selenium" : {
    "start_process" : false
  },
  "test_settings" : {
    "default" : {
      "selenium_port"  : 9515,
      "selenium_host"  : "0.0.0.0",
      "default_path_prefix" : "",
      "request_timeout_options": {
        "timeout": 20000
      },

      "desiredCapabilities": {
        "browserName": "chrome",
        "chromeOptions" : {
          "args" : [
            "headless",
            "no-sandbox",
            `load-extension=${extensionPath}`
          ]
        },
        "acceptSslCerts": true
      }
    }
  }
};
