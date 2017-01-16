# ZoundCloud Downloader

## Description

A Google Chrome extension that adds download buttons on any playlist page, track page, 
and components containing list of tracks on SoundCloud. It is currently a work in progress.

For playlists, it will download every track in the playlist sequentially in the same order 
as listed in the playlist. It will attempt to download a track in its uploaded format and 
best quality, and will resort to download the streamable 128kb mp3 version if no better 
quality is available.

Single tracks will be downloaded in the Downloads folder with the name:

* [artist] - [track_title]

Tracks in playlists will be downloaded to the folder:

* Downloads/[user] - [playlist_name]

where [user] is the username of the owner of the playlist.

Once a playlist download is queued, the user can stop the sequence of downloads at any time. 
One playlist can be downloaded at any given time.

## Installation

The project is a Node.js project and the extension does not come pre-packaged. To
install, you will have to build it. Make sure you have Node.js (version >= 6.9.2)
installed and the npm package `gulp-cli` installed globally before continuing.

- Clone the project to a local directory.
- In the project root, run `npm install`.
- Run the command `gulp` to pack the extension.
- Navigate to `chrome://extensions` in the Chrome browser.
- Drag the `ZoundCloud.crx` file in the `dist` folder to the extensions page.

## Change Log

### 1.1.1

- Add individual download buttons to playlist tracks when on a playlist page.

### 1.1.0

- Added individual track download functionality.