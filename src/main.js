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

/** @type {HTMLElement} */
var gameContainer = document.querySelector('.demo');

/** @type {Game} */
var game = new Game(gameContainer);
game.initializeLevelAndStart();
game.setGameStatus(Verdict.INTRO);


/*
 * add review form initializing
 */

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


/*
 * reviews initializing
 */

/** @constant {string} */
var REVIEWS_LOAD_URL = '//o0.github.io/assets/json/reviews.json';
loadReviews(REVIEWS_LOAD_URL, reviews.setReviews);


/*
 * gallery initializing
 */

/** @type {HTMLElement} */
var photoGallery = document.querySelector('.photogallery');

/** @type {HTMLElement} */
var photoGalleryPictures = photoGallery.querySelectorAll('img');  // NodeList

/** @type {Array.<strings>} */
var photos = gallery.savePhotos(photoGalleryPictures);

/** @type {string} */
var newSrc = null;

/** @type {string} */
var newSrcData = [];

/** @type {string} */
var newHash = null;

/**
 * Обработчик клика по фотографии
 * @param {MouseEvent} evt
 */
var photoGalleryOnClick = function(evt) {
  if (utils.hasOwnOrAncestorClass(evt.target, 'photogallery-image')) {
    evt.preventDefault();
    newSrc = evt.target.src || evt.target.querySelector('img').src;
    console.log('photoGalleryOnClick newSrc =', newSrc);
    newSrcData = newSrc.match(gallery.hashRegExp) || newSrc.match(gallery.photoRelPathPrefixRegExp);
    console.log('photoGalleryOnClick newSrcData =', newSrcData);
    newHash = '#photo/' + newSrcData[1];

    window.location.hash = newHash;
    console.log('photoGalleryOnClick new window hash on click =', newHash);
    //game.pauseLevel();
    //gallery.showGallery(photos.indexOf(evt.target.src || evt.target.querySelector('img').src));
  }
};

/**
 * Обработчик нажатия клавиши при фокусе на фотографии
 * @param {KeyboardEvent} evt
 */
var photoGalleryOnKeyDown = function(evt) {
  if (utils.hasOwnOrAncestorClass(evt.target, 'photogallery-image') &&
  utils.isActivationEvent(evt)) {
    evt.preventDefault();
    newSrc = evt.target.src || evt.target.querySelector('img').src;
    console.log('photoGalleryOnKeyDown newSrc =', newSrc);
    newSrcData = newSrc.match(gallery.hashRegExp) || newSrc.match(gallery.photoRelPathPrefixRegExp);
    console.log('photoGalleryOnKeyDown newSrcData =', newSrcData);
    newHash = '#photo/' + newSrcData[1];

    window.location.hash = newHash;
    console.log('photoGalleryOnKeyDown new window hash on key down =', newHash);
    //game.pauseLevel();
    //gallery.showGallery(photos.indexOf(evt.target.querySelector('img').src));
  }
};

var onHashChange = function(evt) {
  console.log(gallery.photos);
  console.log(photos);
  var galleryWasOpen = Boolean(evt.oldURL.match(gallery.hashRegExp));
  console.log('onHashChange galleryWasOpen =', galleryWasOpen);
  console.log('onHashChange  evt.newURL =', evt.newURL);
  console.log('onHashChange evt.newURL.match(gallery.hashRegExp)', evt.newURL.match(gallery.hashRegExp));
  var galleryHash = evt.newURL.match(gallery.hashRegExp)[0];
  console.log('onHashChange galleryHash', galleryHash);
  console.log('onHashChange location hash was changed to', evt.newURL);
  if (galleryHash) {
    gallery.showGallery(galleryHash);
  } else if (galleryWasOpen && !galleryHash) {
    gallery.hideGallery();
  }
};

var onWindowLoad = function() {
  console.log('onWindowLoad  window.location =', window.location);
  console.log('onWindowLoad window.location.href.match(gallery.hashRegExp)', window.location.href.match(gallery.hashRegExp));
  if (window.location.href.match(gallery.hashRegExp)) {
    var galleryHash = window.location.href.match(gallery.hashRegExp)[0];
    console.log('onWindowLoad galleryHash', galleryHash);
    if (galleryHash) {
      gallery.showGallery(galleryHash);
    }
  }
};

photoGallery.addEventListener('click', photoGalleryOnClick);  // вешаем делегированный обработчик клика по фото на контейнер с фотографиями
photoGallery.addEventListener('keydown', photoGalleryOnKeyDown);  // вешаем делегированный обработчик нажатия клавиши при фокусе на фото, на контейнер с фотографиями
window.addEventListener('hashchange', onHashChange); // вешаем обработчик события изменения location.hash на window
window.addEventListener('load', onWindowLoad); // проверяем location.hash при загрузке страницыы
