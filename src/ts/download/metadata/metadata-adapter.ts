import {ID3MetadataService} from '@src/download/metadata/id3-metadata-service';
import {ITrackMetadata} from '@src/download/metadata/track-metadata';
import {TrackMetadataFactory} from '@src/download/metadata/track-metadata-factory';
import {ITrackDownloadInfo} from '@src/download/track-download-info';
import {XhrService} from '@src/util/xhr-service';
import {Observable, of} from 'rxjs';
import {flatMap, map} from 'rxjs/operators';

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
  const highResUrl = getCoverArtUrlForResolution(origUrl, 500);
  return XhrService.ping$(highResUrl).pipe(
    map((status: number) => (status === 200) ? highResUrl : origUrl),
    map((url: string) => ({...metadata, cover_url: url}))
  );
}

function getCoverArtUrlForResolution(url: string, resolution: number): string {
  return url.replace(/^(.*)-large(\..*)$/, `$1-t${resolution}x${resolution}$2`);
}
