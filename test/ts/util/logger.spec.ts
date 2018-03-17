import {logger} from '@src/util/logger';
import {useSinonChai} from '@test/test-initializers';
import {SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe('logger', () => {
  const prevNodeEnv = process.env.NODE_ENV; // Previous stored value in NODE_ENV
  let stubConsoleLog: SinonStub;

  before(() => {
    stubConsoleLog = stub(console, 'log');
  });

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
      .calledWithExactly(`ZC: some message`, 1, 'arg-two');
  });

  it('should not log message if not in development mode', () => {
    process.env.NODE_ENV = 'production';
    logger.log('some message');
    expect(stubConsoleLog).to.not.have.been.called;
  });

});
