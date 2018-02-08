import * as $ from 'jquery';
import {SC_BUTTON_CLASSES, ZC_DL_BUTTON_CLASS, ZC_TRACK_DL_BUTTON_ID} from '../constants';
import {ContentPage} from './content-page';

export class TrackContentPage extends ContentPage {
  constructor() {
    super('zc-track-content', shouldLoad, onLoad);
  }
}

function shouldLoad() {
  const TRACK_URL_PATTERN = /^[^:]*:\/\/soundcloud\.com\/([^\/]+)\/([^\/]+)(?:\?in=.+)?$/;
  const TRACK_URL_BLACKLIST_1 = ['you', 'charts', 'pages', 'settings', 'jobs', 'tags', 'stations'];
  const TRACK_URL_BLACKLIST_2 = ['stats'];
  const matchResults = TRACK_URL_PATTERN.exec(document.location.href);
  return matchResults &&
    (TRACK_URL_BLACKLIST_1.indexOf(matchResults[1]) < 0) &&
    (TRACK_URL_BLACKLIST_2.indexOf(matchResults[2]) < 0);
}

function onLoad() {
  console.log('(ZC): Loaded track content script');
  const downloadButton = $('<button/>')
    .addClass(SC_BUTTON_CLASSES)
    .addClass(ZC_DL_BUTTON_CLASS)
    .attr('id', ZC_TRACK_DL_BUTTON_ID)
    .prop('title', 'Download this track')
    .on('click', () => console.log('(ZC): Clicked download button!'));
}
