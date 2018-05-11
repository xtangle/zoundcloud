import {ITrackInfo} from '@src/download/download-info';
import {ITrackMetadata} from '@src/download/metadata/track-metadata';
import {TrackMetadataService} from '@src/download/metadata/track-metadata-service';
import {logger} from '@src/util/logger';
import {XhrRequestService} from '@src/util/xhr-request-service';
import * as _ from 'lodash';
import {Observable, of} from 'rxjs';
import {catchError, first, map, switchMap, timeout} from 'rxjs/operators';
import DownloadOptions = chrome.downloads.DownloadOptions;

const ID3Writer = require('browser-id3-writer');

export interface IID3MetadataService {
  // Adds ID3 v2.4 tags
  addID3V2Metadata(trackInfo: ITrackInfo, downloadOptions: DownloadOptions): Observable<DownloadOptions>;
}

export const ID3MetadataService: IID3MetadataService = {
  addID3V2Metadata(trackInfo: ITrackInfo, downloadOptions: DownloadOptions): Observable<DownloadOptions> {
    const metadata = TrackMetadataService.toTrackMetadata(trackInfo);
    return XhrRequestService.getArrayBuffer$(downloadOptions.url).pipe(
      first(),
      switchMap(writeMetadata.bind(null, metadata)),
      map((writer: typeof ID3Writer) => ({...downloadOptions, url: writer.getURL()})),
      timeout(30000),
      catchError((err: any) => {
        logger.error(err);
        return of(downloadOptions);
      })
    );
  }
};

function writeMetadata(metadata: ITrackMetadata, arrayBuffer: ArrayBuffer): Observable<typeof ID3Writer> {
  return of(new ID3Writer(arrayBuffer)).pipe(
    map(withTextualMetadata.bind(null, metadata)),
    switchMap(withCoverArt.bind(null, metadata)),
    map(withTagAdded)
  );
}

function withTextualMetadata(metadata: ITrackMetadata, writer: typeof ID3Writer): typeof ID3Writer {
  writer
    .setFrame('TIT2', metadata.title)
    .setFrame('TPE1', [metadata.albumArtist])
    .setFrame('TPE2', metadata.albumArtist)
    .setFrame('TCON', metadata.genres)
    .setFrame('TLEN', metadata.duration)
    .setFrame('TBPM', metadata.bpm)
    .setFrame('WOAR', metadata.artist_url)
    .setFrame('WOAS', metadata.audio_source_url)
    .setFrame('COMM', {
      description: 'Soundcloud description',
      text: metadata.description
    });
  if (!_.isNil(metadata.release_year)) {
    writer.setFrame('TYER', metadata.release_year);
  }
  return writer;
}

function withCoverArt(metadata: ITrackMetadata, writer: typeof ID3Writer): Observable<typeof ID3Writer> {
  if (_.isNil(metadata.cover_url)) {
    return of(writer);
  }
  return XhrRequestService.getArrayBuffer$(metadata.cover_url).pipe(
    first(),
    map((arrayBuffer: ArrayBuffer) =>
      writer.setFrame('APIC', {
        data: arrayBuffer,
        description: 'Soundcloud artwork',
        type: 3,
        useUnicodeEncoding: false
      })),
    timeout(10000),
    catchError((err: any) => {
      logger.error(err);
      return of(writer);
    })
  );
}

function withTagAdded(writer: typeof ID3Writer): typeof ID3Writer {
  writer.addTag();
  return writer;
}
