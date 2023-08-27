import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const KEY_API = '39093180-01b58121bfdab958671751791';

export default class PictureApiService {
  #page;
  #perPage;
  #searchQuery;

  constructor({ perPage }) {
    this.#searchQuery = '';
    this.#page = 1;
    this.#perPage = perPage;
  }
  get page() {
    return this.#page;
  }
  incrementPage() {
    return ++this.#page;
  }
  resetPage() {
    this.#page = 1;
  }
  async fetchImage() {
    const searchParams = new URLSearchParams({
      key: KEY_API,
      q: this.#searchQuery,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: 'true',
      page: this.#page,
      per_page: this.#perPage,
    });

    const data = await axios.get(`${BASE_URL}?${searchParams}`);
    return data.data;
  }
  get query() {
    return this.#searchQuery;
  }

  set query(newQuery) {
    this.#searchQuery = newQuery;
  }
}
