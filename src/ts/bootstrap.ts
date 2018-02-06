import * as $ from 'jquery';

export function bootstrapContentScript(scriptId: string, loadPredicate: () => boolean,
                                       onScriptLoad: () => void, onScriptUnload: () => void = () => undefined) {
  if (loadPredicate()) {
    if (!scriptLoaded(scriptId)) {
      addScriptIdTag(scriptId);
      onScriptLoad();
    }
  } else {
    removeScriptIdTag(scriptId);
    onScriptUnload();
  }
}

function scriptLoaded(id: string): boolean {
  return $(`#${id}`).length > 0;
}

function addScriptIdTag(id: string) {
  $('body').append($('<div/>', {id}));
}

function removeScriptIdTag(id: string) {
  $(`#${id}`).remove();
}
