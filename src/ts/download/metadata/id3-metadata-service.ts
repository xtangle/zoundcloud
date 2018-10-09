import {ID3WriterService, IID3Writer} from '@src/download/metadata/id3-writer-service';
import {ITrackMetadata} from '@src/download/metadata/track-metadata';
import {ITrackDownloadInfo} from '@src/download/track-download-info';
import {logger} from '@src/util/logger';
import {XhrService} from '@src/util/xhr-service';
import {Observable, of} from 'rxjs';
import {catchError, flatMap, map, timeout} from 'rxjs/operators';

/**
 * Adds ID3 v2.4 tags and returns downloadInfo with url in downloadOptions set to the updated URL.
 * To add the tags, it must download the entire mp3 file as an array buffer in memory, hence the
 * generous timeout allotted for the operation.
 */
export const ID3MetadataService = {
  addID3V2Metadata$(metadata: ITrackMetadata, downloadInfo: ITrackDownloadInfo): Observable<ITrackDownloadInfo> {
    return XhrService.getArrayBuffer$(downloadInfo.downloadOptions.url).pipe(
      timeout(300000),
      flatMap(writeMetadata$.bind(null, metadata)),
      map(ID3WriterService.getURL),
      map((url: string) => ({
        ...downloadInfo,
        downloadOptions: {
          ...downloadInfo.downloadOptions,
          url
        }
      } as any)),
      catchError((err: Error) => {
        logger.error(`Unable to fetch metadata for track ${downloadInfo.trackInfo.title}`, err);
        return of(downloadInfo);
      })
    );
  }
};

function writeMetadata$(metadata: ITrackMetadata, arrayBuffer: ArrayBuffer): Observable<IID3Writer> {
  return of(ID3WriterService.createWriter(arrayBuffer)).pipe(
    map(withTextualMetadata.bind(null, metadata)),
    flatMap(withCoverArt$.bind(null, metadata)),
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
    text: metadata.description || ''
  });
  return writer;
}

function withCoverArt$(metadata: ITrackMetadata, writer: IID3Writer): Observable<IID3Writer> {
  const url = metadata.cover_url;
  if (!url) {
    return of(writer);
  }
  return XhrService.getArrayBuffer$(url).pipe(
    map((arrayBuffer: ArrayBuffer) =>
      ID3WriterService.setFrame(writer, 'APIC', {
        data: arrayBuffer,
        description: 'Soundcloud artwork',
        type: 3,
        useUnicodeEncoding: false
      })
    ),
    timeout(20000),
    catchError((err: Error) => {
      logger.error(`Unable to fetch cover art for track ${metadata.title}`, err);
      return of(writer);
    })
  );
}
