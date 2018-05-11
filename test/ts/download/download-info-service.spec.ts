import {CLIENT_ID, SC_API_URL} from '@src/constants';
import {IPlaylistInfo, ITrackInfo} from '@src/download/download-info';
import {DownloadInfoService} from '@src/download/download-info-service';
import {XhrRequestService} from '@src/util/xhr-request-service';
import {useSinonChai} from '@test/test-initializers';
import {tick} from '@test/test-utils';
import {Subject, Subscription} from 'rxjs';
import {SinonSpy, SinonStub, spy, stub} from 'sinon';

const expect = useSinonChai();

describe('download info service', () => {
  const url = 'some-url';
  const resolveEndpoint = `${SC_API_URL}/resolve.json?url=${url}&client_id=${CLIENT_ID}`;
  const successCallback: SinonSpy = spy();
  const failCallback: SinonSpy = spy();
  let subscription: Subscription;

  const fixture = DownloadInfoService;

  let stubGetJSON$: SinonStub;

  beforeEach(() => {
    stubGetJSON$ = stub(XhrRequestService, 'getJSON$');
    stubGetJSON$.callThrough();
  });

  afterEach(() => {
    stubGetJSON$.restore();
    successCallback.resetHistory();
    failCallback.resetHistory();
    subscription.unsubscribe();
  });

  describe('fetching track info', () => {
    let jsonResponse$: Subject<ITrackInfo>;

    beforeEach(() => {
      jsonResponse$ = new Subject<ITrackInfo>();
      stubGetJSON$.withArgs(resolveEndpoint).returns(jsonResponse$);
      subscription = fixture.getTrackInfo$(url).subscribe(successCallback, failCallback);
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
      subscription = fixture.getPlaylistInfo$(url).subscribe(successCallback, failCallback);
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
    expect(successCallback).to.not.have.been.called;
    expect(failCallback).to.not.have.been.called;
    expect(subscription.closed).to.be.false;
  }

  function verifyDownloadInfoFetched<T = ITrackInfo | IPlaylistInfo>(downloadInfo: T) {
    expect(successCallback).to.have.been.calledOnce.calledWithExactly(downloadInfo);
    expect(failCallback).to.not.have.been.called;
    expect(subscription.closed).to.be.true;
  }

  function verifyErrorEmitted(errorObj: any) {
    expect(successCallback).to.not.have.been.called;
    expect(failCallback).to.have.been.calledOnce.calledWithExactly(errorObj);
    expect(subscription.closed).to.be.true;
  }
});
