import {Observable, of} from 'rxjs';
import {catchError, flatMap, map, timeout} from 'rxjs/operators';
import {ID3MetadataService} from 'src/ts/download/metadata/id3-metadata-service';
import {ITrackMetadata} from 'src/ts/download/metadata/track-metadata';
import {TrackMetadataFactory} from 'src/ts/download/metadata/track-metadata-factory';
import {ITrackDownloadInfo} from 'src/ts/download/track-download-info';
import {XhrService} from 'src/ts/util/xhr-service';

export const MetadataAdapter = {
  addMetadata$(downloadInfo: ITrackDownloadInfo): Observable<ITrackDownloadInfo> {
    const fileExtension = downloadInfo.downloadOptions.filename.split('.').pop();
    const metadata$ = of(TrackMetadataFactory.create(downloadInfo.trackInfo)).pipe(
      flatMap(withUpdatedCoverArtUrl$)
    );

    switch (fileExtension) {
      case 'mp3':
        return metadata$.pipe(
          flatMap((metadata: ITrackMetadata) => ID3MetadataService.addID3V2Metadata$(metadata, downloadInfo))
        );
      default:
        return of(downloadInfo);
    }
  }
};

function withUpdatedCoverArtUrl$(metadata: ITrackMetadata): Observable<ITrackMetadata> {
  const origUrl = metadata.cover_url;
  if (!origUrl) {
    return of(metadata);
  }
  const highResUrl = getCoverArtUrlForResolution(origUrl, 500);
  return XhrService.ping$(highResUrl).pipe(
    timeout(10000),
    map((status: number) => (status === 200) ? highResUrl : origUrl),
    map((url: string) => ({...metadata, cover_url: url})),
    catchError(() => of(metadata) as Observable<ITrackMetadata>),
  );
}

function getCoverArtUrlForResolution(url: string, resolution: number): string {
  return url.replace(/^(.*)-large(\..*)$/, `$1-t${resolution}x${resolution}$2`);
}
