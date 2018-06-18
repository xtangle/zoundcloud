import {logger} from '@src/util/logger';
import {configureChai} from '@test/test-initializers';
import {restore, SinonStub, stub} from 'sinon';

const expect = configureChai();

describe('logger', () => {
  let prevNodeEnv: string; // Previous stored value in NODE_ENV
  let stubDebug: SinonStub;
  let stubError: SinonStub;

  beforeEach(() => {
    prevNodeEnv = process.env.NODE_ENV;
    stubDebug = stub(console, 'debug');
    stubError = stub(console, 'error');
  });

  afterEach(() => {
    restore();
    process.env.NODE_ENV = prevNodeEnv;
  });

  it('should print debug message to console in development mode', () => {
    process.env.NODE_ENV = 'development';
    logger.debug('some message', 1, 'arg-two');
    expect(stubDebug).to.have.been.calledOnce.calledWithExactly(`ZC: some message`, 1, 'arg-two');
  });

  it('should not print debug message to console in production mode', () => {
    process.env.NODE_ENV = 'production';
    logger.debug('some message');
    expect(stubDebug).to.not.have.been.called;
  });

  it('should print just error message to console', () => {
    logger.error('Some error message');
    expect(stubError).to.have.been.calledOnce.calledWithExactly('ZC: Some error message');
  });

  it('should print error message along with error to console', () => {
    const err = new Error('Some error');
    logger.error('Some error message', err);
    expect(stubError).to.have.been.calledOnce.calledWithExactly('ZC: Some error message', err);
  });
});
