import {logger} from '@src/util/logger';
import {useSinonChai} from '@test/test-initializers';
import {SinonStub, stub} from 'sinon';

const expect = useSinonChai();

describe('logger', () => {
  const prevNodeEnv = process.env.NODE_ENV; // Previous stored value in NODE_ENV
  let stubDebug: SinonStub;
  let stubError: SinonStub;

  before(() => {
    stubDebug = stub(console, 'debug');
    stubError = stub(console, 'error');
  });

  afterEach(() => {
    stubDebug.resetHistory();
    stubError.resetHistory();
  });

  after(() => {
    process.env.NODE_ENV = prevNodeEnv;
    stubDebug.restore();
    stubError.restore();
  });

  it('should print debug message to console if in development mode', () => {
    process.env.NODE_ENV = 'development';
    logger.debug('some message', 1, 'arg-two');
    expect(stubDebug).to.have.been.calledOnce
      .calledWithExactly(`ZC: some message`, 1, 'arg-two');
  });

  it('should not print debug message to console if not in development mode', () => {
    process.env.NODE_ENV = 'production';
    logger.debug('some message');
    expect(stubDebug).to.not.have.been.called;
  });

  it('should print error message to console', () => {
    const ev = new ErrorEvent('some error type');
    logger.error('some error message', ev);
    expect(stubError).to.have.been.calledOnce
      .calledWithExactly(`ZC: some error message`, ev);
  });
});
