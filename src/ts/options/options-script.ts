import * as $ from 'jquery';
import {defaultOptions} from 'src/ts/options/default-options';
import {IOptions} from 'src/ts/options/option';
import {IRunnable} from 'src/ts/util/runnable';

export class OptionsScript implements IRunnable {
  public run(): void {
    restoreOptions();
    $('#save-btn').on('click', saveOptions);
    $('#defaults-btn').on('click', setToDefaults);
    $('#clean-title-option').on('click', (event: any) => syncCleanTitlePatternInput(event.target.checked));
  }
}

function restoreOptions() {
  chrome.storage.sync.get(defaultOptions, setOptions.bind(this));
}

function saveOptions() {
  chrome.storage.sync.set(getOptions());
  $('#confirm-msg').show().delay(1000).fadeOut();
}

function setToDefaults() {
  setOptions(defaultOptions);
}

function syncCleanTitlePatternInput(enabled: boolean) {
  $('#clean-title-pattern').prop('disabled', !enabled);
}

function setOptions(options: IOptions) {
  $('#add-metadata-option').prop('checked', options.addMetadata);
  $('#always-mp3-option').prop('checked', options.alwaysDownloadMp3);
  $('#clean-title-option').prop('checked', options.cleanTrackTitle.enabled);
  $('#clean-title-pattern').val(options.cleanTrackTitle.pattern);
  syncCleanTitlePatternInput(options.cleanTrackTitle.enabled);
  $('#overwrite-option').prop('checked', options.overwriteExistingFiles);
}

function getOptions(): IOptions {
  return {
    addMetadata: $('#add-metadata-option').prop('checked'),
    alwaysDownloadMp3: $('#always-mp3-option').prop('checked'),
    cleanTrackTitle: {
      enabled: $('#clean-title-option').prop('checked'),
      pattern: $('#clean-title-pattern').val().toString(),
    },
    overwriteExistingFiles: $('#overwrite-option').prop('checked'),
  };
}
