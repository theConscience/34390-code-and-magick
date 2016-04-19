'use strict';

var reviewsFilter = document.querySelector('.reviews-filter'),
  reviewTemplate = document.querySelector('#review-template'),
  reviewElementToClone = null,
  reviewsListContainer = document.querySelector('.reviews-list'),
  moreReviewsButton = document.querySelector('.reviews-controls-more'),
  reviewsSection = document.querySelector('.reviews');

if ('content' in reviewTemplate) {  // находим шаблон
  reviewElementToClone = reviewTemplate.content.querySelector('.review');
} else {
  reviewElementToClone = reviewTemplate.querySelector('.review');
}

/** @type {Array.<Object>} */
var reviews = [];

/** @type {Array.<Object>} */
var filteredReviews = [];

/** @enum {string} */
var Filters = {
  RECENT: 'reviews-recent',
  GOOD: 'reviews-good',
  BAD: 'reviews-bad',
  POPULAR: 'reviews-popular',
  ALL: 'reviews-all'
};

/** @type {HTMLElement} */
var activeFilter = null;

/** @type {HTMLElement} */
var activeFilterLabel = null;

/** @constant {string} */
var DEFAULT_FILTER = Filters.ALL;

/** @constant {number} */
var PAGE_SIZE = 3;

/** @type {number} */
var pageNumber = 0;

reviewsFilter.classList.add('invisible');

/**
 * @param {Object} review
 * @param {HTMLElement} container
 * @return {HTMLElement}
 */
var renderReview = function(review, container) {
  var element = reviewElementToClone.cloneNode(true),
    image = new Image(124, 124),
    imageLoadTimeout,
    IMAGE_TIMEOUT = 10000,
    authorImage = element.querySelector('.review-author'),
    reviewText = element.querySelector('.review-text'),
    reviewRating = element.querySelector('.review-rating'),
    RATING_TWO_CLASS = 'review-rating-two',
    RATING_THREE_CLASS = 'review-rating-three',
    RATING_FOUR_CLASS = 'review-rating-four',
    RATING_FIVE_CLASS = 'review-rating-five';

  switch (review.rating) {
    case 2:
      reviewRating.classList.add(RATING_TWO_CLASS);
      break;
    case 3:
      reviewRating.classList.add(RATING_THREE_CLASS);
      break;
    case 4:
      reviewRating.classList.add(RATING_FOUR_CLASS);
      break;
    case 5:
      reviewRating.classList.add(RATING_FIVE_CLASS);
      break;
  }

  reviewText.textContent = review.description;
  authorImage.setAttribute('title', 'Оставлено ' + review.date + ' пользователем ' + review.author.name + ', полезность: ' + review.review_usefulness);
  authorImage.setAttribute('alt', 'Аватар пользователя: ' + review.author.name);

  image.onload = function() {
    clearTimeout(imageLoadTimeout);
    authorImage.setAttribute('src', review.author.picture);
    authorImage.setAttribute('width', '124');
    authorImage.setAttribute('height', '124');
  };

  image.onerror = function() {
    element.classList.add('review-load-failure');
  };

  imageLoadTimeout = setTimeout(function() {
    image.src = '';
    element.classList.add('review-load-failure');
  }, IMAGE_TIMEOUT);

  image.src = review.author.picture;

  container.appendChild(element);
  return element;
};

/**
 * @param {Array.<Object>} reviewsToRender
 * @param {number} page
 * @param {boolean=} reload
 */
var renderReviews = function(reviewsToRender, page, reload) {
  if (reload) {
    reviewsListContainer.innerHTML = '';
  }

  var from = page * PAGE_SIZE;
  var to = from + PAGE_SIZE;

  reviewsToRender.slice(from, to).forEach(function(review) {
    renderReview(review, reviewsListContainer);
  });
  reviewsFilter.classList.remove('invisible');
};

/**
 * @param {Array.<Object>} reviewsToFilter
 * @param {Filter} filter
 */
var getFilteredReviews = function(reviewsToFilter, filter) {
  var reviewsToFilterClone = reviewsToFilter.slice(0),
    TWO_WEEKS_MS = 14 * 24 * 3600 * 1000;

  switch (filter) {
    case Filters.RECENT:
      return reviewsToFilterClone.filter(function(review) {
        return Date.now() - new Date(review.date).valueOf() < TWO_WEEKS_MS;
      }).sort(function(a, b) {
        return new Date(b.date).valueOf() - new Date(a.date).valueOf();
      });
    case Filters.GOOD:
      return reviewsToFilterClone.filter(function(review) {
        return review.rating >= 3;
      }).sort(function(a, b) {
        return b.rating - a.rating;
      });
    case Filters.BAD:
      return reviewsToFilterClone.filter(function(review) {
        return review.rating <= 2;
      }).sort(function(a, b) {
        return a.rating - b.rating;
      });
    case Filters.POPULAR:
      return reviewsToFilterClone.sort(function(a, b) {
        return b.review_usefulness - a.review_usefulness;
      });
    case Filters.ALL:
    default:
      return reviewsToFilterClone;
  }
};

