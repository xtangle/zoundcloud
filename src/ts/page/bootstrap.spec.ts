import * as chai from 'chai';
import {expect} from 'chai';
import * as $ from 'jquery';
import 'mocha';
import {Subscription} from 'rxjs/Subscription';
import {SinonSpy, spy} from 'sinon';
import * as sinonChai from 'sinon-chai';
import {bootstrap} from './bootstrap';
import {IContentPage} from './content-page';

/* tslint:disable:no-unused-expression */
describe('bootstrap function', () => {
  chai.use(sinonChai);
  let contentPage: DummyContentPage;
  let spyUnsubscribe: SinonSpy;
  let spyOnLoad: SinonSpy;

  beforeEach(() => {
    document.body.innerHTML = '<body></body>';
  });

  it('should load the content page when it should be loaded', () => {
    initContentPage(true);
    bootstrap(contentPage);
    verifyIdTagInsertedToDOM();
    expect(spyOnLoad).to.have.been.calledOnce;
  });

  it('should not load the content page when it should be loaded but is already loaded', () => {
    initContentPage(true);
    document.body.innerHTML = `<body><div id="${contentPage.id}"></div></body>`;
    bootstrap(contentPage);
    expect(spyOnLoad).to.not.have.been.calledOnce;
  });

  it('should unload the content page when it should be unloaded', () => {
    initContentPage(false);
    document.body.innerHTML = `<body><div id="${contentPage.id}"></div></body>`;
    bootstrap(contentPage);
    verifyIdTagRemovedFromDOM();
    expect(spyUnsubscribe).to.have.been.calledOnce;
  });

  it('should not unload the content page when it should be unloaded but is already unloaded', () => {
    initContentPage(false);
    bootstrap(contentPage);
    expect(spyUnsubscribe).to.not.have.been.called;
  });

  it('should un-subscribe all subscriptions when id tag is removed from the page after bootstrapping', (done) => {
    initContentPage(true);
    bootstrap(contentPage);
    expect(spyUnsubscribe).to.not.have.been.called;
    removeIdTagFromDOM();
    setTimeout(() => {
      expect(spyUnsubscribe).to.have.been.calledOnce;
      done();
    }, this.timeout);
  });

  function initContentPage(shouldLoad: boolean): DummyContentPage {
    contentPage = new DummyContentPage(shouldLoad);
    spyUnsubscribe = spy(contentPage.subscriptions, 'unsubscribe');
    spyOnLoad = spy(contentPage, 'onLoad');
    return contentPage;
  }

  function verifyIdTagInsertedToDOM() {
    expect($(`#${contentPage.id}`).length).to.be.equal(1);
  }

  function verifyIdTagRemovedFromDOM() {
    expect($(`#${contentPage.id}`).length).to.be.equal(0);
  }

  function removeIdTagFromDOM() {
    $(`#${contentPage.id}`).remove();
  }
});

class DummyContentPage implements IContentPage {
  public id: string = 'id';
  public subscriptions: Subscription = new Subscription();

  constructor(public shouldLoadValue: boolean) {
  }

  public shouldLoad(): boolean {
    return this.shouldLoadValue;
  }

  public onLoad(): void {
    return undefined;
  }
}
