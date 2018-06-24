<img src="https://github.com/xtangle/ZoundCloud/blob/master/src/resources/icon128.png" width="96" height="96">

# ZoundCloud Downloader

[![Build Status](https://img.shields.io/travis/xtangle/ZoundCloud.svg)](https://travis-ci.org/xtangle/ZoundCloud)
[![DevDependencies Status](https://img.shields.io/david/dev/xtangle/ZoundCloud.svg)](https://david-dm.org/xtangle/ZoundCloud?type=dev)
[![Coverage Status](https://img.shields.io/coveralls/github/xtangle/ZoundCloud.svg)](https://coveralls.io/github/xtangle/ZoundCloud?branch=master)
[![CodeFactor](https://www.codefactor.io/repository/github/xtangle/zoundcloud/badge)](https://www.codefactor.io/repository/github/xtangle/zoundcloud)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/bhnpokjikdldjiimbmoakkfekcnpkkij.svg)](https://chrome.google.com/webstore/detail/zoundcloud-downloader/bhnpokjikdldjiimbmoakkfekcnpkkij)

## Description

A Google Chrome extension that adds download buttons to SoundCloud web pages. 

<img src="https://github.com/xtangle/ZoundCloud/blob/master/docs/img1.png" width="800">

This extension will add download buttons to:

* Individual track pages.
* User pages (will download all of a user's tracks).
* Playlist pages (will download the playlist).
* Tracks that are contained in scrollable lists.

When a download is initiated, it attempts to download a track in its uploaded format (i.e. highest quality) and will only
resort to the streamable 128kb mp3 version if no better quality is available.

Metadata information and cover art is automatically added to files in .mp3 format (in ID3v2.3).

All tracks will be downloaded to the default Downloads folder:

* Tracks are downloaded with the name `track_title`.
* Playlists are downloaded to a folder with the name `user_name - playlist_name`.
* User tracks are downloaded to a folder wih the name `user_name`.

If a file with the same name exists, it will not be overwritten.

Special characters in the title will be replaced by an underscore (unless it's a tilda, in which
case it is replaced by a dash (-) symbol).

## Installation

### From Chrome Web Store

- Install from the [extension page here](https://chrome.google.com/webstore/detail/zoundcloud-downloader/bhnpokjikdldjiimbmoakkfekcnpkkij).

### From Archive

- Go to the [Releases](https://github.com/xtangle/ZoundCloud/releases) page and download the `zoundcloud-<version-number>.zip` file of the release you wish to install.
- Extract the downloaded zip file to a folder anywhere.
- Open Google Chrome and navigate to `chrome://extensions`.
- Click `Load Unpacked` and choose the folder where the contents were extracted to in the first step. 

### From Source

The extension is created as a Node.js project and does not come pre-packaged. 
To build, make sure Node.js (version >= 7.6) and yarn is installed.

- Clone the project to a local directory.
- In the project directory, run `yarn install`.
- Run `yarn run build` or `yarn run build:prod`.
- Open Google Chrome and navigate to `chrome://extensions`.
- Click `Load Unpacked` and choose the `dist` folder in this project.

## Todo

* Make download options configurable through a menu interface.
* Some visual indicator to track current download status and previous downloads.
* Protractor tests to cover integration.
