import * as chai from 'chai';
import {expect} from 'chai';
import {SinonStub, stub} from 'sinon';
import * as sinonChai from 'sinon-chai';
import {logger} from '../../src/util/logger';

describe('logger', () => {
  chai.use(sinonChai);
  const prevNodeEnv = process.env.NODE_ENV; // Previous stored value in NODE_ENV

  const stubConsoleLog: SinonStub = stub(console, 'log');
  const expectedMsgPrefix = 'ZC';

  afterEach(() => {
    stubConsoleLog.resetHistory();
  });

  after(() => {
    process.env.NODE_ENV = prevNodeEnv;
    stubConsoleLog.restore();
  });

  it('should log message if in development mode', () => {
    process.env.NODE_ENV = 'development';
    logger.log('some message', 1, 'arg-two');
    expect(stubConsoleLog).to.have.been.calledOnce
      .calledWithExactly(`${expectedMsgPrefix}: some message`, 1, 'arg-two');
  });

  it('should not log message if not in development mode', () => {
    process.env.NODE_ENV = 'production';
    logger.log('some message');
    expect(stubConsoleLog).to.not.have.been.called;
  });

});
