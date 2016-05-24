'use strict';

var utils = require('../utils/utils');
var BaseComponent = require('../utils/base_component');
var _renderReviewElement = require('./render_review_element');

var reviewTemplate = document.querySelector('#review-template');
var reviewElementToClone = null;
var REVIEW_QUIZ_ANSWER_ACTIVE_CLASS = 'review-quiz-answer-active';
var REVIEW_QUIZ_ANSWER_POSITIVE_CLASS = 'review-quiz-answer-yes';
var REVIEW_QUIZ_ANSWER_NEGATIVE_CLASS = 'review-quiz-answer-no';

if ('content' in reviewTemplate) {  // находим шаблон
  reviewElementToClone = reviewTemplate.content.querySelector('.review');
} else {
  reviewElementToClone = reviewTemplate.querySelector('.review');
}

/**
 * @param {Object} review
 * @param {HTMLElement} container
 * @constructor
 */
var Review = function(review, container) {
  BaseComponent.call(this, review, container, reviewElementToClone);

  this.renderElement = _renderReviewElement;
  this.element = this.renderElement(this.template, this.data);

  this.reviewAnswerChange = function(evt) {
    evt.preventDefault();
    var changedAnswerElement = utils.getClosestWithClass(evt.target, 'review-quiz-answer');
    if (changedAnswerElement.classList.contains(REVIEW_QUIZ_ANSWER_POSITIVE_CLASS)) {
      this.data.setReviewUsefulness(true);
    } else if (changedAnswerElement.classList.contains(REVIEW_QUIZ_ANSWER_NEGATIVE_CLASS)) {
      this.data.setReviewUsefulness(false);
    }
  };

  this.onReviewAnswerClick = this.onReviewAnswerClick.bind(this);
  this.onReviewAnswerKeyDown = this.onReviewAnswerKeyDown.bind(this);

  this.onSetRating = this.onSetRating.bind(this);
  this.onSetUsefulness = this.onSetUsefulness.bind(this);

  this.mount(container);
  this.listenEvents({
    'clickEvents': [this.onReviewAnswerClick],
    'keyDownEvents': [this.onReviewAnswerKeyDown],
    'customEvents': [
      ['set:rating', this.onSetRating],
      ['set:usefulness', this.onSetUsefulness]
    ]
  });
};

utils.inherit(Review, BaseComponent);

Review.prototype.reRender = function() {
  BaseComponent.prototype.reRender.call(this);
  this.listenEvents({
    'clickEvents': [this.onReviewAnswerClick],
    'keyDownEvents': [this.onReviewAnswerKeyDown],
    'customEvents': [
      ['set:rating', this.onSetRating],
      ['set:usefulness', this.onSetUsefulness]
    ]
  });
};

/**
* Обработчик клика по кнопке полезности отзыва
 * @param {MouseEvent} evt
 */
Review.prototype.onReviewAnswerClick = function(evt) {  // вызывается через addEventListener, поэтому делаем перезапись метода через .bind(this) в конструкторе
  if (utils.hasOwnOrAncestorClass(evt.target, 'review-quiz-answer')) {
    this.reviewAnswerChange(evt);
  }
};

/**
 * Обработчик нажатия клавиши при фокусе на кнопке полезности отзыва
 * @param {KeyboardEvent} evt
 */
Review.prototype.onReviewAnswerKeyDown = function(evt) {  // вызывается через addEventListener, поэтому делаем перезапись метода через .bind(this) в конструкторе
  if (utils.hasOwnOrAncestorClass(evt.target, 'review-quiz-answer') &&
      utils.isActivationEvent(evt)) {
    this.reviewAnswerChange(evt);
  }
};

/**
 * Обработчик изменения рейтинга компонента данных отзыва
 * @param {CustomEvent} evt
 */
Review.prototype.onSetRating = function(evt) {  // вызывается через addEventListener, поэтому делаем перезапись метода через .bind(this) в конструкторе
  if (evt.detail.data === this.data) {
    this.reRender();  // либо ререндерим
    // либо делаем декорирование, в данном случае - навешиваем правильный класс на this.element
  }
};

/**
 * Обработчик изменения полезности компонента данных отзыва
 * @param {CustomEvent} evt
 */
Review.prototype.onSetUsefulness = function(evt) {  // вызывается через addEventListener, поэтому делаем перезапись метода через .bind(this) в конструкторе
  if (evt.detail.data === this.data) {
    // снимаем класс активности, если есть и меняем aria
    var quizElement = this.element.querySelector('.review-quiz');
    if (quizElement.querySelector('.' + REVIEW_QUIZ_ANSWER_ACTIVE_CLASS)) {
      quizElement.querySelector('.' + REVIEW_QUIZ_ANSWER_ACTIVE_CLASS).setAttribute('aria-checked', 'false');
      quizElement.querySelector('.' + REVIEW_QUIZ_ANSWER_ACTIVE_CLASS).classList.remove(REVIEW_QUIZ_ANSWER_ACTIVE_CLASS);
    }
    // навешиваем класс активности на нужный элемент с классом .review-quiz-answer и меняем aria
    var answerElement = null;
    if (evt.detail.answer === true) {
      answerElement = this.element.querySelector('.' + REVIEW_QUIZ_ANSWER_POSITIVE_CLASS);
    } else {
      answerElement = this.element.querySelector('.' + REVIEW_QUIZ_ANSWER_NEGATIVE_CLASS);
    }
    answerElement.setAttribute('aria-checked', 'true');
    answerElement.classList.add(REVIEW_QUIZ_ANSWER_ACTIVE_CLASS);
  }
};

module.exports = Review;
