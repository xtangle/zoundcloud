import {IPlaylistInfo, ITrackInfo} from '@src/download/download-info';
import {TrackDownloadService} from '@src/download/track-download-service';
import {FilenameService} from '@src/util/filename-service';
import {Observable, Subject} from 'rxjs/index';

export const PlaylistDownloadService = {
  download$(playlistInfo: IPlaylistInfo): Observable<number> {
    const downloadId$: Subject<number> = new Subject<number>();
    const downloadLocation = getDownloadLocation(playlistInfo);
    playlistInfo.tracks.forEach((trackInfo: ITrackInfo) => {
      TrackDownloadService.download$(trackInfo, downloadLocation).subscribe(downloadId$);
    });
    return downloadId$.asObservable();
  }
};

function getDownloadLocation(playlistInfo: IPlaylistInfo): string {
  const downloadLocation = `${playlistInfo.user.username} - ${playlistInfo.title}`;
  return FilenameService.removeSpecialCharacters(downloadLocation);
}
