import {ID3MetadataService} from '@src/download/metadata/id3-metadata-service';
import {TrackMetadataFactory} from '@src/download/metadata/track-metadata-factory';
import {ITrackDownloadInfo} from '@src/download/track-download-info';
import {Observable, of} from 'rxjs';

export const MetadataAdapter = {
  addMetadata$(downloadInfo: ITrackDownloadInfo): Observable<ITrackDownloadInfo> {
    switch (downloadInfo.downloadOptions.filename.split('.').pop()) {
      case 'mp3':
        const metadata = TrackMetadataFactory.create(downloadInfo.trackInfo);
        return ID3MetadataService.addID3V2Metadata$(metadata, downloadInfo);
      default:
        return of(downloadInfo);
    }
  }
};
