/**
 * This command will dismiss SoundCloud's notification banner about their Cookie policy.
 */

module.exports.command = function () {
  this.click('.announcements .announcement button');
  return this;
};
