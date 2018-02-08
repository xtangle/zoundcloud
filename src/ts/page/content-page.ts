import * as $ from 'jquery';

export abstract class ContentPage {
  protected constructor(protected readonly id: string,
                        protected readonly shouldLoad: () => boolean,
                        protected readonly onLoad: () => void) {
  }

  public init() {
    if (this.shouldLoad()) {
      if (!contentLoaded(this.id)) {
        loadContent(this.id, this.onLoad);
      }
    } else {
      unloadContent(this.id);
    }
  }
}

function contentLoaded(id: string): boolean {
  return $(`#${id}`).length > 0;
}

function loadContent(id: string, onLoad: () => void) {
  $('body').append($('<div/>', {id}));
  onLoad();
}

function unloadContent(id: string) {
  $(`#${id}`).remove();
}
