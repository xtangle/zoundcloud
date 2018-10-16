/**
 * This command will scroll down on a SoundCloud page, allowing more items in a list to be lazily loaded.
 * On the Charts page, executing this command once should load the entire top 50 tracks into the DOM.
 */

module.exports.command = function (selector) {
  this.moveToElement(selector, 0, 0)
    .pause(1500)
    .moveToElement(selector, 0, 0)
    .pause(1500)
    .moveToElement(selector, 0, 0)
    .pause(1500)
    .moveToElement(selector, 0, 0)
    .pause(1500);
  return this;
};
