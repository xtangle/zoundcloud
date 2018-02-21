import * as $ from 'jquery';
import 'rxjs/add/operator/first';
import {elementRemoved$} from '../util/dom-observer';
import {IContentPage} from './content-page';

export function bootstrap(contentPage: IContentPage): void {
  if (contentPage.test()) {
    if (!idTagIsInDOM(contentPage.id)) {
      const idTag = createIdTag(contentPage.id);
      addIdTagToDOM(idTag);
      elementRemoved$(idTag).first().subscribe(() => contentPage.unload());
      contentPage.load();
    }
  } else {
    removeIdTagFromDOM(contentPage.id);
  }
}

function idTagIsInDOM(id: string): boolean {
  return $(`#${id}`).length > 0;
}

function createIdTag(id: string): HTMLElement {
  return $('<div/>', {id})[0];
}

function addIdTagToDOM(idTag: HTMLElement): void {
  $('body').append(idTag);
}

function removeIdTagFromDOM(id: string): void {
  $(`#${id}`).remove();
}
