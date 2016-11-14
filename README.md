# ZoundCloud Downloader

## Description

A Google Chrome extension that adds a download button on any playlist or track page on SoundCloud.

For playlists, it will download every track in the playlist sequentially, in the same order as listed in the playlist. 
It will attempt to download a track in its original format if it's available. If not, it will download the streamable 
128kb mp3 version.

Tracks will be downloaded in the Downloads folder. Tracks in playlists will be downloaded in Downloads/{user} - {playlist}, 
where {user} is the username of the owner of the playlist, and {playlist} is the title of the playlist.

After a playlist download has started, the user can stop the download at any time. Only one playlist can be downloaded 
at any given time.

## Installation

- Navigate to 'chrome://extensions'
- Click "Load Unpacked Extension"
- Select the root folder of this extension

## Change Log

### 1.1.0

- Added individual track download functionality