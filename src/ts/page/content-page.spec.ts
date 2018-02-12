import 'jsdom-global/register';
/* tslint:disable-next-line:ordered-imports */
import * as chai from 'chai';
import {expect} from 'chai';
import * as $ from 'jquery';
import 'mocha';
import {spy} from 'sinon';
import * as sinonChai from 'sinon-chai';
import {ContentPage} from './content-page';

/* tslint:disable:no-unused-expression */
describe('content page', () => {
  chai.use(sinonChai);
  let fixture: DummyContentPageImpl;

  describe('bootstrap', () => {
    beforeEach(() => {
      document.body.innerHTML = '<body></body>';
    });

    // Fixme: Test fails because MutationObserver is not supported in jsdom. Try to find a shim.
    xit('should initialize when it should be loaded', () => {
      fixture = new DummyContentPageImpl('id', () => true, spy());
      fixture.bootstrap();

      expect($(`#${fixture.id}`).length).to.be.equal(1);
      expect(fixture.onInitImpl).to.have.been.calledOnce;
    });

    it('should not initialize when it should be loaded but is already loaded', () => {
      fixture = new DummyContentPageImpl('id', () => true, spy());
      document.body.innerHTML = `<body><div id="${fixture.id}"></div></body>`;
      fixture.bootstrap();

      expect($(`#${fixture.id}`).length).to.be.equal(1);
      expect(fixture.onInitImpl).to.not.have.been.called;
    });

    it('should un-initialize when it should not be loaded', () => {
      fixture = new DummyContentPageImpl('id', () => false, null);
      document.body.innerHTML = `<body><div id="${fixture.id}"></div></body>`;
      fixture.bootstrap();

      expect($(`#${fixture.id}`).length).to.equal(0);
    });
  });
});

class DummyContentPageImpl extends ContentPage {
  constructor(public id: string,
              public shouldLoadImpl: () => boolean,
              public onInitImpl: () => void) {
    super(id);
  }

  protected shouldLoad(): boolean {
    return this.shouldLoadImpl();
  }

  protected onInit(): void {
    this.onInitImpl();
  }
}
