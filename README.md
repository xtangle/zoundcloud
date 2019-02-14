<a href="https://chrome.google.com/webstore/detail/zoundcloud-downloader/bhnpokjikdldjiimbmoakkfekcnpkkij">
  <img src="https://github.com/xtangle/zoundcloud/blob/master/src/resources/icon128.png" width="96" height="96">
</a>

# ZoundCloud Downloader

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/bhnpokjikdldjiimbmoakkfekcnpkkij.svg)](https://chrome.google.com/webstore/detail/zoundcloud-downloader/bhnpokjikdldjiimbmoakkfekcnpkkij)
[![Build Status](https://img.shields.io/travis/com/xtangle/zoundcloud.svg)](https://travis-ci.com/xtangle/zoundcloud)
[![Coverage Status](https://img.shields.io/coveralls/github/xtangle/zoundcloud.svg)](https://coveralls.io/github/xtangle/zoundcloud?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/xtangle/zoundcloud/badge.svg?targetFile=package.json)](https://snyk.io/test/github/xtangle/zoundcloud?targetFile=package.json)
[![Dependencies Status](https://img.shields.io/david/xtangle/ZoundCloud.svg)](https://david-dm.org/xtangle/ZoundCloud)
[![DevDependencies Status](https://img.shields.io/david/dev/xtangle/ZoundCloud.svg)](https://david-dm.org/xtangle/ZoundCloud?type=dev)
[![CodeFactor](https://www.codefactor.io/repository/github/xtangle/zoundcloud/badge)](https://www.codefactor.io/repository/github/xtangle/zoundcloud)

## Description

A Google Chrome extension that adds download buttons to SoundCloud web pages. 

<img src="https://github.com/xtangle/zoundcloud/blob/master/docs/img1.png" width="800">

This extension will add download buttons to:

* Individual track pages.
* User pages (downloads all of a user's tracks).
* Playlist pages (downloads the entire playlist).
* Tracks that are contained in scrollable lists.

By default, when a download is started it will download the mp3 version of the song with metadata (including cover art) added. 
It can be configured from the options menu to not add metadata or prefer to download songs in its uploaded format (if available).

Metadata information and cover art is automatically added to files in .mp3 format.
The added metadata includes: cover art, title, album artist, genres, duration, release year, bpm, 
artist url, audio source url, and description.

Note: When metadata is enabled, download progress will not show in the browser until the entire song is downloaded.

All tracks will be downloaded to the user's default Downloads folder.

* Tracks are downloaded with the name `track_title`.
* Playlists are downloaded to a folder with the name `user_name - playlist_name`.
* User tracks are downloaded to a folder with the name `user_name`.

If a file with the same name exists, it will not be overwritten. This can be changed from
the options menu.

Special characters in the title will be replaced by an underscore (unless it's a tilda, in which
case it is replaced by a dash (-) symbol). 

The extension will attempt to remove strings in track titles matching variations of
'Free Download' or 'Download Link' as the suffix. The regex used for matching is configurable.

## Installation

### From Chrome Web Store

- Install from the [extension page here](https://chrome.google.com/webstore/detail/zoundcloud-downloader/bhnpokjikdldjiimbmoakkfekcnpkkij).

### From Archive

- Go to the [Releases](https://github.com/xtangle/zoundcloud/releases) page and download the `zoundcloud-<version-number>.zip` file of the release you wish to install.
- Extract the downloaded zip file to a folder anywhere.
- Open Google Chrome and navigate to `chrome://extensions`.
- Click `Load Unpacked` and choose the folder where the contents were extracted to in the first step. 

### From Source

The extension is created as a Node.js project and does not come pre-packaged. 
To build from source, make sure Node.js (version >= 7.6) and yarn is installed.

- Clone the project from GitHub to a local directory.
- In the project directory, run `yarn install`.
- Run either `yarn run build` (for extra logging) or `yarn run build:prod` (for production build).
- Open Google Chrome and navigate to `chrome://extensions`.
- Click `Load Unpacked` and choose the `dist` folder in this project.

## Todo

* Make downloads cancellable.
* Some visual indicator to track current and previous download progress.
