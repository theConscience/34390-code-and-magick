'use strict';

var utils = require('../utils/utils');

var reviewTemplate = document.querySelector('#review-template');
var reviewElementToClone = null;
var REVIEW_QUIZ_ANSWER_ACTIVE_CLASS = 'review-quiz-answer-active';

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
var createReviewElement = function(review) {
  var element = reviewElementToClone.cloneNode(true);
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

  //container.appendChild(element);
  return element;
};

/**
 * @param {Object} review
 * @param {HTMLElement} container
 * @constructor
 */
var Review = function(review, container) {

  /** @type {Array.<Objects>} */
  this.data = review;

  /** @type {HTMLElement} */
  this.element = createReviewElement(this.data);

  /**
  * Обработчик клика по кнопке полезности отзыва
   * @param {MouseEvent} evt
   */
  this.onReviewAnswerClick = function(evt) {  // при вызове в addEventListener, this внутри этого обработчика ссылается на this.element
    if (utils.hasOwnOrAncestorClass(evt.target, 'review-quiz-answer')) {
      evt.preventDefault();
      // снимаем класс активности, если есть и меняем aria
      var quizElement = this.querySelector('.review-quiz');  // это работает, поскольку тут this ссылается на dom-элемент отзыва, а не на весь объект
      if (quizElement.querySelector('.' + REVIEW_QUIZ_ANSWER_ACTIVE_CLASS)) {
        quizElement.querySelector('.' + REVIEW_QUIZ_ANSWER_ACTIVE_CLASS).setAttribute('aria-checked', 'false');
        quizElement.querySelector('.' + REVIEW_QUIZ_ANSWER_ACTIVE_CLASS).classList.remove(REVIEW_QUIZ_ANSWER_ACTIVE_CLASS);
      }
      // навешиваем класс активности на ближайший элемент с классом .review-quiz-answer и меняем aria
      var clickedAnswerElement = utils.getClosestWithClass(evt.target, 'review-quiz-answer');
      clickedAnswerElement.setAttribute('aria-checked', 'true');
      clickedAnswerElement.classList.add(REVIEW_QUIZ_ANSWER_ACTIVE_CLASS);
    }
  };

  /**
   * Обработчик нажатия клавиши при фокусе на кнопке полезности отзыва
   * @param {KeyboardEvent} evt
   */
  this.onReviewAnswerKeyDown = function(evt) {  // при вызове в addEventListener, this внутри этого обработчика ссылается на this.element
    if (utils.hasOwnOrAncestorClass(evt.target, 'review-quiz-answer') &&
    utils.isActivationEvent(evt)) {
      evt.preventDefault();
      // снимаем класс активности, если есть и меняем aria
      var quizElement = this.querySelector('.review-quiz');  // это работает, поскольку тут this ссылается на dom-элемент отзыва, а не на весь объект
      if (quizElement.querySelector('.' + REVIEW_QUIZ_ANSWER_ACTIVE_CLASS)) {
        quizElement.querySelector('.' + REVIEW_QUIZ_ANSWER_ACTIVE_CLASS).setAttribute('aria-checked', 'false');
        quizElement.querySelector('.' + REVIEW_QUIZ_ANSWER_ACTIVE_CLASS).classList.remove(REVIEW_QUIZ_ANSWER_ACTIVE_CLASS);
      }
      // навешиваем класс активности на ближайший элемент с классом .review-quiz-answer и меняем aria
      var pressedAnswerElement = utils.getClosestWithClass(evt.target, 'review-quiz-answer');
      pressedAnswerElement.setAttribute('aria-checked', 'true');
      pressedAnswerElement.classList.add(REVIEW_QUIZ_ANSWER_ACTIVE_CLASS);
    }
  };

  this.remove = function() {
    this.element.removeEventListener('click', this.onReviewAnswerClick);
    this.element.removeEventListener('keydown', this.onReviewAnswerKeyDown);
    this.element.parentNode.removeChild(this.element);
  };

  this.element.addEventListener('click', this.onReviewAnswerClick);  // потеря контекста this, this.element становится this внутри обработчика
  this.element.addEventListener('keydown', this.onReviewAnswerKeyDown);  // потеря контекста this, this.element становится this внутри обработчика
  container.appendChild(this.element);
};

module.exports = Review;
