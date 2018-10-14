const chromedriver = require('chromedriver');
const path = require('path');
const rimraf = require('rimraf');

const outputPath = path.join(__dirname, 'output');

module.exports = {
  before: function(done) {
    rimraf.sync(outputPath);
    chromedriver.start();
    done();
  },
  after: function(done) {
    chromedriver.stop();
    done();
  },
  downloadDir: path.join(outputPath, 'downloads'),
  waitForConditionTimeout: 10000
};
