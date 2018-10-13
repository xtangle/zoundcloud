import {ID3MetadataService} from '@src/download/metadata/id3-metadata-service';
import {ID3WriterService, IID3Writer} from '@src/download/metadata/id3-writer-service';
import {ITrackMetadata} from '@src/download/metadata/track-metadata';
import {ITrackDownloadInfo} from '@src/download/track-download-info';
import {XhrService} from '@src/util/xhr-service';
import {configureChai, useRxTesting} from '@test/test-initializers';
import {of, throwError, timer} from 'rxjs';
import {mapTo} from 'rxjs/operators';
import {clock, match, restore, SinonStub, stub, useFakeTimers} from 'sinon';

const expect = configureChai();

describe('id3 metadata service', () => {
  const rx = useRxTesting();

  const fixture = ID3MetadataService;
  const downloadInfo = {
    downloadOptions: {url: 'download-options-url'},
    trackInfo: {title: 'track-title'}
  } as ITrackDownloadInfo;
  const writer = {foo: 'bar'} as IID3Writer;
  const metadataAddedURL = 'url-with-metadata-added';

  let metadata: ITrackMetadata;
  let stubGetArrayBuffer$: SinonStub;
  const songData: ArrayBuffer = new Int8Array([1, 2, 3]).buffer;

  let stubAddTag: SinonStub;
  let stubSetFrame: SinonStub;
  let stubCreateWriter: SinonStub;
  let stubGetURL: SinonStub;

  beforeEach(() => {
    useFakeTimers();
    metadata = createMetadata();

    stubGetArrayBuffer$ = stub(XhrService, 'getArrayBuffer$');
    stubGetArrayBuffer$.withArgs(downloadInfo.downloadOptions.url).returns(of(songData));

    stubAddTag = stub(ID3WriterService, 'addTag');
    stubAddTag.withArgs(writer).returns(writer);

    stubSetFrame = stub(ID3WriterService, 'setFrame');
    stubSetFrame.withArgs(writer, match.string, match.any).returns(writer);

    stubCreateWriter = stub(ID3WriterService, 'createWriter');
    stubCreateWriter.withArgs(songData).returns(writer);

    stubGetURL = stub(ID3WriterService, 'getURL');
    stubGetURL.withArgs(writer).returns(metadataAddedURL);
  });

  afterEach(() => {
    restore();
  });

  describe('adding id3 metadata', () => {
    it('should emit download options with the updated url', () => {
      rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));

      verifyDownloadOptionsEmittedWithUrl(metadataAddedURL);
    });

    it('should add all textual metadata', () => {
      rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));

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

      expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'COMM', {
        description: 'Soundcloud description',
        text: ''
      });
      expect(stubAddTag).to.have.been.calledWith(writer).calledAfter(stubSetFrame);
    });

    it('should not add cover art metadata if cover art url is not defined', () => {
      const metadataWithNoCoverArtUrl = createMetadata({cover_url: undefined});
      rx.subscribeTo(fixture.addID3V2Metadata$(metadataWithNoCoverArtUrl, downloadInfo));

      expect(stubSetFrame).to.not.have.been.calledWith(writer, 'APIC', match.any);
    });

    it('should add metadata if fetching the song data takes less 5 minutes', () => {
      stubGetArrayBuffer$.withArgs(downloadInfo.downloadOptions.url)
        .returns(timer(299999).pipe(mapTo(songData)));
      rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));
      clock.tick(300000);

      verifyDownloadOptionsEmittedWithUrl(metadataAddedURL);
    });

    it('should not add metadata if fetching the song data takes 5 minutes or more', () => {
      stubGetArrayBuffer$.withArgs(downloadInfo.downloadOptions.url)
        .returns(timer(300000).pipe(mapTo(songData)));
      rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));
      clock.tick(300001);

      verifyDownloadOptionsEmittedWithUrl(downloadInfo.downloadOptions.url);
    });

    it('should not add metadata if an error occurred fetching the song data', () => {
      stubGetArrayBuffer$.withArgs(downloadInfo.downloadOptions.url)
        .returns(throwError('error fetching song data'));
      rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));

      verifyDownloadOptionsEmittedWithUrl(downloadInfo.downloadOptions.url);
    });

    describe('adding cover art metadata', () => {
      const coverArtData: ArrayBuffer = new Int8Array([4, 5, 6]).buffer;
      let expectedFrame: any;

      beforeEach(() => {
        metadata = createMetadata({cover_url: 'cover-url'});
        expectedFrame = {
          data: coverArtData,
          description: `Soundcloud artwork. Source: ${metadata.cover_url}`,
          type: 3,
          useUnicodeEncoding: false
        };
        stubGetArrayBuffer$.withArgs(metadata.cover_url).returns(of(coverArtData));
      });

      it('should not add cover art metadata if there is no cover art url', () => {
        const metadataWithNoCoverArtUrl = {...metadata, cover_url: ''};
        rx.subscribeTo(fixture.addID3V2Metadata$(metadataWithNoCoverArtUrl, downloadInfo));
        expect(stubSetFrame).not.to.have.been.calledWith(writer, 'APIC', match.any);
      });

      it('should add cover art metadata if there is cover art url', () => {
        rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));

        expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'APIC', expectedFrame);
        expect(stubAddTag).to.have.been.calledWith(writer).calledAfter(stubSetFrame);
        verifyDownloadOptionsEmittedWithUrl(metadataAddedURL);
      });

      it('should add cover art metadata if fetching cover art data takes less than 20 seconds', () => {
        stubGetArrayBuffer$.withArgs(metadata.cover_url)
          .returns(timer(19999).pipe(mapTo(coverArtData)));
        rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));
        clock.tick(20000);

        expect(stubSetFrame).to.have.been.calledWith(writer, 'APIC', expectedFrame);
      });

      it('should not add cover art metadata if fetching cover art data takes 20 seconds or more', () => {
        stubGetArrayBuffer$.withArgs(metadata.cover_url)
          .returns(timer(20000).pipe(mapTo(coverArtData)));
        rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));
        clock.tick(20001);

        expect(stubSetFrame).to.not.have.been.calledWith(writer, 'APIC', match.any);
      });

      it('should not add cover art metadata if there is an error while fetching cover art', () => {
        stubGetArrayBuffer$.withArgs(metadata.cover_url)
          .returns(throwError('Some error'));
        rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadInfo));

        expect(stubSetFrame).to.not.have.been.calledWith(writer, 'APIC', match.any);
      });
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
    expect(rx.next).to.have.been.calledOnceWithExactly(expectedDownloadInfo);
    expect(rx.error).to.not.have.been.called;
    expect(rx.complete).to.have.been.called;
  }

  function createMetadata(overrides: object = {}): ITrackMetadata {
    return {
      albumArtist: 'some-album-artist',
      artist_url: 'artist-url',
      audio_source_url: 'audio-source-url',
      bpm: 200,
      cover_url: '', // No cover art url
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
