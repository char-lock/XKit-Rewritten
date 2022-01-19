import { keyToClasses, descendantSelector } from '../util/css_map.js';
import { translate } from '../util/language_data.js';
import { onBaseContainerMutated } from '../util/mutations.js';

let knightRiderLoaderSelector;
let scrollToBottomButton;
let scrollToBottomIcon;
let active = false;

const scrollToBottom = () => window.scrollTo({ top: document.documentElement.scrollHeight });
const observer = new ResizeObserver(scrollToBottom);

const onClick = () => {
  if (active) {
    observer.disconnect();
    active = false;
  } else {
    observer.observe(document.documentElement);
    scrollToBottom();
    active = true;
  }

  scrollToBottomIcon.style.fill = active ? 'rgb(var(--yellow))' : '';
};

const mutationCallback = () => {
  const noLoaderOnPage = document.querySelector(knightRiderLoaderSelector) === null;
  const buttonWasRemoved = document.documentElement.contains(scrollToBottomButton) === false;

  if (active && (noLoaderOnPage || buttonWasRemoved)) {
    observer.disconnect();
    active = false;
    scrollToBottomIcon.style.fill = '';
  } else if (!scrollToBottomButton || buttonWasRemoved) {
    init();
  }
};

const init = async function () {
  const scrollToTopLabel = await translate('Scroll to top');
  const hiddenClasses = await keyToClasses('hidden');

  const scrollToTopButton = document.querySelector(`button[aria-label="${scrollToTopLabel}"]`);
  if (!scrollToTopButton) return;

  if (!scrollToBottomButton) {
    scrollToBottomButton = scrollToTopButton.cloneNode(true);
    hiddenClasses.forEach(className => scrollToBottomButton.classList.remove(className));
    scrollToBottomButton.removeAttribute('aria-label');
    scrollToBottomButton.style.marginTop = '0.5ch';
    scrollToBottomButton.style.transform = 'rotate(180deg)';
    scrollToBottomButton.addEventListener('click', onClick);

    scrollToBottomIcon = scrollToBottomButton.querySelector('svg');
    scrollToBottomIcon.style.fill = active ? 'rgb(var(--yellow))' : '';
  }

  scrollToTopButton.after(scrollToBottomButton);
};

export const main = async function () {
  knightRiderLoaderSelector = await descendantSelector('postColumn', 'timeline', 'loader', 'knightRiderLoader');
  onBaseContainerMutated.addListener(mutationCallback);
  init();
};

export const clean = async function () {
  onBaseContainerMutated.removeListener(mutationCallback);
  observer.disconnect();
  scrollToBottomButton?.remove();
};
