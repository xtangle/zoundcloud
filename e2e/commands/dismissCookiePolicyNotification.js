/**
 * This command will dismiss SoundCloud's notification banner about their Cookie policy.
 */

module.exports.command = function () {
  const btnSelector = '.announcements .announcement button';
  this
    .waitForElementVisible(btnSelector)
    .click(btnSelector);
  return this;
};
