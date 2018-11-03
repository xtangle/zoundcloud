import * as $ from 'jquery';
import {Subject} from 'rxjs';
import {restore, SinonStub, stub} from 'sinon';
import {Bootstrapper, TAG_ID} from 'src/ts/content/bootstrapper';
import {ContentPage} from 'src/ts/content/content-page';
import {ContentPageMessenger} from 'src/ts/messaging/page/content-page-messenger';
import {RequestContentPageReloadMessage} from 'src/ts/messaging/page/request-content-page-reload.message';
import {configureChai} from 'test/ts/test-initializers';
import {tick} from 'test/ts/test-utils';

const expect = configureChai();

describe('bootstrapper', () => {
  const fixture = Bootstrapper;
  let contentPage: ContentPage;
  let onUnload$: Subject<any>;

  let stubLoad: SinonStub;
  let stubUnload: SinonStub;
  let stubSendToExtension: SinonStub;

  beforeEach(() => {
    contentPage = new ContentPage();
    onUnload$ = new Subject();
    stubLoad = stub(contentPage, 'load');
    stubUnload = stub(contentPage, 'unload');
    stub(contentPage, 'onUnload$').get(() => onUnload$.asObservable());
    stubSendToExtension = stub(ContentPageMessenger, 'sendToExtension$');
  });

  afterEach(() => {
    onUnload$.complete();
    restore();
  });

  context('when the id tag is in the DOM', () => {
    beforeEach(() => {
      document.body.innerHTML = `<body><div id="${TAG_ID}"></div></body>`;
    });

    it('should send request content page reload message to extension', async () => {
      fixture.bootstrap(contentPage);
      await tick();
      expect(stubSendToExtension).to.have.been.calledOnceWithExactly(new RequestContentPageReloadMessage());
    });

    it('should not load the content page', async () => {
      fixture.bootstrap(contentPage);
      await tick();
      expect(stubLoad).to.not.have.been.called;
    });

    it('should not add another id tag to the DOM', async () => {
      fixture.bootstrap(contentPage);
      await tick();
      verifyOneIdTagInDOM();
    });
  });

  context('when the id tag is not in the DOM', () => {
    beforeEach(() => {
      document.body.innerHTML = '<body></body>';
    });

    it('should add the id tag to the DOM', async () => {
      fixture.bootstrap(contentPage);
      await tick();
      verifyOneIdTagInDOM();
    });

    it('should load the content page since id tag is added to DOM', async () => {
      fixture.bootstrap(contentPage);
      await tick();
      expect(stubLoad).to.have.been.calledOnce;
    });

    it('should not load the content page again when another id tag is added to DOM', async () => {
      fixture.bootstrap(contentPage);
      addIdTagToDOM();
      await tick();
      expect(stubLoad).to.have.been.calledOnce;
    });

    it('should not unload the content page when id tag is not removed from the DOM', async () => {
      fixture.bootstrap(contentPage);
      await tick();
      expect(stubUnload).to.not.have.been.called;
    });

    it('should not unload the content page when the tag is removed and content page was already unloaded', async () => {
      fixture.bootstrap(contentPage);
      onUnload$.next();
      removeIdTagFromDOM();
      await tick();
      expect(stubUnload).to.not.have.been.called;
    });

    it('should unload the content page when id tag is removed from the DOM', async () => {
      fixture.bootstrap(contentPage);
      removeIdTagFromDOM();
      await tick();
      expect(stubUnload).to.have.been.calledOnce;
    });
  });

  function verifyOneIdTagInDOM() {
    expect($(`#${TAG_ID}`).length).to.be.equal(1);
    expect($('div').length).to.be.equal(1);
  }

  function addIdTagToDOM() {
    $('body').append($('<div/>', {id: TAG_ID})[0]);
  }

  function removeIdTagFromDOM() {
    $(`#${TAG_ID}`).remove();
  }
});
