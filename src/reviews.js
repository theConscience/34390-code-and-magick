'use strict';

var reviewsFilter = document.querySelector('.reviews-filter'),
  reviewTemplate = document.querySelector('#review-template'),
  reviewsListContainer = document.querySelector('.reviews-list'),
  //nextElementAfterContainer = reviewsListContainer.nextElementSibling,
  moreReviewsButton = document.querySelector('.reviews-controls-more'),
  reviewsSection = document.querySelector('.reviews'),
  reviews = [],
  filteredReviews = [],
  reviewElementToClone,
  Filters = {
    RECENT: 'reviews-recent',
    GOOD: 'reviews-good',
    BAD: 'reviews-bad',
    POPULAR: 'reviews-popular',
    ALL: 'reviews-all'
  },
  DEFAULT_FILTER = Filters.ALL,
  ACTIVE_FILTER_CLASSNAME = 'active',
  PAGE_SIZE = 3,
  pageNumber = 0;

if ('content' in reviewTemplate) {  // находим шаблон
  reviewElementToClone = reviewTemplate.content.querySelector('.review');
} else {
  reviewElementToClone = reviewTemplate.querySelector('.review');
}

reviewsFilter.classList.add('invisible');

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

var setReviewsFilter = function(filterId) {
  filteredReviews = getFilteredReviews(reviews, filterId);
  pageNumber = 0;
  renderReviews(filteredReviews, pageNumber, true);
  if (document.querySelector('.reviews-filter-item.' + ACTIVE_FILTER_CLASSNAME)) {
    document.querySelector('.reviews-filter-item.' + ACTIVE_FILTER_CLASSNAME).classList.remove(ACTIVE_FILTER_CLASSNAME);
  }
  document.querySelector('#' + filterId).classList.add(ACTIVE_FILTER_CLASSNAME);
  // + ARIA
};

var setReviewsFilters = function() {
  // var filters = document.querySelectorAll('[name=reviews]');
  // for (var i = 0; i < filters.length; i++) {
  //   filters[i].onclick = function(evt) {
  //     var filterId = evt.target.id;
  //     setReviewsFilter(filterId);
  //     setMoreReviewsListener();
  //   };
  // }
  reviewsFilter.addEventListener('click', function(evt) {
    if (evt.target.classList.contains('reviews-filter-item')) {
      var filterId = evt.target.getAttribute('for');
      console.log('filterId =', filterId);
      setReviewsFilter(filterId);
      setMoreReviewsListener();
    }
  });
};

// /**  @return {boolean} */
// var isAtBottom = function() {
//   var GAP = 100;
//   var nextElementPosition = nextElementAfterContainer.getBoundingClientRect();
//   console.log('nextElementPosition =', nextElementPosition);
//   console.log('window.innerHeight + GAP =', window.innerHeight, '+', GAP);
//   console.log('nextElementPosition.top < window.innerHeight + GAP = ', nextElementPosition.top < window.innerHeight + GAP);
//   return nextElementPosition.top < window.innerHeight + GAP;
// };

/**
 * @param {Array} elements
 * @param {Number} page
 * @param {Number} pageSize
 * @return {boolean}
 */
var isNextPageAvailable = function(elements, page, pageSize) {
  var lastPage = Math.floor(elements.length / pageSize);
  console.log('page =', page);
  console.log('lastPage =', lastPage);
  console.log('page < lastPage =', page < lastPage);
  return page < lastPage;
};

// var setOnScrollReviewsLoader = function() {
//   var scrollTimeOut;
//   window.addEventListener('scroll', function() {
//     clearTimeout(scrollTimeOut);
//     scrollTimeOut = setTimeout(function() {
//       if (isAtBottom() && isNextPageAvailable(reviews, pageNumber, PAGE_SIZE)) {
//         pageNumber++;
//         console.log('load page #', pageNumber, '\n\n======');
//         renderReviews(filteredReviews, pageNumber, false);
//       }
//     }, 100);
//   });
// };

var renderNextReviewPage = function() {
  console.log('renderNextPage');
  if (isNextPageAvailable(reviews, pageNumber, PAGE_SIZE)) {
    pageNumber++;
    renderReviews(filteredReviews, pageNumber, false);
  } else {
    if (!moreReviewsButton.classList.contains('invisible')) {
      moreReviewsButton.classList.add('invisible');
    }
    moreReviewsButton.removeEventListener('click', renderNextReviewPage);
  }
};

var setMoreReviewsListener = function() {
  moreReviewsButton.removeEventListener('click', renderNextReviewPage);
  if (isNextPageAvailable(reviews, pageNumber, PAGE_SIZE)) {
    if (moreReviewsButton.classList.contains('invisible')) {
      moreReviewsButton.classList.remove('invisible');
    }
    moreReviewsButton.addEventListener('click', renderNextReviewPage);
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
  //setOnScrollReviewsLoader();
  setMoreReviewsListener();
};

loadReviews(setReviews);
