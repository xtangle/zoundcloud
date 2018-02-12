export function shimMutationObserver(): void {
  const mutationObserver = 'MutationObserver';
  (global as any)[mutationObserver] = require('mutation-observer');
}