/** @param {Filter} filterId */
var setReviewsFilter = function(filterId) {
  filteredReviews = getFilteredReviews(reviews, filterId);
  pageNumber = 0;
  renderReviews(filteredReviews, pageNumber, true);
  //activeFilter.checked = false;
  activeFilterLabel.setAttribute('aria-checked', 'false');
  var activeFilterNew = document.querySelector('#' + filterId);
  var activeFilterLabelNew = document.querySelector('label[for=' + filterId + ']');
  activeFilterNew.checked = true;
  activeFilterLabelNew.setAttribute('aria-checked', 'true');
  activeFilter = activeFilterNew;
  activeFilterLabel = activeFilterLabelNew;
};

var setReviewsFilters = function() {
  activeFilter = document.querySelector('input[name=reviews]:checked');
  activeFilterLabel = document.querySelector('label[for=' + activeFilter.id + ']');

  reviewsFilter.addEventListener('click', function(evt) {
    if (evt.target.classList.contains('reviews-filter-item') &&
      evt.target.getAttribute('for') !== activeFilter.id) {
      var filterId = evt.target.getAttribute('for');
      setReviewsFilter(filterId);
      setMoreReviewsListener();
    }
  });

  reviewsFilter.addEventListener('keydown', function(evt) {
    if (evt.target.classList.contains('reviews-filter-item') && [13, 32].indexOf(evt.keyCode) > -1) {
      evt.preventDefault();
      var filterId = evt.target.getAttribute('for');
      setReviewsFilter(filterId);
      setMoreReviewsListener();
    }
  });
};

/**
 * @param {Array} elements
 * @param {Number} page
 * @param {Number} pageSize
 * @return {boolean}
 */
var isNextPageAvailable = function(elements, page, pageSize) {
  var lastPage = Math.floor(elements.length / pageSize);
  return page < lastPage;
};

/**
 * @param {click} evt
 */
var renderNextReviewPage = function(evt) {
  if (evt.type === 'click' ||
    evt.type === 'keydown' && [13, 32].indexOf(evt.keyCode) > -1) {
    if (isNextPageAvailable(filteredReviews, pageNumber, PAGE_SIZE)) {
      pageNumber++;
      renderReviews(filteredReviews, pageNumber, false);
    } else {
      if (!moreReviewsButton.classList.contains('invisible')) {
        moreReviewsButton.classList.add('invisible');
      }
      moreReviewsButton.removeEventListener('click', renderNextReviewPage);
    }
  }
};

var setMoreReviewsListener = function() {
  moreReviewsButton.removeEventListener('click', renderNextReviewPage);
  if (isNextPageAvailable(filteredReviews, pageNumber, PAGE_SIZE)) {
    if (moreReviewsButton.classList.contains('invisible')) {
      moreReviewsButton.classList.remove('invisible');
    }
    moreReviewsButton.addEventListener('click', renderNextReviewPage);
    moreReviewsButton.addEventListener('keydown', renderNextReviewPage);
  }
};

/** @param {function(Array.<Object>)} callback */
var loadReviews = function(callback) {
  var xhr = new XMLHttpRequest(),
    XHR_UNSENT = 0,
    XHR_OPENED = 1,
    XHR_HEADERS_RECEIVED = 2,
    XHR_LOADING = 3,
    XHR_DONE = 4,
    REVIEWS_LOAD_URL = '//o0.github.io/assets/json/reviews.json',
    XHR_TIMEOUT = 10000;

  xhr.open('GET', REVIEWS_LOAD_URL, true);

  xhr.onreadystatechange = function(evt) {
    var requestObject = evt.target;

    switch (requestObject.readyState) {
      case XHR_UNSENT:
        break;
      case XHR_OPENED:
        reviewsSection.classList.add('reviews-list-loading');
        break;
      case XHR_HEADERS_RECEIVED:
        console.log('xhr headers recieved');
        break;
      case XHR_LOADING:
        console.log('xhr loading...');
        break;
      case XHR_DONE:
        console.log('xhr done!');
        reviewsSection.classList.remove('reviews-list-loading');
        var loadedReviews = JSON.parse(requestObject.response);
        callback(loadedReviews);
        break;
      default:
        console.log(Error('Неизвестная ошибка'));
    }

    xhr.onerror = function() {
      console.log(Error('Ошибка сервера'));
      reviewsSection.classList.remove('reviews-list-loading');
      reviewsSection.classList.add('reviews-load-failure');
    };

    xhr.timeout = XHR_TIMEOUT;
    xhr.ontimeout = function() {
      console.log(Error('Соединение сброшено по тайм-ауту'));
      reviewsSection.classList.remove('reviews-list-loading');
      reviewsSection.classList.add('reviews-load-failure');
      xhr.abort();
    };
  };

  xhr.send();
};

/** @param {Array.<Object>} loadedReviews */
var setReviews = function(loadedReviews) {
  reviews = loadedReviews;
  setReviewsFilters();
  setReviewsFilter(DEFAULT_FILTER);
  setMoreReviewsListener();
};

loadReviews(setReviews);
