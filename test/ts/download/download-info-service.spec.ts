import {CLIENT_ID, SC_API_URL} from '@src/constants';
import {IPlaylistInfo, ITrackInfo} from '@src/download/download-info';
import {DownloadInfoService} from '@src/download/download-info-service';
import {XhrRequestService} from '@src/util/xhr-request-service';
import {useRxTesting, useSinonChai} from '@test/test-initializers';
import {tick} from '@test/test-utils';
import {Subject} from 'rxjs';
import {SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe('download info service', () => {
  const rx = useRxTesting();
  const fixture = DownloadInfoService;

  const url = 'some-url';
  const resolveEndpoint = `${SC_API_URL}/resolve.json?url=${url}&client_id=${CLIENT_ID}`;
  let stubGetJSON$: SinonStub;

  beforeEach(() => {
    stubGetJSON$ = stub(XhrRequestService, 'getJSON$');
    stubGetJSON$.callThrough();
  });

  afterEach(() => {
    stubGetJSON$.restore();
  });

  describe('fetching track info', () => {
    let jsonResponse$: Subject<ITrackInfo>;

    beforeEach(() => {
      jsonResponse$ = new Subject<ITrackInfo>();
      stubGetJSON$.withArgs(resolveEndpoint).returns(jsonResponse$);
      rx.subscribeTo(fixture.getTrackInfo$(url));
    });

    it('should not emit anything when url has yet to be resolved', async () => {
      await tick();
      verifyFetchingDownloadInfo();
    });

    it('should fetch track track info and complete when url has been resolved', async () => {
      const fakeTrackInfo: ITrackInfo = {
        downloadable: false,
        id: 123,
        original_format: 'mp3',
        title: 'some-track',
        user: {username: 'foo'}
      };
      jsonResponse$.next(fakeTrackInfo);
      jsonResponse$.complete();
      await tick();
      verifyDownloadInfoFetched(fakeTrackInfo);
    });

    it('should fail with error and complete if url cannot be resolved', async () => {
      const errorObj = {message: 'error: cannot resolve url'};
      jsonResponse$.error(errorObj);
      await tick();
      verifyErrorEmitted(errorObj);
    });
  });

  describe('fetching playlist info', () => {
    let jsonResponse$: Subject<IPlaylistInfo>;

    beforeEach(() => {
      jsonResponse$ = new Subject<IPlaylistInfo>();
      stubGetJSON$.withArgs(resolveEndpoint).returns(jsonResponse$);
      rx.subscribeTo(fixture.getPlaylistInfo$(url));
    });

    it('should not emit anything when url has yet to be resolved', async () => {
      await tick();
      verifyFetchingDownloadInfo();
    });

    it('should fetch playlist info and complete when url has been resolved', async () => {
      const fakePlaylistInfo: IPlaylistInfo = {title: 'some-playlist', tracks: [], user: {username: 'some-user'}};
      jsonResponse$.next(fakePlaylistInfo);
      jsonResponse$.complete();
      await tick();
      verifyDownloadInfoFetched(fakePlaylistInfo);
    });

    it('should fail with error and complete if url cannot be resolved', async () => {
      const errorObj = {message: 'error: cannot resolve url'};
      jsonResponse$.error(errorObj);
      await tick();
      verifyErrorEmitted(errorObj);
    });
  });

  function verifyFetchingDownloadInfo() {
    expect(rx.next).to.not.have.been.called;
    expect(rx.error).to.not.have.been.called;
    expect(rx.complete).to.not.have.been.called;
  }

  function verifyDownloadInfoFetched<T = ITrackInfo | IPlaylistInfo>(downloadInfo: T) {
    expect(rx.next).to.have.been.calledOnce.calledWithExactly(downloadInfo);
    expect(rx.error).to.not.have.been.called;
    expect(rx.complete).to.have.been.called;
  }

  function verifyErrorEmitted(errorObj: any) {
    expect(rx.next).to.not.have.been.called;
    expect(rx.error).to.have.been.calledWithExactly(errorObj);
  }
});
