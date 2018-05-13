import {ID3WriterService, IID3Writer} from '@src/download/metadata/id3-writer-service';
import {ITrackMetadata} from '@src/download/metadata/track-metadata';
import {logger} from '@src/util/logger';
import {XhrRequestService} from '@src/util/xhr-request-service';
import * as _ from 'lodash';
import {Observable, of} from 'rxjs';
import {catchError, first, map, switchMap, timeout} from 'rxjs/operators';
import DownloadOptions = chrome.downloads.DownloadOptions;

export interface IID3MetadataService {
  // Adds ID3 v2.4 tags
  addID3V2Metadata$(metadata: ITrackMetadata, downloadOptions: DownloadOptions): Observable<DownloadOptions>;
}

export const ID3MetadataService: IID3MetadataService = {
  addID3V2Metadata$(metadata: ITrackMetadata, downloadOptions: DownloadOptions): Observable<DownloadOptions> {
    return XhrRequestService.getArrayBuffer$(downloadOptions.url).pipe(
      first(),
      switchMap(writeMetadata$.bind(null, metadata)),
      map(ID3WriterService.getURL),
      map((url: string) => ({...downloadOptions, url})),
      timeout(30000),
      catchError((err: any) => {
        logger.error(err);
        return of(downloadOptions);
      })
    );
  }
};

function writeMetadata$(metadata: ITrackMetadata, arrayBuffer: ArrayBuffer): Observable<IID3Writer> {
  return of(ID3WriterService.createWriter(arrayBuffer)).pipe(
    map(withTextualMetadata.bind(null, metadata)),
    switchMap(withCoverArt$.bind(null, metadata)),
    map(ID3WriterService.addTag)
  );
}

function withTextualMetadata(metadata: ITrackMetadata, writer: IID3Writer): IID3Writer {
  ID3WriterService.setFrame(writer, 'TIT2', metadata.title);
  ID3WriterService.setFrame(writer, 'TPE1', [metadata.albumArtist]);
  ID3WriterService.setFrame(writer, 'TPE2', metadata.albumArtist);
  ID3WriterService.setFrame(writer, 'TCON', metadata.genres);
  ID3WriterService.setFrame(writer, 'TLEN', metadata.duration);
  ID3WriterService.setFrame(writer, 'TYER', metadata.release_year);
  ID3WriterService.setFrame(writer, 'TBPM', metadata.bpm);
  ID3WriterService.setFrame(writer, 'WOAR', metadata.artist_url);
  ID3WriterService.setFrame(writer, 'WOAS', metadata.audio_source_url);
  ID3WriterService.setFrame(writer, 'COMM', {
    description: 'Soundcloud description',
    text: metadata.description
  });
  return writer;
}

function withCoverArt$(metadata: ITrackMetadata, writer: IID3Writer): Observable<IID3Writer> {
  if (_.isNil(metadata.cover_url)) {
    return of(writer);
  }
  return XhrRequestService.getArrayBuffer$(metadata.cover_url).pipe(
    first(),
    map((arrayBuffer: ArrayBuffer) =>
      ID3WriterService.setFrame(writer, 'APIC', {
        data: arrayBuffer,
        description: 'Soundcloud artwork',
        type: 3,
        useUnicodeEncoding: false
      })
    ),
    timeout(10000),
    catchError((err: any) => {
      logger.error(err);
      return of(writer);
    })
  );
}
