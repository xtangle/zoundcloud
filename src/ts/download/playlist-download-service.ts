import {IPlaylistInfo} from '@src/download/download-info';
import {TrackDownloadService} from '@src/download/track-download-service';
import {FilenameService} from '@src/util/filename-service';
import {logger} from '@src/util/logger';
import {EMPTY, from, Observable, ReplaySubject} from 'rxjs';
import {catchError, mergeMap} from 'rxjs/operators';

export const PlaylistDownloadService = {
  download$(playlistInfo: IPlaylistInfo): Observable<number> {
    const downloadId$ = new ReplaySubject<number>();
    const downloadLocation = getDownloadLocation(playlistInfo);
    from(playlistInfo.tracks).pipe(
      mergeMap((trackInfo) =>
        TrackDownloadService.download$(trackInfo, downloadLocation).pipe(
          catchError((err) => {
            logger.error(`Cannot download track ${trackInfo.title} in playlist`, err);
            return EMPTY;
          })
        )
      )
    ).subscribe(downloadId$);
    return downloadId$.asObservable();
  }
};

function getDownloadLocation(playlistInfo: IPlaylistInfo): string {
  const downloadLocation = `${playlistInfo.user.username} - ${playlistInfo.title}`;
  return FilenameService.removeSpecialCharacters(downloadLocation);
}
