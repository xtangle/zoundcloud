import {TRACK_URL_PATTERN} from './constants';

console.log('(ZC) Content script loaded!');
console.log('(ZC) Tab URL', document.location.href);
console.log('(ZC) Tab URL Matches track URL pattern', document.location.href.match(TRACK_URL_PATTERN));
