import {XhrService} from '@src/util/xhr-service';
import {matchesError} from '@test/sinon-matchers';
import {configureChai, useRxTesting} from '@test/test-initializers';
import {restore, server, SinonFakeXMLHttpRequest, useFakeServer} from 'sinon';

const expect = configureChai();

describe('xhr service', () => {
  const rx = useRxTesting();

  const fixture = XhrService;
  const url = '/some/url';

  beforeEach(() => {
    useFakeServer();
  });

  afterEach(() => {
    restore();
  });

  describe('pinging a url', () => {

    beforeEach(() => {
      rx.subscribeTo(fixture.ping$(url));
    });

    it('should make a head request', () => {
      verifyHeadRequestMade();
    });

    it('should not emit status code when header has not been received', () => {
      expect(rx.next).to.not.have.been.called;
    });

    it('should emit status code when header is received', () => {
      setHeaderReceivedAndReponseStatusToBe(403);
      verifyStatusCodeEmitted(403);
    });

    it('should abort the xhr request when header is received', () => {
      setHeaderReceivedAndReponseStatusToBe(200);
      verifyRequestAborted();
    });

    it('should emit status code 0 when there is a connection error', () => {
      firstRequest().error();
      verifyStatusCodeEmitted(0);
    });

    function setHeaderReceivedAndReponseStatusToBe(statusCode: number) {
      const request = firstRequest();
      request.status = statusCode;
      request.setResponseHeaders({});
    }

    function verifyHeadRequestMade() {
      expect(server.requests.length).to.be.equal(1);
      const request = firstRequest();
      expect(request.method).to.be.equal('HEAD');
      expect(request.url).to.be.equal(url);
      expect(request.async).to.be.true;
    }

    function verifyStatusCodeEmitted(statusCode: number) {
      expect(rx.next).to.have.been.calledOnceWithExactly(statusCode);
      expect(rx.complete).to.have.been.called;
    }

    function verifyRequestAborted() {
      const ABORTED_KEY = 'aborted';
      const request = firstRequest();
      expect((request as any)[ABORTED_KEY]).to.be.true;
    }
  });

  context('making get requests', () => {

    describe('getting an array buffer', () => {

      beforeEach(() => {
        rx.subscribeTo(fixture.getArrayBuffer$(url));
      });

      it('should make a request', () => {
        verifyGetRequestMadeWithResponseType('arraybuffer');
      });

      it('should fetch a array buffer response', () => {
        const response = createFakeResponse();
        const responseAsStr = new TextDecoder().decode(response);
        firstRequest().respond(200, {}, responseAsStr);
        expect(rx.next).to.have.been.calledOnceWithExactly(response);
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

    describe('getting a json', () => {
      beforeEach(() => {
        rx.subscribeTo(fixture.getJSON$(url));
      });

      it('should make a request', () => {
        verifyGetRequestMadeWithResponseType('json');
      });

      it('should fetch a json response', () => {
        const response = '{"id": 123, "title": "abc"}';
        firstRequest().respond(200, {}, response);
        expect(rx.next).to.have.been.calledOnceWithExactly({id: 123, title: 'abc'});
        expect(rx.complete).to.have.been.called;
      });

      it('should error when response is other than 200', () => {
        verifyErrorWhenStatusIsNot200();
      });

      it('should error when connection can not be established', () => {
        verifyErrorWhenNoConnection();
      });
    });

    function verifyGetRequestMadeWithResponseType(responseType: string) {
      const RESPONSE_TYPE_KEY = 'responseType';
      expect(server.requests.length).to.be.equal(1);
      const request = firstRequest();
      expect(request.method).to.be.equal('GET');
      expect(request.url).to.be.equal(url);
      expect(request.async).to.be.true;
      expect((request as any)[RESPONSE_TYPE_KEY]).to.be.equal(responseType);
    }

    function verifyErrorWhenStatusIsNot200() {
      const expectedErrMsg = `Unable to get from ${url}, response is Forbidden (403)`;
      firstRequest().respond(403, {}, '');
      expect(rx.error).to.have.been.calledWithMatch(matchesError(expectedErrMsg));
    }

    function verifyErrorWhenNoConnection() {
      const expectedErrMsg = `Unable to get from ${url}, network error`;
      firstRequest().error();
      expect(rx.error).to.have.been.calledWithMatch(matchesError(expectedErrMsg));
    }
  });

  function firstRequest(): SinonFakeXMLHttpRequest {
    return server.requests[0];
  }
});
