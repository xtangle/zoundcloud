import * as $ from 'jquery';
import {defaultOptions, IOptions} from 'src/ts/options/option';
import {IRunnable} from 'src/ts/util/runnable';

export class OptionsScript implements IRunnable {
  public run(): void {
    restoreOptions();
    $('#save-btn').on('click', saveOptions);
    $('#reset-btn').on('click', resetToDefaults);
  }
}

function restoreOptions() {
  chrome.storage.sync.get(defaultOptions, setOptions.bind(this));
}

function saveOptions() {
  chrome.storage.sync.set(getOptions());
  $('#confirm-msg').show().delay(1000).fadeOut();
}

function resetToDefaults() {
  setOptions(defaultOptions);
  saveOptions();
}

function setOptions(options: IOptions) {
  $('#add-metadata-option').prop('checked', options.addMetadata);
  $('#always-mp3-option').prop('checked', options.alwaysDownloadMp3);
  $('#clean-title-option').prop('checked', options.cleanTrackTitle);
  $('#overwrite-option').prop('checked', options.overwriteExistingFiles);
}

function getOptions(): IOptions {
  return {
    addMetadata: $('#add-metadata-option').prop('checked'),
    alwaysDownloadMp3: $('#always-mp3-option').prop('checked'),
    cleanTrackTitle: $('#clean-title-option').prop('checked'),
    overwriteExistingFiles: $('#overwrite-option').prop('checked')
  };
}
