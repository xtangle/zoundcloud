import * as chai from 'chai';
import {expect} from 'chai';
import * as $ from 'jquery';
import {SinonSpy, spy} from 'sinon';
import * as sinonChai from 'sinon-chai';
import {ContentPage} from './content-page';

/* tslint:disable:no-unused-expression */
describe('content page', () => {
  chai.use(sinonChai);
  let fixture: DummyContentPageImpl;

  beforeEach(() => {
    document.body.innerHTML = '<body></body>';
    fixture = new DummyContentPageImpl(true);
  });

  describe('bootstrap', () => {
    it('should initialize when it should be loaded', () => {
      fixture.bootstrap();
      expect($(`#${fixture.id}`).length).to.be.equal(1);
      expect(fixture.spyOnInit).to.have.been.calledOnce;
    });

    it('should not initialize when it should be loaded but is already initialized', () => {
      document.body.innerHTML = `<body><div id="${fixture.id}"></div></body>`;
      fixture.bootstrap();
      expect($(`#${fixture.id}`).length).to.be.equal(1);
      expect(fixture.spyOnInit).to.not.have.been.calledOnce;
    });

    it('should un-initialize when it should not be loaded', () => {
      fixture = new DummyContentPageImpl(false);
      document.body.innerHTML = `<body><div id="${fixture.id}"></div></body>`;
      fixture.bootstrap();
      expect($(`#${fixture.id}`).length).to.equal(0);
      expect(fixture.spyUnsubscribe).to.have.been.calledOnce;
    });

    it('should not un-initialize when it should not be loaded but is already un-initialized', () => {
      fixture = new DummyContentPageImpl(false);
      fixture.bootstrap();
      expect($(`#${fixture.id}`).length).to.be.equal(0);
      expect(fixture.spyUnsubscribe).to.not.have.been.called;
    });

    it('should un-initialize when id tag is removed from the page after initializing', (done) => {
      fixture.bootstrap();
      expect(fixture.spyUnsubscribe).to.not.have.been.called;
      $(`#${fixture.id}`).remove();
      setTimeout(() => {
        expect(fixture.spyUnsubscribe).to.have.been.calledOnce;
        done();
      }, this.timeout);
    });
  });
});

class DummyContentPageImpl extends ContentPage {
  public spyOnInit: SinonSpy;
  public spyUnsubscribe: SinonSpy;

  constructor(public shouldLoadValue: boolean,
              public id: string = 'id') {
    super(id);
    this.spyUnsubscribe = spy(this.subscriptions, 'unsubscribe');
    this.spyOnInit = spy();
  }

  protected shouldLoad(): boolean {
    return this.shouldLoadValue;
  }

  protected onInit(): void {
    this.spyOnInit();
  }
}
