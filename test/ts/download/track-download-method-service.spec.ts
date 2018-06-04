import {CLIENT_ID, I1_CLIENT_ID, SC_I1_API_URL} from '@src/constants';
import {ITrackInfo} from '@src/download/download-info';
import {TrackDownloadMethodService} from '@src/download/track-download-method-service';
import {XhrRequestService} from '@src/util/xhr-request-service';
import {useRxTesting, useSinonChai} from '@test/test-initializers';
import {of, throwError} from 'rxjs';
import {match, SinonMatcher, SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe('track download method service', () => {
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

    it('should use the download url method if track is downloadable and has a working download url', () => {
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(usedDownloadUrlMethod());
      expect(rx.complete).to.have.been.called;
    });

    it('should not use the download url method if track is not downloadable', () => {
      trackInfo.downloadable = false;
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedDownloadUrlMethod());
    });

    it('should not use the download url method if track is downloadable but download url is non-working', () => {
      stubCheckStatus$.withArgs(expectedDownloadUrl()).returns(of(401));
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedDownloadUrlMethod());
    });

    it('should set the file extension to the original format in the response', () => {
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('fileExtension', trackInfo.original_format));
    });

    it('should set the trackInfo in the response', () => {
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

    it('should use the stream url method if ' +
      'download url method cannot be used and track has a working stream url', () => {
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

    it('should not use the stream url method if track has a non-working stream url', () => {
      stubCheckStatus$.withArgs(expectedStreamUrl()).returns(of(401));
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedStreamUrlMethod());
    });

    it('should set the file extension to mp3 in the response', () => {
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('fileExtension', 'mp3'));
    });

    it('should set the trackInfo in the response', () => {
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

  describe('using the sc i1 api method', () => {
    let trackInfo: ITrackInfo;
    const expectedDlUrl = 'expected-sc-i1-api-dl-url';

    beforeEach(() => {
      trackInfo = {
        downloadable: false,
        id: 123
      } as ITrackInfo;

      stubGetJSON$.withArgs(expectedScI1ApiEndpoint()).returns(of({http_mp3_128_url: expectedDlUrl}));
    });

    it('should use the sc i1 api method if download url method and stream url method cannot be used', () => {
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(usedScI1ApiMethod());
      expect(rx.complete).to.have.been.called;
    });

    it('should not use the sc i1 api method if download url method can be used', () => {
      trackInfo.downloadable = true;
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedScI1ApiMethod());
    });

    it('should not use the sc i1 api method if stream url method can be used', () => {
      trackInfo.stream_url = 'some-stream-url';
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedScI1ApiMethod());
    });

    it('should set the file extension to mp3 in the response', () => {
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('fileExtension', 'mp3'));
    });

    it('should set the trackInfo in the response', () => {
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('trackInfo', trackInfo));
    });

    it('should return an error if it cannot fetch download info from sc i1 api endpoint', () => {
      stubGetJSON$.withArgs(expectedScI1ApiEndpoint()).returns(throwError('some error'));
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.not.have.been.called;
      expect(rx.error).to.have.been.calledWithExactly('some error');
    });

    it('should return an error if there is no download url property in the i1 api response', () => {
      stubGetJSON$.withArgs(expectedScI1ApiEndpoint()).returns(of({http_mp3_128_url: undefined}));
      rx.subscribeTo(fixture.toDownloadMethod$(trackInfo));
      expect(rx.next).to.not.have.been.called;
      expect(rx.error).to.have.been.called;
    });

    function expectedScI1ApiEndpoint(): string {
      return `${SC_I1_API_URL}/tracks/${trackInfo.id}/streams?client_id=${I1_CLIENT_ID}`;
    }

    function usedScI1ApiMethod(): SinonMatcher {
      return match.hasOwn('url', expectedDlUrl);
    }
  });
});
