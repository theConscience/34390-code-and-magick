'use strict';


/**
 * @param {Object} review
 * @param {HTMLElement} container
 * @return {HTMLElement}
 * @private
 */
var renderReviewElement = function(template, review) {
  var element = template.cloneNode(true);
  var image = new Image(124, 124);
  var imageLoadTimeout;
  var IMAGE_TIMEOUT = 10000;
  var authorImage = element.querySelector('.review-author');
  var reviewText = element.querySelector('.review-text');
  var reviewRating = element.querySelector('.review-rating');
  var RATING_TWO_CLASS = 'review-rating-two';
  var RATING_THREE_CLASS = 'review-rating-three';
  var RATING_FOUR_CLASS = 'review-rating-four';
  var RATING_FIVE_CLASS = 'review-rating-five';

  var rating = review.getRating();
  var description = review.getDescription();
  var date = review.getDate();
  var authorName = review.getAuthorName();
  var usefulness = review.getReviewUsefulness();
  var pictureSrc = review.getPictureSrc();

  switch (rating) {
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

  reviewText.textContent = description;
  authorImage.setAttribute('title', 'Оставлено ' + date + ' пользователем ' + authorName + ', полезность: ' + usefulness);
  authorImage.setAttribute('alt', 'Аватар пользователя: ' + authorName);

  // image.onload = function() {
  //   clearTimeout(imageLoadTimeout);
  //   authorImage.setAttribute('src', pictureSrc);
  //   authorImage.setAttribute('width', '124');
  //   authorImage.setAttribute('height', '124');
  //   delete image.onerror;
  // };
  //
  // image.onerror = function() {
  //   element.classList.add('review-load-failure');
  //   delete image.onload;
  // };

  var onImageLoad = function() {
    clearTimeout(imageLoadTimeout);
    authorImage.setAttribute('src', review.getPictureSrc());
    authorImage.setAttribute('width', '124');
    authorImage.setAttribute('height', '124');
    image.removeEventListener('error', onImageError);
  };

  var onImageError = function() {
    element.classList.add('review-load-failure');
    image.removeEventListener('load', onImageLoad);
  };

  image.addEventListener('load', onImageLoad);
  image.addEventListener('error', onImageError);

  imageLoadTimeout = setTimeout(function() {
    image.src = '';
    element.classList.add('review-load-failure');
  }, IMAGE_TIMEOUT);

  image.src = pictureSrc;

  //container.appendChild(element);
  return element;
};

module.exports = renderReviewElement;
