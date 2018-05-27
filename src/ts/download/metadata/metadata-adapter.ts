import {ID3MetadataService} from '@src/download/metadata/id3-metadata-service';
import {TrackMetadataFactory} from '@src/download/metadata/track-metadata-factory';
import {ITrackDownloadMethod} from '@src/download/track-download-method';
import {Observable, of} from 'rxjs';
import DownloadOptions = chrome.downloads.DownloadOptions;

export const MetadataAdapter = {
  addMetadata$(downloadMethod: ITrackDownloadMethod, downloadOptions: DownloadOptions): Observable<DownloadOptions> {
    const metadata = TrackMetadataFactory.create(downloadMethod.trackInfo);
    switch (downloadMethod.fileExtension) {
      case 'mp3':
        return ID3MetadataService.addID3V2Metadata$(metadata, downloadOptions);
      default:
        return of(downloadOptions);
    }
  }
};
