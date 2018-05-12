import {XhrRequestService} from '@src/util/xhr-request-service';
import {useSinonChai} from '@test/test-initializers';
import {Subscription} from 'rxjs/index';
import {fakeServer, SinonFakeServer, SinonFakeXMLHttpRequest, SinonSpy, spy} from 'sinon';

const expect = useSinonChai();

describe('xhr request service', () => {
  const fixture = XhrRequestService;
  const successCallback: SinonSpy = spy();
  const failCallback: SinonSpy = spy();
  let subscription: Subscription;
  const url = '/some/url';

  let server: SinonFakeServer;

  beforeEach(() => {
    server = fakeServer.create();
  });

  afterEach(() => {
    successCallback.resetHistory();
    failCallback.resetHistory();
    subscription.unsubscribe();

    server.restore();
  });

  describe('get array buffer', () => {
    beforeEach(() => {
      subscription = fixture.getArrayBuffer$(url).subscribe(successCallback, failCallback);
    });

    it('should make a request', () => {
      verifyRequestMadeWithResponseType('arraybuffer');
    });

    it('should fetch a array buffer response', () => {
      const response = createFakeResponse();
      const responseAsStr = new TextDecoder().decode(response);
      getRequest().respond(200, {}, responseAsStr);
      expect(successCallback).to.be.calledOnce.calledWithExactly(response);
      expect(subscription.closed).to.be.true;
    });

    it('should error when response is other than 200', () => {
      verifyErrorWhenStatusIsNot200();
    });

    it('should error when connection can not be established', () => {
      verifyErrorWhenNoConnection();
    });

    function createFakeResponse(): ArrayBuffer {
      const response = new ArrayBuffer(8);
      const dataview = new DataView(response);
      // Set some arbitrary values
      dataview.setInt8(1, 23);
      dataview.setInt8(4, 44);
      return response;
    }
  });

  describe('get json', () => {
    beforeEach(() => {
      subscription = fixture.getJSON$(url).subscribe(successCallback, failCallback);
    });

    it('should make a request', () => {
      verifyRequestMadeWithResponseType('json');
    });

    it('should fetch a json response', () => {
      const response = '{"id": 123, "title": "abc"}';
      getRequest().respond(200, {}, response);
      expect(successCallback).to.be.calledOnce.calledWithExactly({id: 123, title: 'abc'});
      expect(subscription.closed).to.be.true;
    });

    it('should error when response is other than 200', () => {
      verifyErrorWhenStatusIsNot200();
    });

    it('should error when connection can not be established', () => {
      verifyErrorWhenNoConnection();
    });
  });

  function getRequest(): SinonFakeXMLHttpRequest {
    return server.requests[0];
  }

  function verifyRequestMadeWithResponseType(responseType: string) {
    const RESPONSE_TYPE_PROP = 'responseType';
    expect(server.requests.length).to.be.equal(1);
    const request = getRequest();
    expect(request.method).to.be.equal('GET');
    expect(request.url).to.be.equal(url);
    expect((request as any)[RESPONSE_TYPE_PROP]).to.be.equal(responseType);
  }

  function verifyErrorWhenStatusIsNot200() {
    const expectedErrMsg = `Unable to get from ${url}, response is Forbidden (403)`;
    getRequest().respond(403, {}, '');
    expect(failCallback).to.have.been.calledWithExactly(expectedErrMsg);
  }

  function verifyErrorWhenNoConnection() {
    const expectedErrMsg = `Unable to get from ${url}, network error`;
    getRequest().error();
    expect(failCallback).to.have.been.calledWithExactly(expectedErrMsg);
  }
});
