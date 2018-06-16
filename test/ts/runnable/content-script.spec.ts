import {Bootstrapper} from '@src/page/bootstrapper';
import {ContentPage} from '@src/page/content-page';
import {ContentScript} from '@src/runnable/content-script';
import {useSinonChai} from '@test/test-initializers';
import {restore, SinonStub, stub} from 'sinon';

const expect = useSinonChai();

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
