const path = require('path');
const globals = require('./e2e/globals.js');

const extensionPath = path.join(__dirname, 'dist');
const e2ePath = path.join(__dirname, 'e2e');

module.exports = {
  "src_folders" : path.join(e2ePath, 'tests'),
  "output_folder" : path.join(e2ePath, 'output'),
  "page_objects_path" : "",
  "custom_assertions_path": path.join(e2ePath, 'assertions'),
  "globals_path" : path.join(e2ePath, 'globals.js'),
  "selenium" : {
    "start_process" : false
  },
  "test_settings" : {
    "default" : {
      "launch_url" : "http://soundcloud.com",
      "selenium_port": 9515,
      "selenium_host": "0.0.0.0",
      "default_path_prefix" : "",
      "request_timeout_options": {
        "timeout": 20000
      },
      "screenshots" : {
        "enabled": true,
        "on_failure" : true,
        "on_error" : false,
        "path": path.join(e2ePath, 'output')
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
          ],
          "prefs": {
            "download.default_directory": globals.downloadDir
          }
        },
        "acceptSslCerts": true
      }
    }
  }
};
