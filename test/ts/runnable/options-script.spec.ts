import {defaultOptions, IOptions} from '@src/options/option';
import {OptionsScript} from '@src/runnable/options-script';
import {configureChai, useSinonChrome} from '@test/test-initializers';
import * as $ from 'jquery';
import {clock, restore, useFakeTimers} from 'sinon';

const expect = configureChai();
const HTML_KEY = '__html__';
const optionsHTML = (window as any)[HTML_KEY]['options.html'];

describe('options script', () => {
  const sinonChrome = useSinonChrome();
  let fixture: OptionsScript;

  // values should differ from default options
  const mockOptions: IOptions = {
    addMetadata: false,
    alwaysDownloadMp3: true,
    cleanTrackTitle: false,
    overwriteExistingFiles: true
  };

  beforeEach(() => {
    useFakeTimers();

    document.body.innerHTML = optionsHTML;
    sinonChrome.storage.sync.get.yields(defaultOptions);
    fixture = new OptionsScript();
  });

  afterEach(() => {
    restore();
  });

  context('when script is run', () => {
    it('should restore to the default options if there were no saved options', () => {
      fixture.run();
      verifyHTMLState({
        addMetadata: true,
        alwaysDownloadMp3: true,
        cleanTrackTitle: true,
        overwriteExistingFiles: false
      });
    });

    it('should restore options from Chrome storage if there were saved options', () => {
      sinonChrome.storage.sync.get.yields(mockOptions);
      fixture.run();
      verifyHTMLState(mockOptions);
    });
  });

  context('when save button is clicked', () => {
    beforeEach(() => {
      fixture.run();
    });

    it('should save options to Chrome storage', () => {
      setHTMLState(mockOptions);
      $('#save-btn').trigger('click');
      expect(sinonChrome.storage.sync.set).to.have.been.calledOnceWithExactly(mockOptions);
    });

    it('should show the confirmation message', () => {
      testConfirmMsgWhenBtnIsClicked($('#save-btn'));
    });
  });

  context('when reset button is clicked', () => {
    beforeEach(() => {
      fixture.run();
      setHTMLState(mockOptions);
    });

    it('should save default options to Chrome storage', () => {
      $('#reset-btn').trigger('click');
      expect(sinonChrome.storage.sync.set).to.have.been.calledOnceWithExactly(defaultOptions);
    });

    it('should set options on the page to reflect the default options', () => {
      $('#reset-btn').trigger('click');
      verifyHTMLState(defaultOptions);
    });

    it('should show the confirmation message', () => {
      testConfirmMsgWhenBtnIsClicked($('#reset-btn'));
    });
  });

  function testConfirmMsgWhenBtnIsClicked(button: JQuery<HTMLElement>) {
    const confirmMsg = $('#confirm-msg');
    expect(confirmMsg.is(':hidden')).to.be.true;
    button.trigger('click');
    expect(confirmMsg.is(':hidden')).to.be.false;
    clock.tick(1500); // 1s + 400ms fade out animation + 100ms room for error
    expect(confirmMsg.is(':hidden')).to.be.true;
  }

  function setHTMLState(options: IOptions) {
    $('#add-metadata-option').prop('checked', options.addMetadata);
    $('#always-mp3-option').prop('checked', options.alwaysDownloadMp3);
    $('#clean-title-option').prop('checked', options.cleanTrackTitle);
    $('#overwrite-option').prop('checked', options.overwriteExistingFiles);
  }

  function verifyHTMLState(options: IOptions) {
    expect($('#add-metadata-option').prop('checked')).to.be.equal(options.addMetadata);
    expect($('#always-mp3-option').prop('checked')).to.be.equal(options.alwaysDownloadMp3);
    expect($('#clean-title-option').prop('checked')).to.be.equal(options.cleanTrackTitle);
    expect($('#overwrite-option').prop('checked')).to.be.equal(options.overwriteExistingFiles);
  }
});
