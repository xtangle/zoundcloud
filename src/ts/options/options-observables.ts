import {bindCallback} from 'rxjs';
import {defaultOptions} from 'src/ts/options/default-options';
import {IOptions} from 'src/ts/options/option';

export const OptionsObservables = {
  getOptions$() {
    return bindCallback<IOptions, IOptions>(chrome.storage.sync.get)(defaultOptions);
  },
};
