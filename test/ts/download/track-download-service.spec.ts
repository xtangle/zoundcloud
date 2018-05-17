import {MetadataAdapter} from '@src/download/metadata/metadata-adapter';
import {TrackDownloadMethodService} from '@src/download/track-download-method-service';
import {TrackDownloadService} from '@src/download/track-download-service';
import {FilenameService} from '@src/util/filename-service';
import {useFakeTimer, useRxTesting, useSinonChai, useSinonChrome} from '@test/test-initializers';
import * as path from 'path';
import {NEVER, of, throwError, timer} from 'rxjs';
import {map} from 'rxjs/operators';
import {match, SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe(`track download service`, () => {
  const sinonChrome = useSinonChrome();
  const cw = useFakeTimer();
  const rx = useRxTesting();
  const fixture = TrackDownloadService;

  describe(`downloading a track`, () => {
    const trackInfo = {
      downloadable: false,
      id: 123,
      original_format: 'wav',
      title: 'song-title',
      user: {username: 'foo'}
    };
    const downloadMethod = {fileExtension: 'mp3', url: 'download-method-url'};
    const trackTitleNoSpecialChars = 'track-title-with-no-special-chars';

    let stubGetDownloadMethod: SinonStub;
    let stubRemoveSpecialCharacters: SinonStub;
    let stubAddMetadata: SinonStub;

    setUpStubServices();

    context(`properties of the download`, () => {
      const expectedFilename = `${trackTitleNoSpecialChars}.${downloadMethod.fileExtension}`;

      it(`should use the url in the download method`, () => {
        rx.subscribeTo(fixture.downloadTrack(trackInfo));
        expect(sinonChrome.downloads.download).to.have.been.calledOnce
          .calledWithMatch(match.has('url', downloadMethod.url));
      });

      it(`should not ask the user where to download`, () => {
        fixture.downloadTrack(trackInfo);
        expect(sinonChrome.downloads.download).to.have.been.calledOnce
          .calledWithMatch(match.has('saveAs', false));
      });

      it(`should use the track title with special characters trimmed ` +
        `with the file extension from the download method as the file name`, () => {
        fixture.downloadTrack(trackInfo);
        expect(sinonChrome.downloads.download).to.have.been.calledOnce
          .calledWithMatch(match.has('filename', expectedFilename));
      });

      it(`should download to the specified download location if provided`, () => {
        const downloadLocation = 'parentDir';
        fixture.downloadTrack(trackInfo, downloadLocation);
        expect(sinonChrome.downloads.download).to.have.been.calledOnce
          .calledWithMatch(match.has('filename', path.join(downloadLocation, expectedFilename)));
      });
    });

    context(`fetching the download method`, () => {
      it(`should start the download when the download method is received`, () => {
        fixture.downloadTrack(trackInfo);
        expect(sinonChrome.downloads.download).to.have.been.calledOnce;
      });

      it(`should only download once if multiple download methods are received`, () => {
        stubGetDownloadMethod.withArgs(trackInfo).returns(of(downloadMethod, downloadMethod));
        fixture.downloadTrack(trackInfo);
        expect(sinonChrome.downloads.download).to.have.been.calledOnce;
      });

      it(`should throw error message if there is an error fetching the download method`, () => {
        const errorMsg = 'cannot get download method';
        stubGetDownloadMethod.withArgs(trackInfo).returns(throwError(errorMsg));
        expect(() => {
          fixture.downloadTrack(trackInfo);
          cw.clock.next();
        }).to.throw(errorMsg);
        expect(sinonChrome.downloads.download).to.not.have.been.called;
      });

      it(`should download if download method is received within 10s`, () => {
        stubGetDownloadMethod.withArgs(trackInfo).returns(timer(9999).pipe(map(() => downloadMethod)));
        fixture.downloadTrack(trackInfo);
        cw.clock.tick(9999);
        expect(sinonChrome.downloads.download).to.have.been.calledOnce;
      });

      it(`should throw error and not download if download method is not received within 10s`, () => {
        stubGetDownloadMethod.withArgs(trackInfo).returns(NEVER);
        expect(() => {
          fixture.downloadTrack(trackInfo);
          cw.clock.tick(10001);
        }).to.throw();
        expect(sinonChrome.downloads.download).to.not.have.been.called;
      });
    });

    context(`the returned observable`, () => {
      it(`should emit the download id and complete if the download started successfully`, () => {
        const downloadId = 123;
        sinonChrome.downloads.download.yields(downloadId);
        rx.subscribeTo(fixture.downloadTrack(trackInfo));
        cw.clock.next();

        expect(rx.next).to.have.been.calledOnce.calledWithExactly(downloadId);
        expect(rx.complete).to.have.been.called;
      });

      it(`should emit an error with the lastError message if the download didn't start successfully`, () => {
        const errorMsg = 'error message';
        sinonChrome.runtime.lastError = {message: errorMsg};
        sinonChrome.downloads.download.yields(undefined);
        rx.subscribeTo(fixture.downloadTrack(trackInfo));
        cw.clock.next();

        expect(rx.next).to.not.have.been.called;
        expect(rx.error).to.have.been.calledWithExactly(errorMsg);
      });
    });

    function setUpStubServices() {
      beforeEach(() => {
        stubGetDownloadMethod = stub(TrackDownloadMethodService, 'getDownloadMethod$');
        stubGetDownloadMethod.withArgs(trackInfo).returns(of(downloadMethod));

        stubRemoveSpecialCharacters = stub(FilenameService, 'removeSpecialCharacters');
        stubRemoveSpecialCharacters.withArgs(trackInfo.title).returns(trackTitleNoSpecialChars);

        stubAddMetadata = stub(MetadataAdapter, 'addMetadata$');
        stubAddMetadata.withArgs(trackInfo, match.any).callsFake((_, downloadOptions) => of(downloadOptions));
      });

      afterEach(() => {
        stubGetDownloadMethod.restore();
        stubRemoveSpecialCharacters.restore();
        stubAddMetadata.restore();
      });
    }
  });
});
