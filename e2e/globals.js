const chromedriver = require('chromedriver');
const path = require('path');
const rimraf = require('rimraf');

const outputPath = path.join(__dirname, 'output');

module.exports = {
  before(done) {
    rimraf.sync(outputPath);
    chromedriver.start();
    done();
  },
  after(done) {
    chromedriver.stop();
    done();
  },
  downloadDir: path.join(outputPath, 'downloads'),
  waitForConditionTimeout: 5000,
  throwOnMultipleElementsReturned: true,
};
