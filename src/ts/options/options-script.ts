import * as $ from 'jquery';
import {defaultOptions} from 'src/ts/options/default-options';
import {IOptions} from 'src/ts/options/option';
import {logger} from 'src/ts/util/logger';
import {IRunnable} from 'src/ts/util/runnable';

export class OptionsScript implements IRunnable {
  public run(): void {
    loadOptions();
    $('#save-btn').on('click', saveOptions);
    $('#defaults-btn').on('click', restoreDefaults);
    $('#add-metadata-option').on('click', (event: any) => syncAddMetadataOptionInputs(event.target.checked));
    $('#clean-title-option').on('click', (event: any) => syncCleanTitleOptionInputs(event.target.checked));
  }
}

function loadOptions() {
  chrome.storage.sync.get(defaultOptions, setOptions.bind(this));
}

function saveOptions() {
  hideErrorMessages();
  const options = getOptions();
  if (validateOptions(options)) {
    chrome.storage.sync.set(options);
    $('#confirm-msg').text('Options saved.').show().delay(1000).fadeOut();
  }
}

function restoreDefaults() {
  hideErrorMessages();
  setOptions(defaultOptions);
}

function validateOptions(options: IOptions): boolean {
  // Validate clean track title pattern
  let validCleanTrackTitlePattern = true;
  if (options.cleanTrackTitle.enabled) {
    try {
      new RegExp(options.cleanTrackTitle.pattern);
    } catch (e) {
      validCleanTrackTitlePattern = false;
      logger.error('Invalid clean track title regex pattern entered', e);
      $('#clean-title-pattern').css('border-color', 'red');
      $('#clean-title-pattern-err-msg').text('Not a valid regular expression.').show();
    }
  }

  return validCleanTrackTitlePattern;
}

function setOptions(options: IOptions) {
  $('#add-metadata-option').prop('checked', options.addMetadata.enabled);
  $('#add-cover-art').prop('checked', options.addMetadata.addCoverArt);
  syncAddMetadataOptionInputs(options.addMetadata.enabled);

  $('#always-mp3-option').prop('checked', options.alwaysDownloadMp3);

  $('#clean-title-option').prop('checked', options.cleanTrackTitle.enabled);
  $('#clean-title-pattern').val(options.cleanTrackTitle.pattern);
  syncCleanTitleOptionInputs(options.cleanTrackTitle.enabled);

  $('#overwrite-option').prop('checked', options.overwriteExistingFiles);
}

function syncAddMetadataOptionInputs(metadataEnabled: boolean) {
  $('#add-cover-art').prop('disabled', !metadataEnabled);
}

function syncCleanTitleOptionInputs(cleanTitleEnabled: boolean) {
  $('#clean-title-pattern').prop('disabled', !cleanTitleEnabled);
}

function getOptions(): IOptions {
  return {
    addMetadata: {
      enabled: $('#add-metadata-option').prop('checked'),
      addCoverArt: $('#add-cover-art').prop('checked'),
    },
    alwaysDownloadMp3: $('#always-mp3-option').prop('checked'),
    cleanTrackTitle: {
      enabled: $('#clean-title-option').prop('checked'),
      pattern: $('#clean-title-pattern').val().toString(),
    },
    overwriteExistingFiles: $('#overwrite-option').prop('checked'),
  };
}

function hideErrorMessages() {
  $('textarea').css('border-color', '');
  $('.error').hide();
}
