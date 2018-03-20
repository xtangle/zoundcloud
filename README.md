# ZoundCloud

[![Build Status](https://travis-ci.org/xtangle/ZoundCloud.svg?branch=master)](https://travis-ci.org/xtangle/ZoundCloud)

## Description

A Google Chrome extension that adds a download button to any SoundCloud web page that has
a track as its main content.

It will attempt to download a track in its uploaded format and will resort to the 
stream-able 128kb mp3 version if no better quality is available.

Tracks will be downloaded to the Downloads folder with the track title as its name.
Special characters in the name will be replaced by an underscore (unless it's a tilda, in which
case it will be replaced by a dash).

## Installation

The extension is created as a Node.js project and does not come pre-packaged. 
To build, make sure Node.js (version >= 7.6) and yarn is installed.

- Clone the project to a local directory.
- In the project root, run `yarn install`.
- Run `yarn run build`.
- Open Chrome and navigate to `chrome://extensions`.
- Click `Load Unpacked` and choose the `dist` folder in this project.

There are other yarn run scripts under `package.json` that are useful for developing purposes.

## Additional Features

The following features will be added in the future.

- Download button on playlist pages
- Download buttons for lists of tracks
- Download button on user pages