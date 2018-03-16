import {CLIENT_ID, I1_CLIENT_ID, SC_I1_API_URL} from '@src/constants';
import {ITrackInfo} from '@src/download/download-info';
import {DownloadService} from '@src/download/download-service';
import {useSinonChai, useSinonChrome} from '@test/test-initializers';
import {noop, tick} from '@test/test-utils';
import {Subscription} from 'rxjs/Subscription';
import {SinonSpy, spy} from 'sinon';

const expect = useSinonChai();

describe('download service', () => {
  const sinonChrome = useSinonChrome.call(this);
  const fixture = DownloadService;

  describe('downloading a track', () => {

    context('initiating the download', () => {
      it('should initiate the download using the download_url if possible', () => {
        const trackInfo = createTrackInfo();
        fixture.downloadTrack(trackInfo);
        expect(sinonChrome.downloads.download).calledWith(
          {saveAs: false, url: `${trackInfo.download_url}?client_id=${CLIENT_ID}`});
      });

      it('should initiate the download using the stream_url if download_url cannot be used', () => {
        const trackInfo = createTrackInfo(false);
        fixture.downloadTrack(trackInfo);
        expect(sinonChrome.downloads.download).calledWith(
          {saveAs: false, url: `${trackInfo.stream_url}?client_id=${CLIENT_ID}`});
      });

      it('should initiate the download using the i1 api if both download_url and stream_url cannot be used', () => {
        const trackInfo = createTrackInfo(false, false);
        fixture.downloadTrack(trackInfo);
        expect(sinonChrome.downloads.download).calledWith(
          {saveAs: false, url: `${SC_I1_API_URL}/tracks/${trackInfo.id}/streams?client_id=${I1_CLIENT_ID}`});
      });
    });

    context('the returned observable', () => {
      let subscription: Subscription;
      const callback: SinonSpy = spy();

      beforeEach(() => {
        sinonChrome.downloads.download.resetBehavior();
        callback.resetHistory();
      });

      afterEach(() => {
        subscription.unsubscribe();
      });

      it('should emit the download id and complete if the download started successfully', async () => {
        const downloadId = 123;
        sinonChrome.downloads.download.callsArgWithAsync(1, downloadId);

        subscription = fixture.downloadTrack(createTrackInfo()).subscribe(callback);
        expect(callback).to.not.have.been.called;
        await tick();

        expect(callback).to.have.been.calledOnce.calledWithExactly(downloadId);
        expect(subscription.closed).to.be.true;
      });

      it('should emit an error with the lastError message if the download didn\'t start successfully', async () => {
        const errorMsg = 'error message';
        sinonChrome.downloads.download.callsArgWithAsync(1, undefined);
        sinonChrome.runtime.lastError = {message: errorMsg};

        subscription = fixture.downloadTrack(createTrackInfo()).subscribe(noop, callback);
        expect(callback).to.not.have.been.called;
        await tick();

        expect(callback).to.have.been.calledOnce.calledWithExactly(errorMsg);
        expect(subscription.closed).to.be.true;
      });
    });

    function createTrackInfo(downloadable: boolean = true, hasStreamUrl: boolean = true): ITrackInfo {
      return {
        download_url: 'https://api.soundcloud.com/tracks/208094428/download',
        downloadable,
        id: 123,
        stream_url: hasStreamUrl ? 'https://api.soundcloud.com/tracks/208094428/stream' : undefined,
        title: 'song-title'
      };
    }

  });

});
