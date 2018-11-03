import {restore, SinonStub, stub} from 'sinon';
import {Bootstrapper} from 'src/ts/content/bootstrapper';
import {ContentPage} from 'src/ts/content/content-page';
import {ContentScript} from 'src/ts/content/content-script';
import {configureChai} from 'test/ts/test-initializers';

const expect = configureChai();

describe('content script', () => {
  let fixture: ContentScript;
  let stubBootstrap: SinonStub;

  beforeEach(() => {
    fixture = new ContentScript();
    stubBootstrap = stub(Bootstrapper, 'bootstrap');
  });

  afterEach(() => {
    restore();
  });

  it('should bootstrap a new content page when run', () => {
    fixture.run();
    expect(stubBootstrap.withArgs(new ContentPage())).to.have.been.calledOnce;
  });
});
