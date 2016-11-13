# ZoundCloud Playlist Downloader

## Description

A Chrome extension which adds a download button when visiting any playlist page on SoundCloud. Tracks in the playlist 
will be downloaded in the subfolder '%user% - %playlist%' of the Downloads folder, where %user% is the username of the
owner of the playlist, and %playlist% is the title of the playlist.

It will attempt to download every track in the playlist sequentially, in the order specified by the playlist. If a track
is downloadable in its original format, it will attempt to download that first; otherwise, it will download the streamable
128kb mp3 version. After the download has started, the user has the option to stop the download at any time. Only one
playlist can be downloaded at any time.

## Installation

- Navigate to 'chrome://extensions'
- Click "Load Unpacked Extension"
- Select the root folder of this extension