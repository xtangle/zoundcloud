import {CLIENT_ID, SC_API_URL} from '@src/constants';
import {IPlaylistInfo, IResourceInfo, ITrackInfo, ResourceType} from '@src/download/resource/resource-info';
import {ResourceInfoService} from '@src/download/resource/resource-info-service';
import {XhrRequestService} from '@src/util/xhr-request-service';
import {useFakeTimer, useRxTesting, useSinonChai} from '@test/test-initializers';
import {Subject} from 'rxjs';
import {SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe('resource info service', () => {
  const cw = useFakeTimer();
  const rx = useRxTesting();

  const fixture = ResourceInfoService;
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

  describe('fetching resource info', () => {
    let jsonResponse$: Subject<IResourceInfo>;

    beforeEach(() => {
      jsonResponse$ = new Subject<IResourceInfo>();
      stubGetJSON$.withArgs(resolveEndpoint).returns(jsonResponse$);
    });

    beforeEach('fetch resource info', () => {
      rx.subscribeTo(fixture.getResourceInfo$(url));
    });

    it('should not emit anything when url has yet to be resolved', () => {
      cw.clock.next();
      verifyFetching();
    });

    it('should fetch resource info and complete when url has been resolved', () => {
      const fakeResourceInfo = {kind: ResourceType.Track} as IResourceInfo;
      jsonResponse$.next(fakeResourceInfo);
      jsonResponse$.complete();
      cw.clock.next();
      verifyFetched(fakeResourceInfo);
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

    });

    beforeEach('fetch track info list', () => {
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
