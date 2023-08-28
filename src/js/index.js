import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import '../css/common.css';
import PictureApiService from './picture-service.js';

const NUM_RESULTS_PER_PAGE = 40;
const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

hideElement(refs.loadMoreBtn);

const pictureApiService = new PictureApiService({
  perPage: NUM_RESULTS_PER_PAGE,
});

refs.form.addEventListener('submit', submitSearchHandler);
refs.loadMoreBtn.addEventListener('click', loadMoreClickHandler);

async function submitSearchHandler(e) {
  e.preventDefault();
  const formRef = e.currentTarget;

  galleryClear();
  hideElement(refs.loadMoreBtn);
  pictureApiService.resetPage();

  const topic = formRef.elements.searchQuery.value.trim();
  if (topic === '') {
    showNotification('failure', 'Please enter something');
    return;
  }
  pictureApiService.query = topic;

  const totalHits = await fetchImages();
  if (totalHits) {
    showNotification('success', `Hooray! We found ${totalHits} images.`);
  }
}

async function loadMoreClickHandler(e) {
  await fetchImages();
}

async function fetchImages() {
  try {
    const images = await pictureApiService.fetchImage();
    const totalHints = images.totalHits;
    if (totalHints === 0) {
      showNotification(
        'failure',
        'Sorry, there are no images matching your search query. Please try again.'
      );
      hideElement(refs.loadMoreBtn);
      return;
    }

    const galleryMarkup = buildGalleryMarkup(images);
    appendGalleryMarkup(galleryMarkup);
    createGalleryBox();
    showElement(refs.loadMoreBtn);

    const numberShownImg = NUM_RESULTS_PER_PAGE * pictureApiService.page;
    if (numberShownImg >= totalHints) {
      showNotification(
        'warning',
        "We're sorry, but you've reached the end of search results."
      );
      hideElement(refs.loadMoreBtn);
      return;
    }

    pictureApiService.incrementPage();
    return totalHints;
  } catch (error) {
    showNotification(
      'failure',
      'Oops! Something went wrong! Try reloading the page!'
    );
    hideElement(refs.loadMoreBtn);
    console.log(error.message);
  }
}

function galleryClear() {
  refs.gallery.innerHTML = '';
}

function buildGalleryMarkup({ hits }) {
  return hits.reduce((acc, hit) => {
    return (acc += `
    <li class="gallery-item">
      <a class="gallery-link" href="${hit.largeImageURL}">
        <img class="gallery-image" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" />
      </a>
      <div class="gallery-info">
        <p class="gallery-info-item">
          <b>Likes</b>
          ${hit.likes}
        </p>
        <p class="gallery-info-item">
          <b>Views</b>
          ${hit.views}
        </p>
        <p class="gallery-info-item">
          <b>Comments</b>
          ${hit.comments}
        </p>
        <p class="gallery-info-item">
          <b>Downloads</b>
          ${hit.downloads}
        </p>
      </div>
    </li>
    `);
  }, '');
}

function createGalleryBox() {
  return new SimpleLightbox('.gallery-link');
}

function appendGalleryMarkup(markup) {
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function hideElement(element) {
  element.classList.add('is-hidden');
}
function showElement(element) {
  element.classList.remove('is-hidden');
}
function showNotification(type, text) {
  const types = ['success', 'failure', 'warning', 'info'];
  if (!types.includes(type)) {
    return;
  }
  Notify[type](text, { clickToClose: true });
}
