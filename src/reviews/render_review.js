'use strict';

var reviewTemplate = document.querySelector('#review-template'),
  reviewElementToClone = null;

if ('content' in reviewTemplate) {  // находим шаблон
  reviewElementToClone = reviewTemplate.content.querySelector('.review');
} else {
  reviewElementToClone = reviewTemplate.querySelector('.review');
}

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

module.exports = renderReview;
