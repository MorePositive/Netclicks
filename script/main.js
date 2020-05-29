const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const SERVER = 'https://api.themoviedb.org/3';
const API_KEY = '83aa169c64152ef6046f76b8502e643c';

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const dropdown = document.querySelectorAll('.dropdown');
const tvShowsList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const tvShows = document.querySelector('.tv-shows');
const tvCardImg = document.querySelector('.tv-card__img')
const tvShowsHead = document.querySelector('.tv-shows__head');
const posterWrapper = document.querySelector('.poster__wrapper');
const modalContent = document.querySelector('.modal__content');

const modalTitle = document.querySelector('.modal__title');
const genresList = document.querySelector('.genres-list');
const rating = document.querySelector('.rating');
const description = document.querySelector('.description');
const modalLink = document.querySelector('.modal__link');
const searchForm = document.querySelector('.search__form');
const searchFormInput = document.querySelector('.search__form-input');

const pagination = document.querySelector('.pagination');


const preloader = document.querySelector('.preloader');

const loading = document.createElement('div');
loading.className = 'loading';


class DBService {
  getData = async (url) => {
    const res = await fetch(url);
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`Get data error url: ${url}`)
    }
  }
  getTestData = () => {
    return this.getData('test.json')
  }
  getTestCard = () => {
    return this.getData('card.json')
  }
  getSearchResult = (query) => {
    this.temp = `${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-Ru`;
    return this.getData(this.temp);
  }
  getNextPage = (page) => {
    return this.getData(`${this.temp}&page=${page}`);
  }

  getTvShow = (id) => this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-Ru`);
  getTopRated = () => this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-Ru`);
  getPopular = () => this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-Ru`);
  getToday = () => this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-Ru`);
  getWeek = () => this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-Ru`);

}

service = new DBService();

const renderCard = (res, target) => {

  tvShowsList.textContent = '';

  if (!res.total_results) {
    loading.remove();
    tvShowsHead.textContent = 'По Вашему запросу ничего не найдено!';
    tvShowsHead.style.cssText = 'color: red; display: inline-block; border-bottom: 1px solid red;';
    return
  }

  tvShowsHead.textContent = target ? target.textContent : 'Результат поиска';
  tvShowsHead.style.color = 'green';

  res.results.forEach(item => {
    const { poster_path: poster,
           backdrop_path: backdrop, 
           name: title, 
           vote_average: rating,
           id
          } = item;

    const posterImg = poster ? IMG_URL + poster : 'img/no-poster.jpg';
    const backdropImg = backdrop ? IMG_URL + backdrop : '';
    const voteValue = rating ? `<span class="tv-card__vote">${rating}</span>` : '';

    const card = document.createElement('li');
    card.id = id;
    card.classList.add('tv-shows__item');
    card.innerHTML = `
    <a href="#" id=${id} class="tv-card">
      ${voteValue}
      <img class="tv-card__img"
            src="${posterImg}"
            data-backdrop="${backdropImg}"
            alt=${title}>
      <h4 class="tv-card__head">${title}</h4>
    </a>
    `;
    loading.remove();
    tvShowsList.append(card);
  });

  const totalPages = res.total_pages;

  pagination.textContent = '';

  if (!target && totalPages > 1) {
    for (let i = 1; i <= totalPages; i++) {
      pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
    }
  }
}

searchForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = searchFormInput.value.trim();
  if (value) {
    tvShows.append(loading);
    service.getSearchResult(value).then(renderCard);
  }
  searchFormInput.value = '';
});

// hide dropdown

const hideDropdown = () => {
  dropdown.forEach(item => {
    item.classList.remove('active');
  });
};

// show/hide menu

hamburger.addEventListener('click', () => {
  leftMenu.classList.toggle('openMenu');
  hamburger.classList.toggle('open');
  hideDropdown();
});

// hide menu miss-click 

document.addEventListener('click', (e) => {
  if (!e.target.closest('.left-menu')) {
    leftMenu.classList.remove('openMenu');
    hamburger.classList.remove('open');
    hideDropdown();
  }
});

leftMenu.addEventListener('click', (e) => {
  e.preventDefault();
  const target = e.target;
  const dropdown = target.closest('.dropdown');
  if (dropdown) {
    dropdown.classList.toggle('active');
    leftMenu.classList.add('openMenu');
    hamburger.classList.add('open');
  }
  if (target.closest('#top-rated')) {
    tvShows.append(loading);
    service.getTopRated().then( res => renderCard(res, target));
  }
  if (target.closest('#popular')) {
    tvShows.append(loading);
    service.getPopular().then( res => renderCard(res, target));
  }
  if (target.closest('#today')) {
    tvShows.append(loading);
    service.getToday().then( res => renderCard(res, target));
  }
  if (target.closest('#week')) {
    tvShows.append(loading);   
    service.getWeek().then( res => renderCard(res, target));
  }
  if (target.closest('#search')) {
    tvShowsList.textContent = '';
    tvShowsHead.textContent = '';
  }

});

// modal show

tvShowsList.addEventListener('click', (e) => {
  e.preventDefault();
  const card = e.target.closest('.tv-card');
  
  if (card) {
    
    preloader.style.display = 'block';

    service.getTvShow(card.id)
      .then(({
        poster_path: posterPath, 
        name: title, 
        original_name: originalName,
        genres, 
        vote_average: voteAverage, 
        overview, 
        homepage}) => {
        if (posterPath) {
          tvCardImg.src = IMG_URL + posterPath;
          tvCardImg.alt = originalName;
          posterWrapper.style.display = '';
          modalContent.style.paddingLeft = '';
        } else {
          posterWrapper.style.display = 'none';
          modalContent.style.paddingLeft = '25px';
        }
        modalTitle.textContent = title;
        genresList.textContent = '';
        for (let item of genres) {
          genresList.innerHTML += `<li>${item.name}</li>`
        }
        rating.textContent = voteAverage;
        description.textContent = overview;
        modalLink.href = homepage;
      })
      .then(() => {
        document.body.style.overflow = 'hidden';
        modal.classList.remove('hide');
        modal.style.backgroundColor = 'rgba(255,255,255, 0.5)'
      }) 
      .finally(() => {
        preloader.style.display = '';
      })
  }
  
});

// modal hide

modal.addEventListener('click', (e) => {
  if (e.target.closest('.cross') || e.target.classList.contains('modal')) {
    document.body.style.overflow = '';
    modal.classList.add('hide');
  }
});

// card flip

const flipImage = (e) => {
  const card = e.target.closest('.tv-shows__item');

  if(card) {
    const img = card.querySelector('.tv-card__img');
    if (img.dataset.backdrop) {
      [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src];
    }
  }
};

tvShowsList.addEventListener('mouseover', flipImage);
tvShowsList.addEventListener('mouseout', flipImage);

pagination.addEventListener('click', (e) => {
  e.preventDefault();
  const target = e.target;

  if (target.classList.contains('pages')) {
    tvShows.append(loading);
    console.log(target.textContent)
    service.getNextPage(target.textContent).then(renderCard);
  }
});