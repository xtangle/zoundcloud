import {logger} from '@src/util/logger';
import {configureChai} from '@test/test-initializers';
import {clock, match, restore, SinonStub, stub, useFakeTimers} from 'sinon';

const expect = configureChai();

describe('logger', () => {
  let prevNodeEnv: string; // Previous stored value in NODE_ENV

  let stubDebug: SinonStub;
  let stubLog: SinonStub;
  let stubError: SinonStub;

  beforeEach(() => {
    useFakeTimers(new Date());
    prevNodeEnv = process.env.NODE_ENV;

    stubDebug = stub(console, 'debug');
    stubLog = stub(console, 'log');
    stubError = stub(console, 'error');
  });

  afterEach(() => {
    restore();
    process.env.NODE_ENV = prevNodeEnv;
  });

  it('should print debug message to console in development mode', () => {
    process.env.NODE_ENV = 'development';
    logger.debug('some message', 1, 2);
    expect(stubDebug).to.have.been.calledOnceWithExactly(match('ZC: some message'), 1, 2);
  });

  it('should not print debug message to console in production mode', () => {
    process.env.NODE_ENV = 'production';
    logger.debug('some message', 1, 2);
    expect(stubDebug).to.not.have.been.called;
  });

  it('should print log message to console in development mode', () => {
    process.env.NODE_ENV = 'development';
    logger.log('some message', 1, 2);
    expect(stubLog).to.have.been.calledOnceWithExactly(match('ZC: some message'), 1, 2);
  });

  it('should print log message to console in production mode', () => {
    process.env.NODE_ENV = 'development';
    logger.log('some message', 1, 2);
    expect(stubLog).to.have.been.calledOnceWithExactly(match('ZC: some message'), 1, 2);
  });

  it('should print error message to console', () => {
    logger.error('some error message');
    expect(stubError).to.have.been.calledOnceWithExactly(match('ZC: some error message'));
  });

  it('should print error message along with error to console', () => {
    const err = new Error('some error');
    logger.error('some error message', err);
    expect(stubError).to.have.been.calledOnceWithExactly(match('ZC: some error message'), err);
  });

  it('should prepend messages with a timestamp', () => {
    const expectedTimestamp = `[${clock.Date().toLocaleTimeString()}]`;
    logger.log('some message');
    expect(stubLog).to.have.been.calledOnce.calledWithMatch(expectedTimestamp);
  });
});
