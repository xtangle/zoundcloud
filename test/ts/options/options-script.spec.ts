import * as $ from 'jquery';
import {clock, match, restore, useFakeTimers} from 'sinon';
import {defaultOptions} from 'src/ts/options/default-options';
import {IOptions} from 'src/ts/options/option';
import {OptionsScript} from 'src/ts/options/options-script';
import {configureChai, useSinonChrome} from 'test/ts/test-initializers';

const expect = configureChai();
const HTML_KEY = '__html__';
const optionsHTML = (window as any)[HTML_KEY]['options.html'];

describe('options script', () => {
  const sinonChrome = useSinonChrome();
  let fixture: OptionsScript;

  // mock options values should differ from the default options for testing purposes
  const mockOptions: IOptions = Object.freeze({
    addMetadata: {
      enabled: false,
      addCoverArt: false,
    },
    alwaysDownloadMp3: true,
    cleanTrackTitle: {
      enabled: false,
      pattern: 'abcdefg',
    },
    overwriteExistingFiles: true,
  });

  beforeEach(() => {
    useFakeTimers();

    document.body.innerHTML = optionsHTML;
    sinonChrome.storage.sync.get.withArgs(defaultOptions, match.any).yields(defaultOptions);
    fixture = new OptionsScript();
  });

  afterEach(() => {
    restore();
  });

  context('when script is run', () => {
    it('should load the default options if there were no saved options', () => {
      fixture.run();
      verifyHTMLState(defaultOptions);
    });

    it('should load options from Chrome storage if there were saved options', () => {
      sinonChrome.storage.sync.get.withArgs(defaultOptions, match.any).yields(mockOptions);
      fixture.run();
      verifyHTMLState(mockOptions);
    });
  });

  context('when the add metadata option checkbox is clicked', () => {
    beforeEach(() => {
      fixture.run();
    });

    it('should enable the add cover art checkbox when checked', () => {
      setHTMLState({...mockOptions, addMetadata: {enabled: false, addCoverArt: true}});
      $('#add-metadata-option').trigger('click');
      expect($('#add-cover-art')).to.have.$prop('disabled', false);
    });

    it('should disable the add cover art checkbox when unchecked', () => {
      setHTMLState({...mockOptions, addMetadata: {enabled: true, addCoverArt: true}});
      $('#add-metadata-option').trigger('click');
      expect($('#clean-title-pattern')).to.have.$prop('disabled', true);
    });
  });

  context('when the clean title option checkbox is clicked', () => {
    beforeEach(() => {
      fixture.run();
    });

    it('should enable the clean title pattern input when checked', () => {
      setHTMLState({...mockOptions, cleanTrackTitle: {enabled: false, pattern: ''}});
      $('#clean-title-option').trigger('click');
      expect($('#clean-title-pattern')).to.have.$prop('disabled', false);
    });

    it('should disable the clean title pattern input when unchecked', () => {
      setHTMLState({...mockOptions, cleanTrackTitle: {enabled: true, pattern: ''}});
      $('#clean-title-option').trigger('click');
      expect($('#clean-title-pattern')).to.have.$prop('disabled', true);
    });
  });

  context('when the Save button is clicked', () => {
    beforeEach(() => {
      fixture.run();
    });

    it('should clear all existing error messages', () => {
      verifyErrMsgsAreClearedWhenBtnIsClicked($('#save-btn'));
    });

    context('when options are valid', () => {
      it('should save options to Chrome storage', () => {
        setHTMLState(mockOptions);
        $('#save-btn').trigger('click');
        expect(sinonChrome.storage.sync.set).to.have.been.calledOnceWithExactly(mockOptions);
      });

      it('should show the confirmation message', () => {
        const confirmMsg = $('#confirm-msg');
        expect(confirmMsg).to.be.$hidden;

        $('#save-btn').trigger('click');
        expect(confirmMsg).to.be.$visible;

        clock.tick(1500); // 1s + 400ms fade out animation + 100ms room for error (?)
        expect(confirmMsg).to.be.$hidden;
      });
    });

    context('when the Clean Track Title regex pattern is invalid', () => {
      beforeEach(() => {
        setHTMLState({...mockOptions, cleanTrackTitle: {enabled: true, pattern: '\\\\\\'}});
        $('#save-btn').trigger('click');
      });

      it('should not save options to Chrome storage', () => {
        expect(sinonChrome.storage.sync.set).to.not.have.been.called;
      });

      it('should not show the confirmation message', () => {
        expect($('#confirm-msg')).to.be.$hidden;
      });

      it('should show where the error is', () => {
        expect($('#clean-title-pattern')).to.have.$css('border-color', 'rgb(255, 0, 0)');
        expect($('#clean-title-pattern-err-msg')).to.be.$visible
          .and.to.have.$text('Not a valid regular expression.');
      });
    });
  });

  context('when the Default button is clicked', () => {
    beforeEach(() => {
      fixture.run();
      setHTMLState(mockOptions);
    });

    it('should clear all existing error messages', () => {
      verifyErrMsgsAreClearedWhenBtnIsClicked($('#save-btn'));
    });

    it('should set options on the page to reflect the default options', () => {
      $('#defaults-btn').trigger('click');
      verifyHTMLState(defaultOptions);
    });
  });

  function verifyErrMsgsAreClearedWhenBtnIsClicked(button: JQuery<HTMLElement>) {
    // Show error messages
    const cleanTitlePattern = $('#clean-title-pattern');
    const cleanTitlePatternErrMsg = $('#clean-title-pattern-err-msg');

    cleanTitlePattern.css('border-color', 'red');
    cleanTitlePatternErrMsg.show();

    button.trigger('click');

    // Verify errors are reset
    expect(cleanTitlePattern).not.to.have.$css('border-color', 'rgb(255, 0, 0)');
    expect(cleanTitlePatternErrMsg).to.be.$hidden;
  }

  function setHTMLState(options: IOptions) {
    $('#add-metadata-option').prop('checked', options.addMetadata.enabled);
    const addCoverArtInput = $('#add-cover-art');
    addCoverArtInput.prop('checked', options.addMetadata.addCoverArt);
    addCoverArtInput.prop('disabled', !options.addMetadata.enabled);

    $('#always-mp3-option').prop('checked', options.alwaysDownloadMp3);

    $('#clean-title-option').prop('checked', options.cleanTrackTitle.enabled);
    const cleanTitlePatternInput = $('#clean-title-pattern');
    cleanTitlePatternInput.val(options.cleanTrackTitle.pattern);
    cleanTitlePatternInput.prop('disabled', !options.cleanTrackTitle.enabled);

    $('#overwrite-option').prop('checked', options.overwriteExistingFiles);
  }

  function verifyHTMLState(options: IOptions) {
    expect($('#add-metadata-option')).to.have.$prop('checked', options.addMetadata.enabled);
    expect($('#add-cover-art')).to.have.$prop('checked', options.addMetadata.addCoverArt);

    expect($('#always-mp3-option')).to.have.$prop('checked', options.alwaysDownloadMp3);

    expect($('#clean-title-option')).to.have.$prop('checked', options.cleanTrackTitle.enabled);
    expect($('#clean-title-pattern')).to.have.$val(options.cleanTrackTitle.pattern);

    expect($('#overwrite-option')).to.have.$prop('checked', options.overwriteExistingFiles);
  }
});
