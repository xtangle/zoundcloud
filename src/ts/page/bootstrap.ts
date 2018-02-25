import * as $ from 'jquery';
import 'rxjs/add/operator/first';
import {elementAdded$, elementRemoved$} from '../util/dom-observer';
import {IContentPage} from './content-page';

export function bootstrap(contentPage: IContentPage): void {
  if (contentPage.test()) {
    if (!idTagIsInDOM(contentPage.id)) {
      const idTag = createIdTag(contentPage.id);
      elementAdded$((node: Node) => node.isSameNode(idTag)).first().subscribe(() => contentPage.load());
      elementRemoved$(idTag).first().subscribe(() => contentPage.unload());
      addIdTagToDOM(idTag);
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
