/*
import {Bootstrapper} from '@src/page/bootstrapper';
import {IContentPage} from '@src/page/content-page';
import {TrackContentPage} from '@src/page/track-content-page';
import {ContentScript} from '@src/runnable/content-script';
import {useSinonChai} from '@test/test-initializers';
import {match, SinonSpy, spy} from 'sinon';

const expect = useSinonChai();

describe('content script', () => {
  let fixture: ContentScript;
  let spyBootstrap: SinonSpy;

  before(() => {
    spyBootstrap = spy(Bootstrapper, 'bootstrap');
  });

  beforeEach(() => {
    fixture = new ContentScript();
  });

  after(() => {
    spyBootstrap.restore();
  });

  it('should bootstrap the track content page', () => {
    const isTrackContentPage = match((contentPage: IContentPage) => contentPage instanceof TrackContentPage);
    fixture.run();
    expect(spyBootstrap.withArgs(isTrackContentPage)).to.be.calledOnce;
  });
});
*/
