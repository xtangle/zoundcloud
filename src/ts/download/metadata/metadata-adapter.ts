import {ITrackInfo} from '@src/download/download-info';
import {ID3MetadataService} from '@src/download/metadata/id3-metadata-service';
import {Observable} from 'rxjs/Observable';
import DownloadOptions = chrome.downloads.DownloadOptions;

export interface IMetadataAdapter {
  addMetadata$(trackInfo: ITrackInfo, downloadOptions: DownloadOptions): Observable<DownloadOptions>;
}

export const MetadataAdapter: IMetadataAdapter = {
  addMetadata$(trackInfo: ITrackInfo, downloadOptions: DownloadOptions): Observable<DownloadOptions> {
    const extension = getFileExtension(downloadOptions.filename);
    switch (extension) {
      case 'mp3':
        return ID3MetadataService.addID3V2Metadata(trackInfo, downloadOptions);
      default:
        return Observable.of(downloadOptions);
    }
  }
};

function getFileExtension(filename: string): string {
  return filename.split('.').slice(-1)[0];
}
