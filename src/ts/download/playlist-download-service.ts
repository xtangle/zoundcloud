import {IPlaylistDownloadResult} from 'src/ts/download/download-result';
import {IPlaylistInfo, ITrackInfo, ResourceType} from 'src/ts/download/resource/resource-info';
import {TrackDownloadService} from 'src/ts/download/track-download-service';
import {FilenameService} from 'src/ts/util/filename-service';

export const PlaylistDownloadService = {
  download(playlistInfo: IPlaylistInfo): IPlaylistDownloadResult {
    const downloadLocation = getDownloadLocation(playlistInfo);
    const tracks = playlistInfo.tracks.map(
      (trackInfo: ITrackInfo) => TrackDownloadService.download(trackInfo, downloadLocation)
    );
    return {
      kind: ResourceType.Playlist,
      playlistInfo,
      tracks
    };
  }
};

function getDownloadLocation(playlistInfo: IPlaylistInfo): string {
  const downloadLocation = `${playlistInfo.user.username} - ${playlistInfo.title}`;
  return FilenameService.removeSpecialCharacters(downloadLocation);
}
