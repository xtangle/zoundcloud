import {ContentPageMessenger} from '@src/messaging/page/content-page-messenger';
import {RequestContentPageReloadMessage} from '@src/messaging/page/request-content-page-reload.message';
import {Bootstrapper, TAG_ID} from '@src/page/bootstrapper';
import {ContentPage} from '@src/page/content-page';
import {configureChai} from '@test/test-initializers';
import {tick} from '@test/test-utils';
import * as $ from 'jquery';
import {restore, SinonStub, stub} from 'sinon';

const expect = configureChai();

describe('bootstrapper', () => {
  const fixture = Bootstrapper;
  let contentPage: ContentPage;

  let stubLoad: SinonStub;
  let stubUnload: SinonStub;
  let stubSendToExtension: SinonStub;

  beforeEach(() => {
    contentPage = new ContentPage();
    stubLoad = stub(contentPage, 'load');
    stubUnload = stub(contentPage, 'unload');
    stubSendToExtension = stub(ContentPageMessenger, 'sendToExtension$');
  });

  afterEach(() => {
    contentPage.subscriptions.unsubscribe();
    restore();
  });

  context('when the id tag is in the DOM', () => {
    beforeEach(() => {
      document.body.innerHTML = `<body><div id="${TAG_ID}"></div></body>`;
    });

    it('should send request content page reload message to extension', () => {
      fixture.bootstrap(contentPage);
      expect(stubSendToExtension).to.have.been.calledOnce.calledWithExactly(new RequestContentPageReloadMessage());
    });

    it('should not load the content page', async () => {
      fixture.bootstrap(contentPage);
      await tick();
      expect(stubLoad).to.not.have.been.called;
    });

    it('should not add another id tag to the DOM', () => {
      fixture.bootstrap(contentPage);
      verifyOneIdTagInDOM();
    });
  });

  context('when the id tag is not in the DOM', () => {
    beforeEach(() => {
      document.body.innerHTML = '<body></body>';
    });

    it('should add the id tag to the DOM', () => {
      fixture.bootstrap(contentPage);
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

    it('should not unload the content page when content page is unsubscribed', async () => {
      fixture.bootstrap(contentPage);
      contentPage.subscriptions.unsubscribe();
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
