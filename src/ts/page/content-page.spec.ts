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

  describe('initialization', () => {
    beforeEach(() => {
      document.body.innerHTML = '<body></body>';
    });

    it('should load when it should be loaded', () => {
      fixture = new DummyContentPageImpl('id', () => true, spy());
      fixture.init();

      expect($(`#${fixture.id}`).length).to.be.equal(1);
      expect(fixture.onLoad).to.have.been.calledOnce;
    });

    it('should not do anything when it should be loaded but is already loaded', () => {
      fixture = new DummyContentPageImpl('id', () => true, spy());
      document.body.innerHTML = `<body><div id="${fixture.id}"></div></body>`;
      fixture.init();

      expect($(`#${fixture.id}`).length).to.be.equal(1);
      expect(fixture.onLoad).to.not.have.been.called;
    });

    it('should unload when it should not be loaded', () => {
      fixture = new DummyContentPageImpl('id', () => false, null);
      document.body.innerHTML = `<body><div id="${fixture.id}"></div></body>`;
      fixture.init();

      expect($(`#${fixture.id}`).length).to.equal(0);
    });
  });
});

class DummyContentPageImpl extends ContentPage {
  constructor(public id: string,
              public loadPredicate: () => boolean,
              public onLoad: () => void) {
    super(id, loadPredicate, onLoad);
  }
}
