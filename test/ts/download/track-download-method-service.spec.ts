import {of, throwError} from 'rxjs';
import {match, restore, SinonMatcher, SinonStub, stub} from 'sinon';
import {CLIENT_ID, I1_CLIENT_ID, SC_I1_API_URL} from 'src/ts/constants';
import {ITrackInfo} from 'src/ts/download/resource/resource-info';
import {TrackDownloadMethod} from 'src/ts/download/track-download-method';
import {TrackDownloadMethodService} from 'src/ts/download/track-download-method-service';
import {XhrService} from 'src/ts/util/xhr-service';
import {configureChai, useRxTesting} from 'test/ts/test-initializers';

const expect = configureChai();

describe('track download method service', () => {
  const rx = useRxTesting();

  const fixture = TrackDownloadMethodService;
  let stubPing$: SinonStub;
  let stubGetJSON$: SinonStub;

  beforeEach(() => {
    stubPing$ = stub(XhrService, 'ping$');
    stubPing$.returns(of(200));

    stubGetJSON$ = stub(XhrService, 'getJSON$');
    stubGetJSON$.returns(of({http_mp3_128_url: 'foo'}));
  });

  afterEach(() => {
    restore();
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
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(usedDownloadUrlMethod());
      expect(rx.complete).to.have.been.called;
    });

    it('should not use the download url method if track is not downloadable', () => {
      trackInfo.downloadable = false;
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedDownloadUrlMethod());
    });

    it('should not use the download url method if track is downloadable but download url is non-working', () => {
      stubPing$.withArgs(expectedDownloadUrl()).returns(of(401));
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedDownloadUrlMethod());
    });

    it('should set the format to the original format', () => {
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('format', trackInfo.original_format));
    });

    it('should set the download method', () => {
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.have.been.calledOnce
        .calledWithMatch(match.has('downloadMethod', TrackDownloadMethod.DownloadUrlMethod));
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
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(usedStreamUrlMethod());
      expect(rx.complete).to.have.been.called;
    });

    it('should not use the stream url method if download url method can be used', () => {
      trackInfo.downloadable = true;
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedStreamUrlMethod());
    });

    it('should not use the stream url method if track does not have a stream url', () => {
      trackInfo.stream_url = undefined;
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedStreamUrlMethod());
    });

    it('should not use the stream url method if track has a non-working stream url', () => {
      stubPing$.withArgs(expectedStreamUrl()).returns(of(401));
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedStreamUrlMethod());
    });

    it('should set the format to mp3', () => {
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('format', 'mp3'));
    });

    it('should set the download method', () => {
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.have.been.calledOnce
        .calledWithMatch(match.has('downloadMethod', TrackDownloadMethod.StreamUrlMethod));
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
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(usedScI1ApiMethod());
      expect(rx.complete).to.have.been.called;
    });

    it('should not use the sc i1 api method if download url method can be used', () => {
      trackInfo.downloadable = true;
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedScI1ApiMethod());
    });

    it('should not use the sc i1 api method if stream url method can be used', () => {
      trackInfo.stream_url = 'some-stream-url';
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.not.have.been.calledWithMatch(usedScI1ApiMethod());
    });

    it('should set the format to mp3', () => {
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.have.been.calledOnce.calledWithMatch(match.has('format', 'mp3'));
    });

    it('should set the download method', () => {
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.have.been.calledOnce
        .calledWithMatch(match.has('downloadMethod', TrackDownloadMethod.I1ApiMethod));
    });

    it('should return an error if it cannot fetch download info from sc i1 api endpoint', () => {
      stubGetJSON$.withArgs(expectedScI1ApiEndpoint()).returns(throwError('some error'));
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
      expect(rx.next).to.not.have.been.called;
      expect(rx.error).to.have.been.calledWithExactly('some error');
    });

    it('should return an error if there is no download url property in the i1 api response', () => {
      stubGetJSON$.withArgs(expectedScI1ApiEndpoint()).returns(of({http_mp3_128_url: undefined}));
      rx.subscribeTo(fixture.getDownloadMethodInfo$(trackInfo));
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
