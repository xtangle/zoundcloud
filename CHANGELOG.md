# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
- Added options menu, making the following settings configurable:
  - Enable/disable adding metadata to mp3 files.
  - Enable/disable always downloading tracks in .mp3 format.
  - Enable/disable removing matched text from track titles, and make the matching regex configurable.
  - Enable/disable overwriting existing files with the same file name.
- Added basic page action functionality:
  - Toolbar icon becomes colorized whenever visiting a SoundCloud page.
  - Clicking on the icon opens up the options page.

### Changed
- Changed default behavior to always download tracks in .mp3 format rather than the original uploaded format if available.
- Changed the default track title matching pattern to capture more patterns (specifically patterns with the text 'Download Link').

## [v1.3.2] - 2018-10-16
### Added
- Added functionality of removing the text 'Free Download' or variations thereof at the end of a song title.

### Changed
- Increased frequency of adding download buttons to a page.

## [v1.3.1] - 2018-10-08
### Added
- Added high resolution cover art (if available) in downloaded metadata.

## [v1.3.0] - 2018-06-24
### Added
- Added short description and pictures to be used in the Chrome web store.

### Changed
- Changed name to 'ZoundCloud Downloader'.
- Changed extension logo.

### Fixed
- Fixed download buttons not sometimes injecting at page load.

## [v1.2.0] - 2018-06-22
### Added
- Download functionality for user tracks.
- Download functionality for playlists.
- Download functionality for track lists.

### Changed
- Increased timeout for downloading tracks.
- Changed format of log messages to include the tab id and timestamp.

### Fixed
- Fixed issue where download buttons are sometimes not injected to the page.
- Fixed issue where content page is not cleaned up when tab is closed or navigating away from a SoundCloud page.

## [v1.1.0] - 2018-05-13
### Added
- Metadata information and cover art to files downloaded in .mp3 format.
- Changelog.

## v1.0.0 - 2018-05-06
### Added
- Download button functionality to Soundcloud's individual track pages.
- Webpack builds for development and production.
- Hot-reloading of extension in Chrome browser.
- Karma test infrastructure.
- Travis CI integration.

[Unreleased]: https://github.com/xtangle/zoundcloud/compare/v1.3.2...HEAD
[v1.3.2]: https://github.com/xtangle/zoundcloud/compare/v1.3.1...v1.3.2
[v1.3.1]: https://github.com/xtangle/zoundcloud/compare/v1.3.0...v1.3.1
[v1.3.0]: https://github.com/xtangle/zoundcloud/compare/v1.2.0...v1.3.0
[v1.2.0]: https://github.com/xtangle/zoundcloud/compare/v1.1.0...v1.2.0
[v1.1.0]: https://github.com/xtangle/zoundcloud/compare/v1.0.0...v1.1.0
