import {ITrackDownloadMethod} from '@src/download/track-download-method';
import {TrackDownloadMethodService} from '@src/download/track-download-method-service';
import {TrackDownloadService} from '@src/download/track-download-service';
import {FilenameService} from '@src/util/filename-service';
import {useSinonChai, useSinonChrome} from '@test/test-initializers';
import {noop, tick} from '@test/test-utils';
import * as path from 'path';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {match, SinonFakeTimers, SinonSpy, SinonStub, spy, stub, useFakeTimers} from 'sinon';

const expect = useSinonChai();

describe('track download service', () => {
  const sinonChrome = useSinonChrome();
  const fixture = TrackDownloadService;

  describe('downloading a track', () => {
    const trackInfo = {downloadable: false, id: 123, original_format: 'wav', title: 'song-title'};
    const downloadMethod = {fileExtension: 'mp3', url: 'download-method-url'};
    const trackTitleNoSpecialChars = 'track-title-with-no-special-chars';
    let downloadMethod$: Subject<ITrackDownloadMethod>;
    let stubGetDownloadMethod: SinonStub;
    let stubRemoveSpecialCharacters: SinonStub;

    beforeEach(() => {
      downloadMethod$ = new Subject<ITrackDownloadMethod>();
      stubGetDownloadMethod = stub(TrackDownloadMethodService, 'getDownloadMethod');
      stubGetDownloadMethod.withArgs(trackInfo).returns(downloadMethod$);

      stubRemoveSpecialCharacters = stub(FilenameService, 'removeSpecialCharacters');
      stubRemoveSpecialCharacters.withArgs(trackInfo.title).returns(trackTitleNoSpecialChars);
      stubRemoveSpecialCharacters.callThrough();
    });

    afterEach(() => {
      stubGetDownloadMethod.restore();
      stubRemoveSpecialCharacters.restore();
    });

    context('properties of the download', () => {
      const expectedFilename = `${trackTitleNoSpecialChars}.${downloadMethod.fileExtension}`;

      it('should use the url in the download method', () => {
        fixture.downloadTrack(trackInfo);
        downloadMethod$.next(downloadMethod);
        expect(sinonChrome.downloads.download).to.have.been.calledOnce
          .calledWithMatch(match.has('url', downloadMethod.url));
      });

      it('should not ask the user where to download', () => {
        fixture.downloadTrack(trackInfo);
        downloadMethod$.next(downloadMethod);
        expect(sinonChrome.downloads.download).to.have.been.calledOnce
          .calledWithMatch(match.has('saveAs', false));
      });

      it('should use the track title with special characters trimmed ' +
        'with the file extension from the download method as the file name', () => {
        fixture.downloadTrack(trackInfo);
        downloadMethod$.next(downloadMethod);
        expect(sinonChrome.downloads.download).to.have.been.calledOnce
          .calledWithMatch(match.has('filename', expectedFilename));
      });

      it('should download to the specified download location if provided', () => {
        const downloadLocation = 'parentDir';
        fixture.downloadTrack(trackInfo, downloadLocation);
        downloadMethod$.next(downloadMethod);
        expect(sinonChrome.downloads.download).to.have.been.calledOnce
          .calledWithMatch(match.has('filename', path.join(downloadLocation, expectedFilename)));
      });
    });

    context('fetching the download method', () => {
      let fakeTimer: SinonFakeTimers;

      beforeEach(() => {
        fakeTimer = useFakeTimers();
      });

      afterEach(() => {
        fakeTimer.restore();
      });

      it('should not start the download until download method is received', () => {
        fixture.downloadTrack(trackInfo);
        expect(sinonChrome.downloads.download).to.not.have.been.called;
      });

      it('should start the download when the download method is received', () => {
        fixture.downloadTrack(trackInfo);
        downloadMethod$.next(downloadMethod);
        expect(sinonChrome.downloads.download).to.have.been.calledOnce;
      });

      it('should throw same error message and not download when there ' +
        'is an error receiving the download method', () => {
        const errorMsg = 'cannot get download method';
        expect(() => {
          fixture.downloadTrack(trackInfo);
          downloadMethod$.error(Error(errorMsg));
        }).to.throw(errorMsg);
        expect(sinonChrome.downloads.download).to.not.have.been.called;
      });

      it('should only download once if multiple download methods are received', () => {
        fixture.downloadTrack(trackInfo);
        downloadMethod$.next(downloadMethod);
        downloadMethod$.next(downloadMethod);
        expect(sinonChrome.downloads.download).to.have.been.calledOnce;
      });

      it('should not time out and download if download method is received within 10s', () => {
        fixture.downloadTrack(trackInfo);
        fakeTimer.tick(9999);
        downloadMethod$.next(downloadMethod);
        expect(sinonChrome.downloads.download).to.have.been.calledOnce;
      });

      it('should time out and not download if download method is not received within 10s', () => {
        expect(() => {
          fixture.downloadTrack(trackInfo);
          fakeTimer.tick(10001);
          downloadMethod$.next(downloadMethod);
        }).to.throw();
        expect(sinonChrome.downloads.download).to.not.have.been.called;
      });
    });

    context('the returned observable', () => {
      let subscription: Subscription;
      const callback: SinonSpy = spy();

      beforeEach(() => {
        callback.resetHistory();
      });

      afterEach(() => {
        subscription.unsubscribe();
      });

      it('should emit the download id and complete if the download started successfully', async () => {
        const downloadId = 123;
        sinonChrome.downloads.download.callsArgWithAsync(1, downloadId);

        subscription = fixture.downloadTrack(trackInfo).subscribe(callback);
        downloadMethod$.next(downloadMethod);
        expect(callback).to.not.have.been.called;
        await tick();

        expect(callback).to.have.been.calledOnce.calledWithExactly(downloadId);
        expect(subscription.closed).to.be.true;
      });

      it('should emit an error with the lastError message if the download didn\'t start successfully', async () => {
        const errorMsg = 'error message';
        sinonChrome.downloads.download.callsArgWithAsync(1, undefined);
        sinonChrome.runtime.lastError = {message: errorMsg};

        subscription = fixture.downloadTrack(trackInfo).subscribe(noop, callback);
        downloadMethod$.next(downloadMethod);
        expect(callback).to.not.have.been.called;
        await tick();

        expect(callback).to.have.been.calledOnce.calledWithExactly(errorMsg);
        expect(subscription.closed).to.be.true;
      });
    });
  });
});
