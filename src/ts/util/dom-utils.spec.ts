import * as chai from 'chai';
import {expect} from 'chai';
import * as $ from 'jquery';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {spy} from 'sinon';
import * as sinonChai from 'sinon-chai';
import {elementRemoved$} from './dom-utils';

/* tslint:disable:no-unused-expression */
describe('dom-utils', () => {
  chai.use(sinonChai);
  let subscription: Subscription;

  afterEach(() => {
    subscription.unsubscribe();
  });

  describe('element removed observable', () => {
    let removeMe: HTMLElement;
    let fixture: Observable<boolean>;

    beforeEach(() => {
      document.body.innerHTML = `
        <ul>
          <li>One</li>
          <li id="removeMe">Two<span>(2)</span></li>
          <li>Three</li>
        </ul>
      `;
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
      const callback = spy();
      subscription = fixture.subscribe((val) => callback(val));
      span.remove();
      setTimeout(() => {
        expect(callback).to.not.have.been.called;
        done();
      }, this.timeout);
    });
  });

});
