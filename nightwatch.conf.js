const path = require('path');
const globals = require('./e2e/globals.js');

const extensionPath = path.join(__dirname, 'dist');
const e2ePath = path.join(__dirname, 'e2e');

module.exports = {
  src_folders: path.join(e2ePath, 'tests'),
  output_folder: path.join(e2ePath, 'output'),
  page_objects_path: '',
  custom_commands_path: path.join(e2ePath, 'commands'),
  custom_assertions_path: path.join(e2ePath, 'assertions'),
  globals_path: path.join(e2ePath, 'globals.js'),
  test_workers: {
    enabled: false,
    workers: 'auto',
  },
  webdriver: {
    start_process: false,
    server_path: 'node_modules/.bin/chromedriver',
    port: 9515,
    timeout_options: {
      timeout: 20000,
    },
  },
  test_settings: {
    default: {
      launch_url: 'http://soundcloud.com',
      default_path_prefix: '',
      detailed_output: true,
      screenshots: {
        enabled: true,
        on_failure: true,
        on_error: false,
        path: path.join(e2ePath, 'output'),
      },
      desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
          args: [
            '--no-sandbox',
            '--mute-audio',
            '--disable-gpu',
            '--window-size=1920,1080',
            '--start-maximized',
            `--load-extension=${extensionPath}`,
          ],
          prefs: {
            'download.default_directory': globals.downloadDir,
          },
        },
        acceptSslCerts: true,
      },
    },
  },
};
