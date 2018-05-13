import {ITrackInfo} from '@src/download/download-info';
import {ID3MetadataService} from '@src/download/metadata/id3-metadata-service';
import {TrackMetadataFactory} from '@src/download/metadata/track-metadata-factory';
import {Observable, of} from 'rxjs';
import DownloadOptions = chrome.downloads.DownloadOptions;

export interface IMetadataAdapter {
  addMetadata$(trackInfo: ITrackInfo, downloadOptions: DownloadOptions): Observable<DownloadOptions>;
}

export const MetadataAdapter: IMetadataAdapter = {
  addMetadata$(trackInfo: ITrackInfo, downloadOptions: DownloadOptions): Observable<DownloadOptions> {
    const metadata = TrackMetadataFactory.create(trackInfo);
    const extension = getFileExtension(downloadOptions.filename);
    switch (extension) {
      case 'mp3':
        return ID3MetadataService.addID3V2Metadata$(metadata, downloadOptions);
      default:
        return of(downloadOptions);
    }
  }
};

function getFileExtension(filename: string): string {
  return filename.split('.').slice(-1)[0];
}
