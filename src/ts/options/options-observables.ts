import {bindCallback} from 'rxjs';
import {defaultOptions, IOptions} from 'src/ts/options/option';

export const OptionsObservables = {
  getOptions$() {
    return bindCallback<IOptions, IOptions>(chrome.storage.sync.get)(defaultOptions);
  }
};
