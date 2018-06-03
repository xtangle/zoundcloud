import {CLIENT_ID} from '@src/constants';
import {ITrackInfo} from '@src/download/download-info';
import {TrackDownloadMethodService} from '@src/download/track-download-method-service';
import {XhrRequestService} from '@src/util/xhr-request-service';
import {useRxTesting, useSinonChai} from '@test/test-initializers';
import {of, throwError} from 'rxjs';
import {match, SinonMatcher, SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe.only('track download method service', () => {
  const rx = useRxTesting();
  const fixture = TrackDownloadMethodService;

  let stubCheckStatus$: SinonStub;
  let stubGetJSON$: SinonStub;

  beforeEach(() => {
    stubCheckStatus$ = stub(XhrRequestService, 'checkStatus$');
    stubCheckStatus$.returns(of(200));

    stubGetJSON$ = stub(XhrRequestService, 'getJSON$');
    stubGetJSON$.returns(of({http_mp3_128_url: 'foo'}));
  });

  afterEach(() => {
    stubCheckStatus$.restore();
    stubGetJSON$.restore();
  });

  describe('using the download url method', () => {
    let trackInfo: ITrackInfo;

    beforeEach(() => {
      trackInfo = {
        download_url: 'some-download-url',
        downloadable: true,
        original_format: 'wav'
      } as ITrackInfo;
    });

    it('should use the download url method if track is downloadable and download url is working', () => {
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(usedDownloadUrlMethod());
      expect(rx.complete).to.have.been.called;
    });

    it('should not use the download url method if track is not downloadable', () => {
      trackInfo.downloadable = false;
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedDownloadUrlMethod());
    });

    it('should not use the download url method if track is downloadable but download url is not working', () => {
      stubCheckStatus$.withArgs(expectedDownloadUrl()).returns(of(401));
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedDownloadUrlMethod());
    });

    it('should set the file extension to the original format', () => {
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('fileExtension', trackInfo.original_format));
    });

    it('should set the trackInfo', () => {
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('trackInfo', trackInfo));
    });

    function expectedDownloadUrl(): string {
      return `${trackInfo.download_url}?client_id=${CLIENT_ID}`;
    }

    function usedDownloadUrlMethod(): SinonMatcher {
      return match.hasOwn('url', expectedDownloadUrl());
    }
  });

  describe('using the stream url method', () => {
    let trackInfo: ITrackInfo;

    beforeEach(() => {
      trackInfo = {
        downloadable: false,
        stream_url: 'some-stream-url'
      } as ITrackInfo;
    });

    it('should use the stream url method if track has a stream url and it is working', () => {
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(usedStreamUrlMethod());
      expect(rx.complete).to.have.been.called;
    });

    it('should not use the stream url method if download url method can be used', () => {
      trackInfo.downloadable = true;
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedStreamUrlMethod());
    });

    it('should not use the stream url method if track does not have a stream url', () => {
      trackInfo.stream_url = undefined;
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedStreamUrlMethod());
    });

    it('should not use the stream url method if track has a stream url but it is not working', () => {
      stubCheckStatus$.withArgs(expectedStreamUrl()).returns(of(401));
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedStreamUrlMethod());
    });

    it('should set the file extension to mp3', () => {
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('fileExtension', 'mp3'));
    });

    it('should set the trackInfo', () => {
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('trackInfo', trackInfo));
    });

    function expectedStreamUrl(): string {
      return `${trackInfo.stream_url}?client_id=${CLIENT_ID}`;
    }

    function usedStreamUrlMethod(): SinonMatcher {
      return match.hasOwn('url', expectedStreamUrl());
    }
  });

  /*context('determining the download method', () => {
    describe('using the download url method if possible', () => {
      const trackInfo = createTrackInfo();

      beforeEach(() => {
        rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
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
        rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
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

        rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
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

        beforeEach(() => {
          jsonResponse$.next({http_mp3_128_url: responseUrl});
          jsonResponse$.complete();
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

      it('should emit an error when a response without the http_mp3_128_url property is returned', () => {
        jsonResponse$.next({});
        jsonResponse$.complete();
        expect(rx.next).to.not.have.been.called;
        expect(rx.error).to.have.been.calledOnce;
      });

      it('should not emit anything when no response is returned', () => {
        expect(rx.next).to.not.have.been.called;
        expect(rx.error).to.not.have.been.called;
        expect(rx.complete).to.not.have.been.called;
      });
    });
  });*/

  /*function createTrackInfo(downloadable: boolean = true,
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
  }*/
});
