import {ID3MetadataService} from '@src/download/metadata/id3-metadata-service';
import {ID3WriterService, IID3Writer} from '@src/download/metadata/id3-writer-service';
import {ITrackMetadata} from '@src/download/metadata/track-metadata';
import {ITrackDownloadInfo} from '@src/download/track-download-info';
import {XhrRequestService} from '@src/util/xhr-request-service';
import {useFakeTimer, useRxTesting, useSinonChai} from '@test/test-initializers';
import {of, throwError, timer} from 'rxjs';
import {mapTo} from 'rxjs/operators';
import {match, SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe('id3 metadata service', () => {
  const rx = useRxTesting();
  const cw = useFakeTimer();

  const fixture = ID3MetadataService;
  const metadata = createMetadata();
  const downloadInfo = {downloadOptions: {url: 'download-options-url'}} as ITrackDownloadInfo;
  const writer = {foo: 'bar'} as IID3Writer;
  const metadataAddedURL = 'url-with-metadata-added';

  let stubGetArrayBuffer$: SinonStub;
  const songData: ArrayBuffer = new Int8Array([1, 2, 3]).buffer;
  const coverArtData: ArrayBuffer = new Int8Array([4, 5, 6]).buffer;

  beforeEach(() => {
    stubGetArrayBuffer$ = stub(XhrRequestService, 'getArrayBuffer$');
    stubGetArrayBuffer$.withArgs(downloadInfo.downloadOptions.url).returns(of(songData));
    stubGetArrayBuffer$.withArgs(metadata.cover_url).returns(of(coverArtData));
  });

  afterEach(() => {
    stubGetArrayBuffer$.restore();
  });

  describe('adding id3 metadata', () => {
    let stubAddTag: SinonStub;
    let stubSetFrame: SinonStub;
    let stubCreateWriter: SinonStub;
    let stubGetURL: SinonStub;

    beforeEach(() => {
      stubAddTag = stub(ID3WriterService, 'addTag');
      stubSetFrame = stub(ID3WriterService, 'setFrame');
      stubCreateWriter = stub(ID3WriterService, 'createWriter');
      stubGetURL = stub(ID3WriterService, 'getURL');

      stubAddTag.withArgs(writer).returns(writer);
      stubSetFrame.withArgs(writer, match.string, match.any).returns(writer);
      stubCreateWriter.withArgs(songData).returns(writer);
      stubGetURL.withArgs(writer).returns(metadataAddedURL);
    });

    afterEach(() => {
      stubAddTag.restore();
      stubSetFrame.restore();
      stubCreateWriter.restore();
      stubGetURL.restore();
    });

    it('should emit download options with the updated url', () => {
      rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));
      cw.clock.next();

      verifyDownloadOptionsEmittedWithUrl(metadataAddedURL);
    });

    it('should add all textual metadata', () => {
      rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));
      cw.clock.next();

      expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'TIT2', metadata.title);
      expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'TPE1', [metadata.albumArtist]);
      expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'TPE2', metadata.albumArtist);
      expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'TCON', metadata.genres);
      expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'TLEN', metadata.duration);
      expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'TYER', metadata.release_year);
      expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'TBPM', metadata.bpm);
      expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'WOAR', metadata.artist_url);
      expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'WOAS', metadata.audio_source_url);
      expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'COMM', {
        description: 'Soundcloud description',
        text: metadata.description
      });
      expect(stubAddTag).to.have.been.calledWith(writer).calledAfter(stubSetFrame);
    });

    it('should add an empty string comment metadata if it is undefined', () => {
      rx.subscribeTo(fixture.addID3V2Metadata$(
        createMetadata({description: undefined}), downloadInfo));
      cw.clock.next();

      expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'COMM', {
        description: 'Soundcloud description',
        text: ''
      });
      expect(stubAddTag).to.have.been.calledWith(writer).calledAfter(stubSetFrame);
    });

    it('should add cover art metadata', () => {
      rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));
      cw.clock.next();

      expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'APIC', {
        data: coverArtData,
        description: 'Soundcloud artwork',
        type: 3,
        useUnicodeEncoding: false
      });
      expect(stubAddTag).to.have.been.calledWith(writer).calledAfter(stubSetFrame);
      verifyDownloadOptionsEmittedWithUrl(metadataAddedURL);
    });

    it('should not add cover art metadata if cover art url is not defined', () => {
      const metadataWithNoCoverArtUrl = createMetadata({cover_url: undefined});
      rx.subscribeTo(fixture.addID3V2Metadata$(metadataWithNoCoverArtUrl, downloadInfo));
      cw.clock.next();

      expect(stubSetFrame).to.not.have.been.calledWith(writer, 'APIC', match.any);
    });

    it('should add metadata if fetching the song data takes less 5 minutes', () => {
      stubGetArrayBuffer$.withArgs(downloadInfo.downloadOptions.url)
        .returns(timer(299999).pipe(mapTo(songData)));
      rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));
      cw.clock.tick(300000);

      verifyDownloadOptionsEmittedWithUrl(metadataAddedURL);
    });

    it('should not add metadata if fetching the song data takes 5 minutes or more', () => {
      stubGetArrayBuffer$.withArgs(downloadInfo.downloadOptions.url)
        .returns(timer(300000).pipe(mapTo(songData)));
      rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));
      cw.clock.tick(300001);

      verifyDownloadOptionsEmittedWithUrl(downloadInfo.downloadOptions.url);
    });

    it('should not add metadata if an error occurred fetching the song data', () => {
      stubGetArrayBuffer$.withArgs(downloadInfo.downloadOptions.url)
        .returns(throwError('error fetching song data'));
      rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));
      cw.clock.next();

      verifyDownloadOptionsEmittedWithUrl(downloadInfo.downloadOptions.url);
    });

    it('should add cover art metadata if fetching cover art data takes less than 60 seconds', () => {
      stubGetArrayBuffer$.withArgs(metadata.cover_url)
        .returns(timer(59999).pipe(mapTo(coverArtData)));
      rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));
      cw.clock.tick(60000);

      expect(stubSetFrame).to.have.been.calledWith(writer, 'APIC', match.any);
    });

    it('should not add cover art metadata if fetching cover art data takes 60 seconds or more', () => {
      stubGetArrayBuffer$.withArgs(metadata.cover_url)
        .returns(timer(60000).pipe(mapTo(coverArtData)));
      rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));
      cw.clock.tick(60001);

      expect(stubSetFrame).to.not.have.been.calledWith(writer, 'APIC', match.any);
    });

    it('should not add cover art metadata if there is an error while fetching cover art', () => {
      stubGetArrayBuffer$.withArgs(metadata.cover_url)
        .returns(throwError('Some error'));
      rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));
      cw.clock.next();

      expect(stubSetFrame).to.not.have.been.calledWith(writer, 'APIC', match.any);
    });
  });

  function verifyDownloadOptionsEmittedWithUrl(url: string) {
    const expectedDownloadInfo = {
      ...downloadInfo,
      downloadOptions: {
        ...downloadInfo.downloadOptions,
        url
      }
    };
    expect(rx.next).to.have.been.calledOnce.calledWithExactly(expectedDownloadInfo);
    expect(rx.error).to.not.have.been.called;
    expect(rx.complete).to.have.been.called;
  }

  function createMetadata(overrides: object = {}): ITrackMetadata {
    return {
      albumArtist: 'some-album-artist',
      artist_url: 'artist-url',
      audio_source_url: 'audio-source-url',
      bpm: 200,
      cover_url: 'cover-url',
      description: 'soundcloud-track-description',
      duration: 12345,
      genres: ['rock', 'classical'],
      release_day: 15,
      release_month: 4,
      release_year: 2008,
      title: 'some-title',
      ...overrides
    };
  }
});
