# ZoundCloud Playlist Downloader

## Description

A Chrome extension that adds a download button on any playlist page on SoundCloud.

It will  download every track in the playlist sequentially, in the order specified by the playlist. It will attempt 
to download a track in its original format if available, otherwise, it will download the streamable 128kb mp3 version.

Tracks will be downloaded in the folder Downloads/%user% - %playlist%, where %user% is the username of the owner of 
the playlist, and %playlist% is the title of the playlist.

After a download has started, the user can stop the download at any time. Only one playlist can be downloaded at a time.

## Installation

- Navigate to 'chrome://extensions'
- Click "Load Unpacked Extension"
- Select the root folder of this extension