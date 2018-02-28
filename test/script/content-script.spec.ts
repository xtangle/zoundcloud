import * as chai from 'chai';
import {expect} from 'chai';
import {match, SinonSpy, spy} from 'sinon';
import * as sinonChai from 'sinon-chai';
import {IContentPage} from '../../src/page/content-page';
import {TrackContentPage} from '../../src/page/track-content-page';
import {ContentScript} from '../../src/script/content-script';
import {BootstrapService} from '../../src/service/bootstrap-service';

describe('content script', () => {
  chai.use(sinonChai);

  let fixture: ContentScript;
  let spyBootstrap: SinonSpy;

  before(() => {
    spyBootstrap = spy(BootstrapService, 'bootstrap');
  });

  after(() => {
    spyBootstrap.restore();
  });

  beforeEach(() => {
    fixture = new ContentScript();
  });

  it('should bootstrap the track content page', () => {
    const isTrackContentPage = match((contentPage: IContentPage) => contentPage instanceof TrackContentPage);
    fixture.run();
    expect(spyBootstrap.withArgs(isTrackContentPage)).to.be.calledOnce;
  });
});
