import {ContentPage} from '@src/page/content-page';
import {InjectionService} from '@src/page/injection/injection-service';
import {configureChai} from '@test/test-initializers';
import {restore, SinonStub, stub} from 'sinon';

const expect = configureChai();

describe('content page', () => {
  let fixture: ContentPage;

  let stubInjectDownloadButtons: SinonStub;

  beforeEach(() => {
    fixture = new ContentPage();

    stubInjectDownloadButtons = stub(InjectionService, 'injectDownloadButtons');
  });

  afterEach(() => {
    fixture.subscriptions.unsubscribe();
    restore();
  });

  it('should keep track of all subscriptions', () => {
    expect(fixture.subscriptions.closed).to.be.false;
  });

  it('should inject the download buttons when loaded', () => {
    fixture.load();
    expect(stubInjectDownloadButtons).to.have.been.calledOnce.calledWithExactly(fixture.subscriptions);
  });

  it('should unsubscribe from all subscriptions when unloaded', () => {
    fixture.unload();
    expect(fixture.subscriptions.closed).to.be.true;
  });
});
