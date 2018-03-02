import {elementAdded$, elementExist$, elementRemoved$} from '@src/util/dom-observer';
import {tick} from '@test/test-utils';
import * as chai from 'chai';
import {expect} from 'chai';
import * as $ from 'jquery';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {SinonSpy, spy} from 'sinon';
import * as sinonChai from 'sinon-chai';

describe('dom observer', () => {
  chai.use(sinonChai);
  const callback: SinonSpy = spy();
  let subscription: Subscription;

  beforeEach(() => {
    document.body.innerHTML = `
      <ul id="parent">
        <li id="removeMe">One<span id="dontCareAboutMe">Uno</span></li>
        <li id="appendToMe">Two</li>
        <li class="iExist">Three</li>
      </ul>
    `;
  });

  afterEach(() => {
    callback.resetHistory();
    subscription.unsubscribe();
  });

  describe('element removed observable', () => {
    let removeMe: HTMLElement;
    let fixture: Observable<any>;

    beforeEach(() => {
      removeMe = $('#removeMe')[0];
      fixture = elementRemoved$(removeMe);
    });

    it('should emit when element is removed directly', async () => {
      subscription = fixture.subscribe(callback);
      removeMe.remove();
      await tick();
      expect(callback).to.have.been.calledOnce;
    });

    it('should emit when element is removed indirectly through parent', async () => {
      const parent: HTMLElement = $('#parent')[0];
      subscription = fixture.subscribe(callback);
      parent.remove();
      await tick();
      expect(callback).to.have.been.calledOnce;
    });

    it('should not emit when element is not removed', async () => {
      const dontCareAboutMe: HTMLElement = $('#dontCareAboutMe')[0];
      subscription = fixture.subscribe(callback);
      dontCareAboutMe.remove();
      await tick();
      expect(callback).to.not.have.been.called;
    });
  });

  describe('element added observable', () => {
    let addMe: HTMLElement;
    let fixture: Observable<Node>;

    beforeEach(() => {
      addMe = $('<span/>').text('Dos')[0];
    });

    it('should emit node when node is added and passes test', async () => {
      fixture = elementAdded$((node: Node) => node.textContent === 'Dos');
      subscription = fixture.subscribe(callback);
      $('#appendToMe').append(addMe);
      await tick();
      expect(callback).to.have.been.calledOnce.calledWithExactly(addMe);
    });

    it('should not emit any value when node is added but does not pass test', async () => {
      fixture = elementAdded$((node: Node) => node.textContent === 'Dosu');
      subscription = fixture.subscribe(callback);
      $('#appendToMe').append(addMe);
      await tick();
      expect(callback).to.not.have.been.called;
    });

    it('should not emit any value when no nodes are added', async () => {
      fixture = elementAdded$(() => true);
      subscription = fixture.subscribe(callback);
      await tick();
      expect(callback).to.not.have.been.called;
    });

    it('should emit nodes that passes test when when multiple nodes are added', async () => {
      const addMe2 = $('<span/>').text('Dosu')[0];
      const addMe3 = $('<div/>')[0];
      fixture = elementAdded$((node: Node) => node.textContent === 'Dos' || node.nodeName === 'DIV');
      subscription = fixture.subscribe(callback);
      $('#appendToMe').append(addMe, addMe2, addMe3);
      await tick();

      expect(callback).to.have.been.calledTwice;
      expect(callback.firstCall).calledWithExactly(addMe);
      expect(callback.secondCall).calledWithExactly(addMe3);
    });
  });

  describe('element exists observable', () => {
    let iExist: HTMLElement;

    beforeEach(() => {
      iExist = $('.iExist')[0];
    });

    it('should emit node and complete when node exists and matches selector', async () => {
      subscription = elementExist$('.iExist').subscribe(callback);
      await tick();
      expect(callback).to.have.been.calledOnce;
      expect(callback.firstCall).calledWithExactly(iExist);
      expect(subscription.closed).to.be.true;
    });

    it('should not emit any value and complete when no node matches selector', async () => {
      subscription = elementExist$('.iDoNotExist').subscribe(callback);
      await tick();
      expect(callback).to.not.have.been.called;
      expect(subscription.closed).to.be.true;
    });

    it('should emit first node and complete when multiple nodes matches selector', async () => {
      const iExist2 = $('<li/>').addClass(['iExist', 'and', 'iAmFirst'])[0];
      $('#parent').prepend(iExist2);
      subscription = elementExist$('.iExist').subscribe(callback);
      await tick();
      expect(callback).to.have.been.calledOnce;
      expect(callback.firstCall).calledWithExactly(iExist2);
      expect(subscription.closed).to.be.true;
    });
  });
});
