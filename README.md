# ZoundCloud

[![Build Status](https://img.shields.io/travis/xtangle/ZoundCloud.svg)](https://travis-ci.org/xtangle/ZoundCloud)
[![DevDependencies Status](https://img.shields.io/david/dev/xtangle/ZoundCloud.svg)](https://david-dm.org/xtangle/ZoundCloud?type=dev)
[![Coverage Status](https://img.shields.io/coveralls/github/xtangle/ZoundCloud.svg)](https://coveralls.io/github/xtangle/ZoundCloud?branch=master)
[![CodeFactor](https://www.codefactor.io/repository/github/xtangle/zoundcloud/badge)](https://www.codefactor.io/repository/github/xtangle/zoundcloud)

## Description

A Google Chrome extension that adds a download button to any SoundCloud web page that has
a track as its main content.

It attempts to download a track in its uploaded format (i.e. highest quality) and will only
resort to the streamable 128kb mp3 version if no better quality is available.

Metadata information and cover art is automatically added to files in .mp3 format (in ID3v2.3).

Tracks are downloaded to the Downloads folder with the **track title** as its name.
Special characters in the title will be replaced by an underscore (unless it's a tilda, in which
case it is replaced by a dash (-) symbol).

## Installation

The extension is created as a Node.js project and does not come pre-packaged. 
To build, make sure Node.js (version >= 7.6) and yarn is installed.

- Clone the project to a local directory.
- In the project root, run `yarn install`.
- Run `yarn run build`.
- Open Chrome and navigate to `chrome://extensions`.
- Click `Load Unpacked` and choose the `dist` folder in this project.

There are other yarn run scripts under `package.json` that are useful for developing purposes.

## Features yet to be implemented

The following features will be added in the future.

- Download button on playlist pages
- Download buttons for each track within a list of tracks
- Download button on user pages
