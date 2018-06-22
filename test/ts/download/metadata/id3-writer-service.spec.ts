import {ID3WriterService} from '@src/download/metadata/id3-writer-service';
import {configureChai} from '@test/test-initializers';
import {createStubInstance, restore} from 'sinon';

const expect = configureChai();
const ID3Writer = require('browser-id3-writer');

describe('id3 writer service', () => {
  const fixture = ID3WriterService;
  let stubWriter: typeof ID3Writer;

  beforeEach(() => {
    stubWriter = createStubInstance(ID3Writer);
  });

  afterEach(() => {
    restore();
  });

  it('should create an id3 writer', () => {
    const fakeData: ArrayBuffer = new Int8Array([1, 2, 3]).buffer;
    const actual = fixture.createWriter(fakeData);
    const expected = new ID3Writer(fakeData);
    expect(actual).to.be.deep.equal(expected);
  });

  it('should add a tag', () => {
    const actual = fixture.addTag(stubWriter);
    expect(stubWriter.addTag).to.have.been.calledOnce;
    expect(actual).to.be.equal(stubWriter);
  });

  it('should set a frame if value is not nil', () => {
    const actual = fixture.setFrame(stubWriter, 'TIT2', 'foo');
    expect(stubWriter.setFrame).to.have.been.calledOnceWithExactly('TIT2', 'foo');
    expect(actual).to.be.equal(stubWriter);
  });

  it('should not set a frame if value is nil', () => {
    const actual = fixture.setFrame(stubWriter, 'TIT2', undefined);
    expect(stubWriter.setFrame).to.not.have.been.called;
    expect(actual).to.be.equal(stubWriter);
  });

  it('should get the URL', () => {
    stubWriter.getURL.returns('foo');
    const actual = fixture.getURL(stubWriter);
    expect(actual).to.be.equal('foo');
  });
});
