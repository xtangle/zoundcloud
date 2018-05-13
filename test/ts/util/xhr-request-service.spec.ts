import {XhrRequestService} from '@src/util/xhr-request-service';
import {useRxTesting, useSinonChai} from '@test/test-initializers';
import {fakeServer, SinonFakeServer, SinonFakeXMLHttpRequest} from 'sinon';

const expect = useSinonChai();

describe('xhr request service', () => {
  const rx = useRxTesting();
  const fixture = XhrRequestService;
  const url = '/some/url';
  let server: SinonFakeServer;

  beforeEach(() => {
    server = fakeServer.create();
  });

  afterEach(() => {
    server.restore();
  });

  describe('get array buffer', () => {
    beforeEach(() => {
      rx.subscribeTo(fixture.getArrayBuffer$(url));
    });

    it('should make a request', () => {
      verifyRequestMadeWithResponseType('arraybuffer');
    });

    it('should fetch a array buffer response', () => {
      const response = createFakeResponse();
      const responseAsStr = new TextDecoder().decode(response);
      getRequest().respond(200, {}, responseAsStr);
      expect(rx.next).to.have.been.calledOnce.calledWithExactly(response);
      expect(rx.complete).to.have.been.called;
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
      rx.subscribeTo(fixture.getJSON$(url));
    });

    it('should make a request', () => {
      verifyRequestMadeWithResponseType('json');
    });

    it('should fetch a json response', () => {
      const response = '{"id": 123, "title": "abc"}';
      getRequest().respond(200, {}, response);
      expect(rx.next).to.have.been.calledOnce.calledWithExactly({id: 123, title: 'abc'});
      expect(rx.complete).to.have.been.called;
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
    expect(rx.error).to.have.been.calledWithExactly(expectedErrMsg);
  }

  function verifyErrorWhenNoConnection() {
    const expectedErrMsg = `Unable to get from ${url}, network error`;
    getRequest().error();
    expect(rx.error).to.have.been.calledWithExactly(expectedErrMsg);
  }
});
