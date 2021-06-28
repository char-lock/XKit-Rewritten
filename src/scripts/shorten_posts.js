import { getPostElements } from '../util/interface.js';
import { onNewPosts } from '../util/mutations.js';
import { getPreferences } from '../util/preferences.js';
import { keyToCss } from '../util/css_map.js';

let showTags;
let tagsSelector;

const excludeClass = 'xkit-shorten-posts-done';
const shortenClass = 'xkit-shorten-posts-shortened';
const tagsClass = 'xkit-shorten-posts-tags';
const buttonClass = 'xkit-shorten-posts-expand';

const expandButton = Object.assign(document.createElement('button'), {
  textContent: 'Expand',
  className: buttonClass
});

const unshortenOnClick = ({ currentTarget }) => {
  const postElement = currentTarget.closest('[data-id]');
  if (postElement.classList.contains(shortenClass) === false) {
    return;
  }

  const headerHeight = document.querySelector('header').getBoundingClientRect().height;
  const postMargin = parseInt(getComputedStyle(postElement).getPropertyValue('margin-bottom'));

  postElement.classList.remove(shortenClass);
  postElement.scrollIntoView();
  window.scrollBy({ top: 0 - headerHeight - postMargin });
  postElement.focus();

  const tagsClone = postElement.querySelector(`.${tagsClass}`);
  tagsClone?.parentNode.removeChild(tagsClone);

  currentTarget.parentNode.removeChild(currentTarget);
};

const shortenPosts = async function () {
  getPostElements({ excludeClass, noPeepr: true }).forEach(postElement => {
    if (postElement.getBoundingClientRect().height > (window.innerHeight * 1.5)) {
      postElement.classList.add(shortenClass);

      if (showTags) {
        const tagsElement = postElement.querySelector(tagsSelector);
        if (tagsElement) {
          const tagsClone = tagsElement.cloneNode(true);
          tagsClone.classList.add(tagsClass);
          postElement.querySelector('article')?.appendChild(tagsClone);
        }
      }

      const expandButtonClone = expandButton.cloneNode(true);
      expandButtonClone.addEventListener('click', unshortenOnClick);
      postElement.querySelector('article')?.appendChild(expandButtonClone);
    }
  });
};

export const main = async function () {
  ({ showTags } = await getPreferences('shorten_posts'));
  tagsSelector = await keyToCss('tags');

  onNewPosts.addListener(shortenPosts);
  shortenPosts();
};

export const clean = async function () {
  onNewPosts.removeListener(shortenPosts);

  $(`.${excludeClass}`).removeClass(excludeClass);
  $(`.${shortenClass}`).removeClass(shortenClass);
  $(`.${tagsClass}, .${buttonClass}`).remove();
};

export const stylesheet = true;
