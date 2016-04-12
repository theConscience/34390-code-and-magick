'use strict';

var reviewsFilter = document.querySelector('.reviews-filter'),
  reviewTemplate = document.querySelector('#review-template'),
  reviewsListContainer = document.querySelector('.reviews-list'),
  reviewsSection = document.querySelector('.reviews'),
  reviewElementToClone;

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
    reviewRating = element.querySelector('.review-rating'),
    reviewRatingClone,
    reviewText = element.querySelector('.review-text');

  for (var i = 0; i < +review.rating - 1; i++) {
    reviewRatingClone = reviewRating.cloneNode(true);
    reviewRating.parentNode.insertBefore(reviewRatingClone, reviewRating);
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

var renderReviews = function(reviews) {
  reviewsListContainer.innerHTML = '';
  reviews.forEach(function(review) {
    renderReview(review, reviewsListContainer);
  });
  reviewsFilter.classList.remove('invisible');
};

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

var getFilteredReviews = function(reviews, filter) {
  var reviewsToFilter = reviews,
    TWO_WEEKS_MS = 14 * 24 * 3600 * 1000;

  switch (filter) {
    case 'reviews-recent':
      return reviewsToFilter.filter(function(review) {
        return Date.now() - new Date(review.date).valueOf() < TWO_WEEKS_MS;
      }).sort(function(a, b) {
        return new Date(b.date).valueOf() - new Date(a.date).valueOf();
      });
    case 'reviews-good':
      return reviewsToFilter.filter(function(review) {
        return review.rating >= 3;
      }).sort(function(a, b) {
        return b.rating - a.rating;
      });
    case 'reviews-bad':
      return reviewsToFilter.filter(function(review) {
        return review.rating <= 2;
      }).sort(function(a, b) {
        return a.rating - b.rating;
      });
    case 'reviews-popular':
      return reviewsToFilter.sort(function(a, b) {
        return b.review_usefulness - a.review_usefulness;
      });
    case 'reviews-all':
    default:
      return reviewsToFilter;
  }
};

var setReviewsFilter = function(reviews, filterId) {
  var filteredReviews = getFilteredReviews(reviews, filterId);
  renderReviews(filteredReviews);
  if (document.querySelector('.reviews-filter-item.active')) {
    document.querySelector('.reviews-filter-item.active').classList.remove('active');
  }
  document.querySelector('#' + filterId).classList.add('active');
};

var setReviewsFilters = function(reviews) {
  var filters = document.querySelectorAll('[name=reviews]');
  for (var i = 0; i < filters.length; i++) {
    filters[i].onclick = function(evt) {
      var filterId = evt.target.id;
      setReviewsFilter(reviews, filterId);
    };
  }
};

var setReviews = function(loadedReviews) {
  var reviews = loadedReviews;
  setReviewsFilters(reviews);
  renderReviews(reviews);
};

loadReviews(setReviews);
