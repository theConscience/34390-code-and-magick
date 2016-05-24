'use strict';

var utils = require('./utils/utils');
var Game = require('./game/game').Game;
var Verdict = require('./game/game').Verdict;
var addReviewForm = require('./reviews/form/form');
var loadReviews = require('./reviews/load_reviews');
var reviews = require('./reviews/reviews');
var gallery = require('./gallery/gallery');


/** game initializing */
var initializeGame = function() {
  /** @type {HTMLElement} */
  var gameContainer = document.querySelector('.demo');

  /** @type {Game} */
  var game = new Game(gameContainer);
  game.initializeLevelAndStart();
  game.setGameStatus(Verdict.INTRO);
};


/** add review form initializing */
var initializeReviewForm = function() {
  /** @type {HTMLElement} */
  var formOpenButton = document.querySelector('.reviews-controls-new');

  /**
   * Обработчик клика по кнопке добавления отзыва
   * @param {MouseEvent} evt [description]
   */
  var onFormOpenButtonClick = function(evt) {
    evt.preventDefault();
    addReviewForm.showForm();
  };

  /**
   * Обработчик нажатия клавиши при фокусе на кнопке добавления отзыва
   * @param {KeyboardEvent} evt
   */
  var onFormOpenButtonKeyDown = function(evt) {
    if (utils.isActivationEvent(evt)) {
      evt.preventDefault();
      addReviewForm.showForm();
    }
  };

  formOpenButton.addEventListener('click', onFormOpenButtonClick);  // вешаем обработчик клика на кнопку добавления отзыва
  formOpenButton.addEventListener('keydown', onFormOpenButtonKeyDown);  // вешаем обработчик нажатия клавиши на кнопку добавления отзыва
};


/** reviews initializing */
var initializeReviews = function() {
  /** @constant {string} */
  var REVIEWS_LOAD_URL = '//o0.github.io/assets/json/reviews.json';
  loadReviews(REVIEWS_LOAD_URL, reviews.setReviews);
};


/** gallery initializing */
var initializeGallery = function() {
  /** @type {HTMLElement} */
  var photoGallery = document.querySelector('.photogallery');

  /** @type {HTMLElement} */
  var photoGalleryPictures = photoGallery.querySelectorAll('img');  // NodeList

  gallery.savePhotos(photoGalleryPictures);
  gallery.initialize(photoGallery);
};

initializeGame();
initializeReviewForm();
initializeReviews();
initializeGallery();
