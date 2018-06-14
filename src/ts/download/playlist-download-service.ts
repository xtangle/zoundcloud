import {IPlaylistDownloadResult} from '@src/download/download-result';
import {IPlaylistInfo, ITrackInfo, ResourceType} from '@src/download/resource/resource-info';
import {TrackDownloadService} from '@src/download/track-download-service';
import {FilenameService} from '@src/util/filename-service';

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
