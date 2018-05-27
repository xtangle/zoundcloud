import {ID3MetadataService} from '@src/download/metadata/id3-metadata-service';
import {ID3WriterService, IID3Writer} from '@src/download/metadata/id3-writer-service';
import {ITrackMetadata} from '@src/download/metadata/track-metadata';
import {XhrRequestService} from '@src/util/xhr-request-service';
import {useRxTesting, useSinonChai} from '@test/test-initializers';
import {NEVER, of, throwError} from 'rxjs';
import {match, SinonFakeTimers, SinonStub, stub} from 'sinon';
import DownloadOptions = chrome.downloads.DownloadOptions;

const expect = useSinonChai();

describe('id3 metadata service', () => {
  const rx = useRxTesting();

  const fixture = ID3MetadataService;
  const metadata = createMetadata();
  const downloadOptions: DownloadOptions = {filename: 'some-filename', url: 'download-options-url'};
  const writer = {foo: 'bar'} as IID3Writer;
  const metadataAddedURL = 'url-with-metadata-added';

  let stubGetArrayBuffer$: SinonStub;
  const songData: ArrayBuffer = new Int8Array([1, 2, 3]).buffer;
  const coverArtData: ArrayBuffer = new Int8Array([4, 5, 6]).buffer;

  let stubAddTag: SinonStub;
  let stubSetFrame: SinonStub;
  let stubCreateWriter: SinonStub;
  let stubGetURL: SinonStub;

  setUpStubID3WriterService();

  beforeEach(() => {
    stubGetArrayBuffer$ = stub(XhrRequestService, 'getArrayBuffer$');
  });

  afterEach(() => {
    stubGetArrayBuffer$.restore();
  });

  describe('adding id3 metadata', () => {
    const sinon = require('sinon');
    let fakeTimer: SinonFakeTimers;

    beforeEach(() => {
      fakeTimer = sinon.useFakeTimers();
    });

    afterEach(() => {
      fakeTimer.restore();
    });

    context('when the song data cannot be fetched', () => {
      it('should not add metadata if fetching the song data times out', () => {
        stubGetArrayBuffer$.withArgs(downloadOptions.url).returns(NEVER);
        rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadOptions));
        fakeTimer.tick(60001);

        verifyDownloadOptionsEmittedWithUrl(downloadOptions.url);
      });

      it('should not add metadata if an error occurred fetching the song data', () => {
        stubGetArrayBuffer$.withArgs(downloadOptions.url).returns(throwError('error fetching song data'));
        rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadOptions));
        fakeTimer.next();

        verifyDownloadOptionsEmittedWithUrl(downloadOptions.url);
      });
    });

    context('when the song data can be fetched', () => {
      beforeEach(() => {
        stubGetArrayBuffer$.withArgs(downloadOptions.url).returns(of(songData));
        stubGetArrayBuffer$.withArgs(metadata.cover_url).returns(of(coverArtData));
      });

      it('should emit download options with the updated url', () => {
        rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadOptions));
        fakeTimer.next();

        verifyDownloadOptionsEmittedWithUrl(metadataAddedURL);
      });

      it('should add all textual metadata', () => {
        rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadOptions));
        fakeTimer.next();

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
          createMetadata({description: undefined}), downloadOptions));
        fakeTimer.next();

        expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'COMM', {
          description: 'Soundcloud description',
          text: ''
        });
        expect(stubAddTag).to.have.been.calledWith(writer).calledAfter(stubSetFrame);
      });

      it('should add cover art metadata', () => {
        rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadOptions));
        fakeTimer.next();

        expect(stubSetFrame).to.have.been.calledWithExactly(writer, 'APIC', {
          data: coverArtData,
          description: 'Soundcloud artwork',
          type: 3,
          useUnicodeEncoding: false
        });
        expect(stubAddTag).to.have.been.calledWith(writer).calledAfter(stubSetFrame);
      });

      it('should not add cover art metadata if cover art url is not defined', () => {
        const metadataWithNoCoverArtUrl = createMetadata({cover_url: undefined});
        rx.subscribeTo(fixture.addID3V2Metadata$(metadataWithNoCoverArtUrl, downloadOptions));
        fakeTimer.next();

        expect(stubSetFrame).to.not.have.been.calledWith(writer, 'APIC', match.any);
        verifyDownloadOptionsEmittedWithUrl(metadataAddedURL);
      });

      it('should not add cover art metadata if fetching cover art data times out', () => {
        stubGetArrayBuffer$.withArgs(metadata.cover_url).returns(NEVER);
        rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadOptions));
        fakeTimer.tick(20001);

        expect(stubSetFrame).to.not.have.been.calledWith(writer, 'APIC', match.any);
        verifyDownloadOptionsEmittedWithUrl(metadataAddedURL);
      });

      it('should not add cover art metadata if there is an error while fetching cover art', () => {
        stubGetArrayBuffer$.withArgs(metadata.cover_url).returns(throwError('Some error'));
        rx.subscribeTo(fixture.addID3V2Metadata$(metadata, downloadOptions));
        fakeTimer.next();

        expect(stubSetFrame).to.not.have.been.calledWith(writer, 'APIC', match.any);
        verifyDownloadOptionsEmittedWithUrl(metadataAddedURL);
      });
    });

    function verifyDownloadOptionsEmittedWithUrl(url: string) {
      expect(rx.next).to.have.been.calledOnce.calledWithExactly({...downloadOptions, url});
      expect(rx.error).to.not.have.been.called;
      expect(rx.complete).to.have.been.called;
    }
  });

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

  function setUpStubID3WriterService() {
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
  }
});
