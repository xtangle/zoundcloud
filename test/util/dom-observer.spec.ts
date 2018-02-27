import * as chai from 'chai';
import {expect} from 'chai';
import * as $ from 'jquery';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {SinonSpy, spy} from 'sinon';
import * as sinonChai from 'sinon-chai';
import {elementAdded$, elementExist$, elementRemoved$} from '../../src/util/dom-observer';

describe('dom observer', () => {
  chai.use(sinonChai);
  let callback: SinonSpy;
  let subscription: Subscription;

  beforeEach(() => {
    document.body.innerHTML = `
      <ul>
        <li id="removeMe">One<span>Uno</span></li>
        <li id="appendToMe">Two</li>
        <li class="iExist">Three</li>
      </ul>
    `;
    callback = spy();
  });

  afterEach(() => {
    subscription.unsubscribe();
  });

  describe('element removed observable', () => {
    let removeMe: HTMLElement;
    let fixture: Observable<boolean>;

    beforeEach(() => {
      removeMe = $('#removeMe')[0];
      fixture = elementRemoved$(removeMe);
    });

    it('should emit true when element is removed directly', (done) => {
      subscription = fixture.subscribe((val) => {
        expect(val).to.be.true;
        done();
      });
      removeMe.remove();
    });

    it('should emit true when element is removed indirectly through parent', (done) => {
      const ul: HTMLElement = $('ul')[0];
      subscription = fixture.subscribe((val) => {
        expect(val).to.be.true;
        done();
      });
      ul.remove();
    });

    it('should not emit any value when element is not removed', (done) => {
      const span: HTMLElement = $('span')[0];
      subscription = fixture.subscribe((val) => callback(val));
      setTimeout(() => {
        expect(callback).to.not.have.been.called;
        done();
      }, this.timeout);
      span.remove();
    });
  });

  describe('element added observable', () => {
    let addMe: HTMLElement;
    let fixture: Observable<Node>;

    beforeEach(() => {
      addMe = $('<span/>').text('Dos')[0];
    });

    it('should emit node when node is added and passes test', (done) => {
      fixture = elementAdded$((node: Node) => node.textContent === 'Dos');
      subscription = fixture.subscribe((val) => {
        expect(val).to.equal(addMe);
        done();
      });
      $('#appendToMe').append(addMe);
    });

    it('should not emit any value when node is added but does not pass test', (done) => {
      fixture = elementAdded$((node: Node) => node.textContent === 'Dosu');
      subscription = fixture.subscribe((val) => callback(val));
      setTimeout(() => {
        expect(callback).to.not.have.been.called;
        done();
      }, this.timeout);
      $('#appendToMe').append(addMe);
    });

    it('should not emit any value when no nodes are added', (done) => {
      fixture = elementAdded$(() => true);
      subscription = fixture.subscribe((val) => callback(val));
      setTimeout(() => {
        expect(callback).to.not.have.been.called;
        done();
      }, this.timeout);
    });

    it('should emit nodes that passes test when when multiple nodes are added', (done) => {
      const addMe2 = $('<span/>').text('Dosu')[0];
      const addMe3 = $('<div/>')[0];
      fixture = elementAdded$((node: Node) => node.textContent === 'Dos' || node.nodeName === 'DIV');
      subscription = fixture.subscribe((val) => callback(val));
      setTimeout(() => {
        expect(callback).to.have.been.calledTwice;
        expect(callback.firstCall).calledWithExactly(addMe);
        expect(callback.secondCall).calledWithExactly(addMe3);
        done();
      }, this.timeout);
      $('#appendToMe').append(addMe, addMe2, addMe3);
    });
  });

  describe('element exists observable', () => {
    let iExist: HTMLElement;

    beforeEach(() => {
      iExist = $('.iExist')[0];
    });

    it('should emit node and complete when node exists and matches selector', (done) => {
      subscription = elementExist$('.iExist')
        .subscribe((val) => callback(val));
      setTimeout(() => {
        expect(callback).to.have.been.calledOnce;
        expect(callback.firstCall).calledWithExactly(iExist);
        expect(subscription.closed).to.be.true;
        done();
      }, this.timeout);
    });

    it('should not emit any value and complete when no node matches selector', (done) => {
      subscription = elementExist$('.iDoNotExist')
        .subscribe((val) => callback(val));
      setTimeout(() => {
        expect(callback).to.not.have.been.called;
        expect(subscription.closed).to.be.true;
        done();
      }, this.timeout);
    });

    it('should emit first node and complete when multiple nodes matches selector', (done) => {
      const iExist2 = $('<li/>').addClass('iExist')[0];
      $('ul').prepend(iExist2);
      subscription = elementExist$('.iExist')
        .subscribe((val) => callback(val));
      setTimeout(() => {
        expect(callback).to.have.been.calledOnce;
        expect(callback.firstCall).calledWithExactly(iExist2);
        expect(subscription.closed).to.be.true;
        done();
      }, this.timeout);
    });
  });
});
