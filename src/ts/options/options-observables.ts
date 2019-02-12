import {bindCallback, Observable} from 'rxjs';
import {defaultOptions} from 'src/ts/options/default-options';
import {IOptions} from 'src/ts/options/option';

// note: cannot use bind on chrome.storage.sync.get function for some reason, have to use a lambda
const getOptionsWithDefaults = (cb: (result: IOptions) => void) => chrome.storage.sync.get(defaultOptions, cb);

export const OptionsObservables = {
  getOptions$(): Observable<IOptions> {
    return bindCallback<IOptions>(getOptionsWithDefaults)();
  },
};
