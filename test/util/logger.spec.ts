import * as chai from 'chai';
import {expect} from 'chai';
import {SinonSpy, spy} from 'sinon';
import * as sinonChai from 'sinon-chai';
import {logger} from '../../src/util/logger';

describe('logger', () => {
  chai.use(sinonChai);
  const prevNodeEnv = process.env.NODE_ENV; // Previous stored value in NODE_ENV

  const spyConsoleLog: SinonSpy = spy(console, 'log');
  const expectedMsgPrefix = 'ZC';

  afterEach(() => {
    spyConsoleLog.resetHistory();
  });

  after(() => {
    process.env.NODE_ENV = prevNodeEnv;
    spyConsoleLog.restore();
  });

  it('should log message if in development mode', () => {
    process.env.NODE_ENV = 'development';
    logger.log('some message', 1, 'arg-two');
    expect(spyConsoleLog.withArgs(`${expectedMsgPrefix}: some message`, 1, 'arg-two')).to.have.been.calledOnce;
  });

  it('should log message if not in development mode', () => {
    process.env.NODE_ENV = 'production';
    logger.log('some message');
    expect(spyConsoleLog).to.not.have.been.called;
  });

});
