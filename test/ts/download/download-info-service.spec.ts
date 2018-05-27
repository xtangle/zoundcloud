import {CLIENT_ID, SC_API_URL} from '@src/constants';
import {IDownloadInfo, IPlaylistInfo, ITrackInfo} from '@src/download/download-info';
import {DownloadInfoService} from '@src/download/download-info-service';
import {XhrRequestService} from '@src/util/xhr-request-service';
import {useFakeTimer, useRxTesting, useSinonChai} from '@test/test-initializers';
import {Subject} from 'rxjs';
import {SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe('download info service', () => {
  const cw = useFakeTimer();
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

  describe('fetching download info', () => {
    let jsonResponse$: Subject<IDownloadInfo>;

    beforeEach(() => {
      jsonResponse$ = new Subject<IDownloadInfo>();
      stubGetJSON$.withArgs(resolveEndpoint).returns(jsonResponse$);
      rx.subscribeTo(fixture.getDownloadInfo$(url));
    });

    it('should not emit anything when url has yet to be resolved', () => {
      cw.clock.next();
      verifyFetching();
    });

    it('should fetch download info and complete when url has been resolved', () => {
      const fakeDownloadInfo: IDownloadInfo = {kind: 'foo', permalink_url: 'bar'};
      jsonResponse$.next(fakeDownloadInfo);
      jsonResponse$.complete();
      cw.clock.next();
      verifyFetched(fakeDownloadInfo);
    });

    it('should fail with error if url cannot be resolved', () => {
      const errorObj = {message: 'error: cannot resolve url'};
      jsonResponse$.error(errorObj);
      cw.clock.next();
      verifyError(errorObj);
    });
  });

  describe('fetching track info list', () => {
    let jsonResponse$: Subject<ITrackInfo[]>;

    beforeEach(() => {
      jsonResponse$ = new Subject<ITrackInfo[]>();
      stubGetJSON$.withArgs(resolveEndpoint).returns(jsonResponse$);
      rx.subscribeTo(fixture.getTrackInfoList$(url));
    });

    it('should not emit anything when url has yet to be resolved', () => {
      cw.clock.next();
      verifyFetching();
    });

    it('should fetch track info list and complete when url has been resolved', () => {
      const fakeTrackInfoList: ITrackInfo[] = [{}, {}] as ITrackInfo[];
      jsonResponse$.next(fakeTrackInfoList);
      jsonResponse$.complete();
      cw.clock.next();
      verifyFetched(fakeTrackInfoList);
    });

    it('should fail with error if url cannot be resolved', () => {
      const errorObj = {message: 'error: cannot resolve url'};
      jsonResponse$.error(errorObj);
      cw.clock.next();
      verifyError(errorObj);
    });
  });

  function verifyFetching() {
    expect(rx.next).to.not.have.been.called;
    expect(rx.error).to.not.have.been.called;
    expect(rx.complete).to.not.have.been.called;
  }

  function verifyFetched<T = ITrackInfo | IPlaylistInfo>(downloadInfo: T) {
    expect(rx.next).to.have.been.calledOnce.calledWithExactly(downloadInfo);
    expect(rx.error).to.not.have.been.called;
    expect(rx.complete).to.have.been.called;
  }

  function verifyError(errorObj: any) {
    expect(rx.next).to.not.have.been.called;
    expect(rx.error).to.have.been.calledWithExactly(errorObj);
  }
});
