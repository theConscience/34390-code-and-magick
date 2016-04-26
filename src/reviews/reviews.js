'use strict';

var utils = require('../utils/utils');
var Filter = require('./filters/filter_types');
var filterReviews = require('./filters/filter_reviews');
var Review = require('./review');

var reviewsFilter = document.querySelector('.reviews-filter'),
  reviewsListContainer = document.querySelector('.reviews-list'),
  moreReviewsButton = document.querySelector('.reviews-controls-more');

/** @type {Array.<Object>} */
var reviews = [];

/** @type {Array.<Review>} */
var renderedReviews = [];

/** @type {Array.<Object>} */
var filteredReviews = [];

/** @type {HTMLElement} */
var activeFilter = document.querySelector('input[name=reviews]:checked');

/** @type {HTMLElement} */
var activeFilterLabel = document.querySelector('label[for=' + activeFilter.id + ']');

/** @constant {string} */
var DEFAULT_FILTER = Filter.ALL;

/** @constant {number} */
var PAGE_SIZE = 3;

/** @type {number} */
var pageNumber = 0;

reviewsFilter.classList.add('invisible');

/**
 * @param {Array.<Object>} reviewsToRender
 * @param {number} page
 * @param {boolean=} reload
 */
var prepareToRenderReviews = function(reviewsToRender, page, reload) {
  if (reload) {
    while (renderedReviews.length) {
      var removedLastReview = renderedReviews.pop();
      removedLastReview.remove();
    }
  }

  var from = page * PAGE_SIZE;
  var to = from + PAGE_SIZE;

  reviewsToRender.slice(from, to).forEach(function(review) {
    renderedReviews.push(new Review(review, reviewsListContainer));
  });
  reviewsFilter.classList.remove('invisible');
};

/** @param {Filter} filterId */
var setReviewsActiveFilter = function(filterId) {
  filteredReviews = filterReviews(reviews, filterId);
  pageNumber = 0;
  prepareToRenderReviews(filteredReviews, pageNumber, true);
  activeFilter.checked = false;
  activeFilterLabel.setAttribute('aria-checked', 'false');
  var activeFilterNew = document.querySelector('#' + filterId);
  var activeFilterLabelNew = document.querySelector('label[for=' + filterId + ']');
  activeFilterNew.checked = true;
  activeFilterLabelNew.setAttribute('aria-checked', 'true');
  activeFilter = activeFilterNew;
  activeFilterLabel = activeFilterLabelNew;
};

/**
 * Навешиваем обработчики клика и нажатия кнопок по фильтрам
 */
var setReviewsFiltersListeners = function() {
  reviewsFilter.addEventListener('click', function(evt) {
    if (evt.target.classList.contains('reviews-filter-item') &&
    evt.target.getAttribute('for') !== activeFilter.id) {
      evt.preventDefault();
      var filterId = evt.target.getAttribute('for');
      setReviewsActiveFilter(filterId);
      setMoreReviewsListener();
    }
  });

  reviewsFilter.addEventListener('keydown', function(evt) {
    if (evt.target.classList.contains('reviews-filter-item') &&
    utils.isActivationEvent(evt)) {
      evt.preventDefault();
      var filterId = evt.target.getAttribute('for');
      setReviewsActiveFilter(filterId);
      setMoreReviewsListener();
    }
  });
};

/**
 * Обработчик клика и нажатия клавиш по кнопке 'Eщё отзывы'
 * @param {MouseEvent} evt [description]
 */
var renderNextReviewPage = function(evt) {
  if (evt.type === 'click' ||
  evt.type === 'keydown' && utils.isActivationEvent(evt)) {
    evt.preventDefault();
    if (utils.isNextPageAvailable(filteredReviews, pageNumber, PAGE_SIZE)) {
      pageNumber++;
      prepareToRenderReviews(filteredReviews, pageNumber, false);
    } else {
      if (!moreReviewsButton.classList.contains('invisible')) {
        moreReviewsButton.classList.add('invisible');
      }
      moreReviewsButton.removeEventListener('click', renderNextReviewPage);
    }
  }
};

/**
 * Функция для добавления/снятия обработчиков клика и клавиш с кнопки 'Ещё отзывы'
 * в зависимости от условия
 */
var setMoreReviewsListener = function() {
  moreReviewsButton.removeEventListener('click', renderNextReviewPage);
  if (utils.isNextPageAvailable(filteredReviews, pageNumber, PAGE_SIZE)) {
    if (moreReviewsButton.classList.contains('invisible')) {
      moreReviewsButton.classList.remove('invisible');
    }
    moreReviewsButton.addEventListener('click', renderNextReviewPage);
    moreReviewsButton.addEventListener('keydown', renderNextReviewPage);
  }
};

/** @param {Array.<Object>} loadedReviews */
var setReviews = function(loadedReviews) {
  reviews = loadedReviews;
  setReviewsFiltersListeners();
  setReviewsActiveFilter(DEFAULT_FILTER);
  setMoreReviewsListener();
};

module.exports.setReviews = setReviews;
