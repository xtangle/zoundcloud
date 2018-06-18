import {elementAdded$, elementExist$, elementExistOrAdded$, elementRemoved$} from '@src/util/dom-observer';
import {configureChai, useRxTesting} from '@test/test-initializers';
import {tick} from '@test/test-utils';
import * as $ from 'jquery';
import {Observable} from 'rxjs';

const expect = configureChai();

describe('dom observer', () => {
  const rx = useRxTesting();

  beforeEach(() => {
    document.body.innerHTML = `
      <ul id="parent">
        <li id="removeMe">One<span id="dontCareAboutMe">Uno</span></li>
        <li id="appendToMe">Two</li>
        <li class="iExist">Three</li>
      </ul>
    `;
  });

  describe('element removed observable', () => {
    let removeMe: HTMLElement;
    let actual$: Observable<any>;

    beforeEach(() => {
      removeMe = $('#removeMe')[0];
      actual$ = elementRemoved$(removeMe);
    });

    it('should emit when element is removed directly', async () => {
      rx.subscribeTo(actual$);
      removeMe.remove();
      await tick();
      expect(rx.next).to.have.been.calledOnce;
    });

    it('should emit when element is removed indirectly through parent', async () => {
      const parent: HTMLElement = $('#parent')[0];
      rx.subscribeTo(actual$);
      parent.remove();
      await tick();
      expect(rx.next).to.have.been.calledOnce;
    });

    it('should not emit when element is not removed', async () => {
      const dontCareAboutMe: HTMLElement = $('#dontCareAboutMe')[0];
      rx.subscribeTo(actual$);
      dontCareAboutMe.remove();
      await tick();
      expect(rx.next).to.not.have.been.called;
    });
  });

  describe('element added observable', () => {
    let addMe: HTMLElement;

    beforeEach(() => {
      addMe = $('<span/>').text('Dos')[0];
    });

    it('should emit node when node is added and passes test', async () => {
      rx.subscribeTo(elementAdded$((node: Node) => node.textContent === 'Dos'));
      $('#appendToMe').append(addMe);
      await tick();
      expect(rx.next).to.have.been.calledOnce.calledWithExactly(addMe);
    });

    it('should not emit any value when node is added but does not pass test', async () => {
      rx.subscribeTo(elementAdded$((node: Node) => node.textContent === 'Dosu'));
      $('#appendToMe').append(addMe);
      await tick();
      expect(rx.next).to.not.have.been.called;
    });

    it('should not emit any value when no nodes are added', async () => {
      rx.subscribeTo(elementAdded$(() => true));
      await tick();
      expect(rx.next).to.not.have.been.called;
    });

    it('should emit nodes that passes test when when multiple nodes are added', async () => {
      const addMe2 = $('<span/>').text('Dosu')[0];
      const addMe3 = $('<div/>')[0];
      rx.subscribeTo(elementAdded$((node: Node) => node.textContent === 'Dos' || node.nodeName === 'DIV'));
      $('#appendToMe').append(addMe, addMe2, addMe3);
      await tick();

      expect(rx.next).to.have.been.calledTwice;
      expect(rx.next.firstCall).calledWithExactly(addMe);
      expect(rx.next.secondCall).calledWithExactly(addMe3);
    });
  });

  describe('element exists observable', () => {
    let iExist: HTMLElement;

    beforeEach(() => {
      iExist = $('.iExist')[0];
    });

    it('should emit node and complete when one node exists and matches selector', async () => {
      rx.subscribeTo(elementExist$('.iExist'));
      await tick();
      expect(rx.next).to.have.been.calledOnce.calledWithExactly(iExist);
      expect(rx.complete).to.be.have.been.called;
    });

    it('should not emit any value and complete when no node matches selector', async () => {
      rx.subscribeTo(elementExist$('.iDoNotExist'));
      await tick();
      expect(rx.next).to.not.have.been.called;
      expect(rx.complete).to.be.have.been.called;
    });

    it('should emit all matching nodes and complete when multiple nodes matches selector', async () => {
      const iExist2 = $('<li/>').addClass(['iExist', 'and', 'iAmFirst'])[0];
      $('#parent').prepend(iExist2);
      rx.subscribeTo(elementExist$('.iExist'));
      await tick();
      expect(rx.next).to.have.been.calledTwice;
      expect(rx.next.getCall(0)).to.have.been.calledWithExactly(iExist2);
      expect(rx.next.getCall(1)).to.have.been.calledWithExactly(iExist);
      expect(rx.complete).to.be.have.been.called;
    });
  });

  describe('element exist or added observable', () => {
    let iExist: HTMLElement;
    let addMe: HTMLElement;

    beforeEach(() => {
      iExist = $('.iExist')[0];
      addMe = $('<span/>').addClass('iExist afterIAmAdded')[0];
    });

    it('should emit node when a node matching the selector exists or is added', async () => {
      rx.subscribeTo(elementExistOrAdded$('.iExist'));
      await tick();
      expect(rx.next).to.have.been.calledOnce.calledWithExactly(iExist);
      $('#appendToMe').append(addMe);
      await tick();
      expect(rx.next).to.have.been.calledTwice.calledWith(addMe);
      expect(rx.complete).to.not.have.been.called;
    });
  });
});
