'use strict';

var utils = require('../utils/utils');
var BaseComponent = require('../utils/base_component');

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
 * @private
 */
var _renderReviewElement = function(template, review) {
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
  BaseComponent.call(this, review, container, reviewElementToClone);

  this.renderElement = _renderReviewElement;
  this.element = this.renderElement(this.template, this.data);

  this.onReviewAnswerClick = this.onReviewAnswerClick.bind(this);
  this.onReviewAnswerKeyDown = this.onReviewAnswerKeyDown.bind(this);

  this.listenEvents({'clickEvents': [this.onReviewAnswerClick], 'keyDownEvents': [this.onReviewAnswerKeyDown]});
  this.mount(container);
};

utils.inherit(Review, BaseComponent);

/**
* Обработчик клика по кнопке полезности отзыва
 * @param {MouseEvent} evt
 */
Review.prototype.onReviewAnswerClick = function(evt) {  // вызывается через addEventListener, поэтому делаем перезапись метода через .bind(this) в конструкторе
  if (utils.hasOwnOrAncestorClass(evt.target, 'review-quiz-answer')) {
    evt.preventDefault();
    // снимаем класс активности, если есть и меняем aria
    var quizElement = this.element.querySelector('.review-quiz');
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
Review.prototype.onReviewAnswerKeyDown = function(evt) {  // вызывается через addEventListener, поэтому делаем перезапись метода через .bind(this) в конструкторе
  if (utils.hasOwnOrAncestorClass(evt.target, 'review-quiz-answer') &&
  utils.isActivationEvent(evt)) {
    evt.preventDefault();
    // снимаем класс активности, если есть и меняем aria
    var quizElement = this.element.querySelector('.review-quiz');
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

module.exports = Review;
