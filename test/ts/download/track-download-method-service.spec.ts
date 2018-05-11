import {CLIENT_ID, I1_CLIENT_ID, SC_I1_API_URL} from '@src/constants';
import {ITrackInfo} from '@src/download/download-info';
import {IScI1ApiTrackDownloadInfo, TrackDownloadMethodService} from '@src/download/track-download-method-service';
import {XhrRequestService} from '@src/util/xhr-request-service';
import {useSinonChai} from '@test/test-initializers';
import {tick} from '@test/test-utils';
import {Subject} from 'rxjs/Subject';
import {Subscription} from 'rxjs/Subscription';
import {match, SinonSpy, SinonStub, spy, stub} from 'sinon';

const expect = useSinonChai();

describe('track download method service', () => {
  const fixture = TrackDownloadMethodService;

  context('determining the download method', () => {
    const callback: SinonSpy = spy();
    let subscription: Subscription;

    afterEach(() => {
      callback.resetHistory();
      subscription.unsubscribe();
    });

    describe('using the download url method if possible', () => {
      const trackInfo = createTrackInfo();

      beforeEach(() => {
        subscription = fixture.getDownloadMethod(trackInfo).subscribe(callback);
      });

      it('should set the url to the download url', () => {
        const expectedUrl = `${trackInfo.download_url}?client_id=${CLIENT_ID}`;
        expect(callback).calledOnce.calledWithMatch(match.has('url', expectedUrl));
      });

      it('should set the file extension to the original format', () => {
        expect(callback).calledOnce.calledWithMatch(match.has('fileExtension', trackInfo.original_format));
      });

      it('should complete the observable', () => {
        expect(subscription.closed).to.be.true;
      });
    });

    describe('using the stream url method if the download url method cannot be used', () => {
      const trackInfo = createTrackInfo(false);

      beforeEach(() => {
        subscription = fixture.getDownloadMethod(trackInfo).subscribe(callback);
      });

      it('should set the url to the stream url', () => {
        const expectedUrl = `${trackInfo.stream_url}?client_id=${CLIENT_ID}`;
        expect(callback).calledOnce.calledWithMatch(match.has('url', expectedUrl));
      });

      it('should set the file extension to mp3', () => {
        expect(callback).calledOnce.calledWithMatch(match.has('fileExtension', 'mp3'));
      });

      it('should complete the observable', () => {
        expect(subscription.closed).to.be.true;
      });
    });

    describe('using the i1 api stream url if both download url and stream url methods cannot be used', () => {
      const trackInfo = createTrackInfo(false, false);
      const failCallback: SinonSpy = spy();
      let jsonResponse$: Subject<IScI1ApiTrackDownloadInfo>;
      let stubGetJSON: SinonStub;

      beforeEach(() => {
        jsonResponse$ = new Subject<IScI1ApiTrackDownloadInfo>();
        stubGetJSON = stub(XhrRequestService, 'getJSON$');
        stubGetJSON.returns(jsonResponse$);
        subscription = fixture.getDownloadMethod(trackInfo).subscribe(callback, failCallback);
      });

      afterEach(() => {
        stubGetJSON.restore();
        failCallback.resetHistory();
      });

      it('should fetch a response from the i1 api url', () => {
        const expectedEndpoint = `${SC_I1_API_URL}/tracks/${trackInfo.id}/streams?client_id=${I1_CLIENT_ID}`;
        expect(stubGetJSON).to.have.been.calledOnce.calledWithExactly(expectedEndpoint);
      });

      context('when a response with the http_mp3_128_url property is returned', () => {
        const responseUrl = 'some-url-returned-by-i1-api';

        beforeEach(async () => {
          jsonResponse$.next({http_mp3_128_url: responseUrl});
          jsonResponse$.complete();
          await tick();
        });

        it('should set the url to the value of the http_mp3_128_url property', () => {
          expect(callback).calledOnce.calledWithMatch(match.has('url', responseUrl));
        });

        it('should set the file extension to mp3', () => {
          expect(callback).calledOnce.calledWithMatch(match.has('fileExtension', 'mp3'));
        });

        it('should complete the observable', () => {
          expect(subscription.closed).to.be.true;
        });
      });

      it('should emit an error when a response without the http_mp3_128_url property is returned', async () => {
        jsonResponse$.next({});
        jsonResponse$.complete();
        await tick();
        expect(callback).to.not.have.been.called;
        expect(failCallback).to.have.been.calledOnce;
      });

      it('should not emit anything when no response is returned', () => {
        expect(callback).to.not.have.been.called;
        expect(failCallback).to.not.have.been.called;
        expect(subscription.closed).to.be.false;
      });
    });

    function createTrackInfo(downloadable: boolean = true,
                             hasStreamUrl: boolean = true): ITrackInfo {
      return {
        download_url: 'https://api.soundcloud.com/tracks/208094428/download',
        downloadable,
        id: 123,
        original_format: 'wav',
        stream_url: hasStreamUrl ? 'https://api.soundcloud.com/tracks/208094428/stream' : undefined,
        title: 'song-title',
        user: {username: 'foo'}
      };
    }
  });
});
