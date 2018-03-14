import {DownloadService} from '@src/download/download-service';
import {noop, tick} from '@test/test-utils';
import * as chai from 'chai';
import {expect} from 'chai';
import {Subscription} from 'rxjs/Subscription';
import {SinonSpy, spy} from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as sinonChrome from 'sinon-chrome';

describe('download service', () => {
  chai.use(sinonChai);

  const fixture = DownloadService;

  before(() => {
    (global as any).chrome = sinonChrome;
  });

  afterEach(() => {
    sinonChrome.flush();
    sinonChrome.reset();
  });

  after(() => {
    delete (global as any).chrome;
  });

  describe('downloading a track', () => {

    it('should initiate the download using the provided url', () => {
      const trackUrl = 'example.mp3';
      fixture.downloadTrack(trackUrl);
      expect(sinonChrome.downloads.download).calledWith({saveAs: false, url: trackUrl});
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

        subscription = fixture.downloadTrack('example.mp3').subscribe(callback);
        expect(callback).to.not.have.been.called;
        await tick();

        expect(callback).to.have.been.calledOnce.calledWithExactly(downloadId);
        expect(subscription.closed).to.be.true;
      });

      it('should emit an error with the lastError message if the download didn\'t start successfully', async () => {
        const errorMsg = 'error message';
        sinonChrome.downloads.download.callsArgWithAsync(1, undefined);
        sinonChrome.runtime.lastError = {message: errorMsg};

        subscription = fixture.downloadTrack('example.mp3').subscribe(noop, callback);
        expect(callback).to.not.have.been.called;
        await tick();

        expect(callback).to.have.been.calledOnce.calledWithExactly(errorMsg);
        expect(subscription.closed).to.be.true;
      });
    });

  });

});
