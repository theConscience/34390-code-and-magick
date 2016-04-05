/** global reviews */
'use strict';

var reviewsFilter = document.querySelector('.reviews-filter'),
  reviewTemplate = document.querySelector('#review-template'),
  reviewsListContainer = document.querySelector('.reviews-list'),
  reviewElementToClone;

reviewsFilter.classList.add('invisible');

if ('content' in reviewTemplate) {  // находим шаблон
  reviewElementToClone = reviewTemplate.content.querySelector('.review');
} else {
  reviewElementToClone = reviewTemplate.querySelector('.review');
}

var createReviewElement = function(review, container) {
  var element = reviewElementToClone.cloneNode(true),
    image = new Image(124, 124),
    imageLoadTimeout,
    IMAGE_TIMEOUT = 10000;

  var authorImage = element.querySelector('.review-author'),
    reviewRating = element.querySelector('.review-rating'),
    reviewRatingClone,
    reviewText = element.querySelector('.review-text');

  for (var i = 0; i < parseInt(review.rating, 10) - 1; i++) {
    reviewRatingClone = reviewRating.cloneNode(true);
    reviewRating.parentNode.insertBefore(reviewRatingClone, reviewRating);
  }
  reviewText.textContent = review.description;
  authorImage.setAttribute('title', review.author.name);
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

window.reviews.forEach(function(review, index, arr) {
  createReviewElement(review, reviewsListContainer);
  if (index === arr.length - 1) {
    reviewsFilter.classList.remove('invisible');
  }
});
