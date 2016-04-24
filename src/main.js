'use strict';

var utils = require('./utils/utils');
var Game = require('./game/game').Game;
var Verdict = require('./game/game').Verdict;
var addReviewForm = require('./reviews/form/form');
var loadReviews = require('./reviews/load_reviews');
var reviews = require('./reviews/reviews');
var gallery = require('./gallery/gallery');


/*
 * game initializing
 */

var gameContainer = document.querySelector('.demo'),
  game = new Game(gameContainer);
game.initializeLevelAndStart();
game.setGameStatus(Verdict.INTRO);


/*
 * add review form initializing
 */

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


/*
 * reviews initializing
 */

/** @constant {string} */
var REVIEWS_LOAD_URL = '//o0.github.io/assets/json/reviews.json';
loadReviews(REVIEWS_LOAD_URL, reviews.setReviews);


/*
 * gallery initializing
 */

var photoGallery = document.querySelector('.photogallery'),
  photoGalleryScreenshots = photoGallery.querySelectorAll('img');  // NodeList

/**
 * @type {Array.<strings>}
 */
var photos = gallery.savePhotos(photoGalleryScreenshots);

var photoGalleryOnClick = function(evt) {
  if (utils.hasAncestorWithClass(evt.target, 'photogallery-image')) {
    evt.preventDefault();
    //game.pauseLevel();
    gallery.showGallery(photos.indexOf(evt.target.src || evt.target.querySelector('img').src));
  }
};

var photoGalleryOnKeyDown = function(evt) {
  if (utils.hasAncestorWithClass(evt.target, 'photogallery-image') &&
  utils.isActivationEvent(evt)) {
    evt.preventDefault();
    //game.pauseLevel();
    gallery.showGallery(photos.indexOf(evt.target.querySelector('img').src));
  }
};

photoGallery.addEventListener('click', photoGalleryOnClick);  // вешаем делегированный обработчик клика по фото на контейнер с фотографиями
photoGallery.addEventListener('keydown', photoGalleryOnKeyDown);  // вешаем делегированный обработчик нажатия клавиши при фокусе на фото, на контейнер с фотографиями
