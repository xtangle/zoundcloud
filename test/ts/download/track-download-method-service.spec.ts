import {CLIENT_ID, I1_CLIENT_ID, SC_I1_API_URL} from '@src/constants';
import {ITrackInfo} from '@src/download/download-info';
import {IScI1ApiTrackDownloadInfo, TrackDownloadMethodService} from '@src/download/track-download-method-service';
import {XhrRequestService} from '@src/util/xhr-request-service';
import {useRxTesting, useSinonChai} from '@test/test-initializers';
import {tick} from '@test/test-utils';
import {Subject} from 'rxjs';
import {match, SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe('track download method service', () => {
  const rx = useRxTesting();
  const fixture = TrackDownloadMethodService;

  context('determining the download method', () => {

    describe('using the download url method if possible', () => {
      const trackInfo = createTrackInfo();

      beforeEach(() => {
        rx.subscribeTo(fixture.getDownloadMethod(trackInfo));
      });

      it('should set the url to the download url', () => {
        const expectedUrl = `${trackInfo.download_url}?client_id=${CLIENT_ID}`;
        expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('url', expectedUrl));
      });

      it('should set the file extension to the original format', () => {
        expect(rx.next).to.have.been.calledOnce
          .calledWithMatch(match.has('fileExtension', trackInfo.original_format));
      });

      it('should complete the observable', () => {
        expect(rx.complete).to.have.been.called;
      });
    });

    describe('using the stream url method if the download url method cannot be used', () => {
      const trackInfo = createTrackInfo(false);

      beforeEach(() => {
        rx.subscribeTo(fixture.getDownloadMethod(trackInfo));
      });

      it('should set the url to the stream url', () => {
        const expectedUrl = `${trackInfo.stream_url}?client_id=${CLIENT_ID}`;
        expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('url', expectedUrl));
      });

      it('should set the file extension to mp3', () => {
        expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('fileExtension', 'mp3'));
      });

      it('should complete the observable', () => {
        expect(rx.complete).to.have.been.called;
      });
    });

    describe('using the i1 api stream url if both download url and stream url methods cannot be used', () => {
      const trackInfo = createTrackInfo(false, false);
      let jsonResponse$: Subject<IScI1ApiTrackDownloadInfo>;
      let stubGetJSON: SinonStub;

      beforeEach(() => {
        jsonResponse$ = new Subject<IScI1ApiTrackDownloadInfo>();
        stubGetJSON = stub(XhrRequestService, 'getJSON$');
        stubGetJSON.returns(jsonResponse$);

        rx.subscribeTo(fixture.getDownloadMethod(trackInfo));
      });

      afterEach(() => {
        stubGetJSON.restore();
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
          expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('url', responseUrl));
        });

        it('should set the file extension to mp3', () => {
          expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('fileExtension', 'mp3'));
        });

        it('should complete the observable', () => {
          expect(rx.complete).to.have.been.called;
        });
      });

      it('should emit an error when a response without the http_mp3_128_url property is returned', async () => {
        jsonResponse$.next({});
        jsonResponse$.complete();
        await tick();
        expect(rx.next).to.not.have.been.called;
        expect(rx.error).to.have.been.calledOnce;
      });

      it('should not emit anything when no response is returned', () => {
        expect(rx.next).to.not.have.been.called;
        expect(rx.error).to.not.have.been.called;
        expect(rx.complete).to.not.have.been.called;
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
