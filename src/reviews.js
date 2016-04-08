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
  console.log('renderReview review =', review);
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
  console.log('renderReviews reviews =', reviews);
  reviewsListContainer.innerHTML = '';
  reviews.forEach(function(review) {
    renderReview(review, reviewsListContainer);
  });
  reviewsFilter.classList.remove('invisible');
};

var loadReviews = function(callback) {
  var xhr = new XMLHttpRequest(),
    XHR_DONE = 4,
    XHR_OPENED = 1,
    REVIEWS_LOAD_URL = '//o0.github.io/assets/json/reviews.json';

  xhr.open('GET', REVIEWS_LOAD_URL, true);

  xhr.onreadystatechange = function(evt) {
    var requestObject = evt.target;

    switch (requestObject.readyState) {
      case XHR_OPENED:
        reviewsSection.classList.add('reviews-load-failure');
        break;
      case XHR_DONE:
        reviewsSection.classList.remove('reviews-load-failure');
        var loadedReviews = JSON.parse(requestObject.response);
        callback(loadedReviews);
        break;
      default:
        console.log(Error('Unknown error'));
    }

    xhr.timeout = 10000;
    xhr.ontimeout = function() {
      console.log(Error('Соединение сброшено по тайм-ауту'));
      //xhr.abort();
    };
  };

  xhr.send();
};

var getFilteredReviews = function(reviews, filter) {
  console.log('getFilteredReviews reviews =', reviews);
  var reviewsToFilter = reviews,
    //TWO_WEEKS_MS = 14 * 24 * 3600 * 1000,
    THIRTEEN_WEEKS_MS = 91 * 24 * 3600 * 1000;

  switch (filter) {
    case 'reviews-recent':
      return reviewsToFilter.sort(function(a, b) {
        console.log(new Date(), new Date(a.date));
        console.log('date.now - a.date - 12 weeks', Date.now() - new Date(a.date).valueOf() - THIRTEEN_WEEKS_MS);
        return new Date(b.date).valueOf() - new Date(a.date).valueOf();
      }).filter(function(review) {
        return Date.now() - new Date(review.date).valueOf() < THIRTEEN_WEEKS_MS;
      });
    case 'reviews-good':
      return reviewsToFilter.sort(function(a, b) {
        return b.rating - a.rating;
      }).filter(function(review) {
        return review.rating >= 3;
      });
    case 'reviews-bad':
      return reviewsToFilter.sort(function(a, b) {
        return a.rating - b.rating;
      }).filter(function(review) {
        return review.rating <= 2;
      });
    case 'reviews-popular':
      reviewsToFilter.sort(function(a, b) {
        return b.review_usefulness - a.review_usefulness;
      });
  }

  return reviewsToFilter;
};

var setReviewsFilter = function(reviews, filterId) {
  console.log('setReviewsFilter reviews before filtering =', reviews);
  var filteredReviews = getFilteredReviews(reviews, filterId);
  console.log('setReviewsFilter filteredReviews =', filteredReviews);
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
      console.log('setReviewsFilters filterId =', filterId);
      setReviewsFilter(reviews, filterId);
    };
  }
};

var setReviews = function(loadedReviews) {
  var reviews = loadedReviews;
  console.log('setReviews reviews =', reviews);
  setReviewsFilters(reviews);
  renderReviews(reviews);
};

loadReviews(setReviews);
