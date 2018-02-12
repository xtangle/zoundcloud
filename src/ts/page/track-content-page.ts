import * as $ from 'jquery';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/delay';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {ZC_DL_BUTTON_CLASS} from '../constants';
import {ContentPage} from './content-page';
import {domElementRemoved$} from './dom-utils';

export class TrackContentPage extends ContentPage {
  protected injectContent$: Subject<boolean>;

  constructor() {
    super('zc-track-content');
  }

  protected shouldLoad(): boolean {
    const TRACK_URL_PATTERN = /^[^:]*:\/\/soundcloud\.com\/([^\/]+)\/([^\/]+)(?:\?in=.+)?$/;
    const TRACK_URL_BLACKLIST_1 = ['you', 'charts', 'pages', 'settings', 'jobs', 'tags', 'stations'];
    const TRACK_URL_BLACKLIST_2 = ['stats'];
    const matchResults = TRACK_URL_PATTERN.exec(document.location.href);
    return matchResults &&
      (TRACK_URL_BLACKLIST_1.indexOf(matchResults[1]) < 0) &&
      (TRACK_URL_BLACKLIST_2.indexOf(matchResults[2]) < 0);
  }

  protected onInit(): void {
    this.injectContent$ = Subject.create(null, Observable.interval(10000).delay(1000));
    this.subscriptions.add(this.injectContent$.subscribe(this.injectContents.bind(this)));
  }

  private injectContents(): void {
    if (!downloadButtonExists()) {
      console.log('(ZC): Injecting contents');
      const soundActions = getSoundActionsToolbar();
      if (soundActions.length) {
        const dlButton = createDownloadButton(soundActions);
        dlButton.on('click', () => console.log('(ZC): Clicked download button!'));
        addDownloadButton(soundActions, dlButton);
        this.subscriptions.add(domElementRemoved$(dlButton[0]).subscribe(() => {
          console.log('Button removed!');
          this.injectContent$.next(true);
        }));
      }
    }
  }
}

function downloadButtonExists(): boolean {
  return $('#zcTrackDlButton').length > 0;
}

function getSoundActionsToolbar(): JQuery<HTMLElement> {
  let soundActions = $('.listenEngagement .soundActions');
  if (!!soundActions.length) {
    soundActions = $('.soundActions.soundActions__medium');
  }
  return soundActions.first();
}

function createDownloadButton(soundActions: JQuery<HTMLElement>): JQuery<HTMLElement> {
  const dlButton = $('<button/>')
    .addClass(['sc-button', 'sc-button-medium'])
    .addClass(ZC_DL_BUTTON_CLASS)
    .attr('id', 'zcTrackDlButton')
    .prop('title', 'Download this track');
  if ($(soundActions).find('.sc-button-responsive').length) {
    dlButton.addClass('sc-button-responsive');
    dlButton.html('Download');
  } else {
    dlButton.addClass('sc-button-icon');
  }
  return dlButton;
}

function addDownloadButton(soundActions: JQuery<HTMLElement>, dlButton: JQuery<HTMLElement>): void {
  const buttonGroup = soundActions.children('div').first();
  if (buttonGroup.length) {
    const lastButtonInGroup = buttonGroup.children('button').last();
    if (lastButtonInGroup.hasClass('sc-button-more')) {
      dlButton.insertBefore(lastButtonInGroup);
    } else {
      buttonGroup.append(dlButton);
    }
  }
}
