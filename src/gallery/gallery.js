'use strict';

var utils = require('../utils/utils');

var galleryOverlay = document.querySelector('.overlay-gallery'),
  galleryClose = galleryOverlay.querySelector('.overlay-gallery-close'),
  galleryControlLeft = galleryOverlay.querySelector('.overlay-gallery-control-left'),
  galleryControlRight = galleryOverlay.querySelector('.overlay-gallery-control-right'),
  galleryPreview = galleryOverlay.querySelector('.overlay-gallery-preview'),
  galleryPreviewNumber = galleryOverlay.querySelector('.overlay-gallery-preview-number'),
  galleryPreviewNumberCurrent = galleryPreviewNumber.querySelector('.preview-number-current'),
  galleryPreviewNumberTotal = galleryPreviewNumber.querySelector('.preview-number-total');

/**
 * @type {Array.<strings>}
 */
var photos = [];

/**
 * @type {string}
 */
var activePhoto = '';

/**
 * @const {number}
 */
var PREVIEW_TIMEOUT = 10000;

/**
 * @type {number}
 */
var previewLoadTimeout = null;

/**
 * Сохраняет значения атрибута src из всех картинок в блоке .photogallery в массив строк, возвращает его
 * @param {Array.<objects>} photos
 * @return {Array.<strings>}
 */
var savePhotos = function(photosObjects) {
  utils.forEachNode(photosObjects, function(index, node) {
    photos[index] = node.src;
  });
  galleryPreviewNumberTotal.textContent = photos.length;
  return photos;
};

/**
 * Отображает внутри фотогалереи изображение по номеру
 * @param {number} photoNumber
 * @private
 */
var _showPhoto = function(photoNumber) {
  if (photoNumber > -1) {
    galleryPreviewNumberCurrent.textContent = photoNumber + 1;

    if (photoNumber === 0) {  // скрываем соответствующие стрелки, если больше нечего показывать
      galleryControlLeft.classList.add(utils.HIDDEN_CLASS_NAME);
    } else if (photoNumber >= photos.length - 1) {
      galleryControlRight.classList.add(utils.HIDDEN_CLASS_NAME);
    }

    if (photoNumber !== 0 &&  // показываем стрелку влево, если была скрыта
    galleryControlLeft.classList.contains(utils.HIDDEN_CLASS_NAME)) {
      galleryControlLeft.classList.remove(utils.HIDDEN_CLASS_NAME);
    }
    if (photoNumber < photos.length - 1 &&  // показываем стрелку вправо, если была скрыта
    galleryControlRight.classList.contains(utils.HIDDEN_CLASS_NAME)) {
      galleryControlRight.classList.remove(utils.HIDDEN_CLASS_NAME);
    }

    if (galleryPreview.querySelector('img') !== null) {  // если внутри галереи уже загружена картинка - убираем
      galleryPreview.removeChild(galleryPreview.querySelector('img'));
    }

    var preview = new Image();

    preview.addEventListener('load', function() {
      clearTimeout(previewLoadTimeout);
      galleryPreview.appendChild(preview);
    });

    preview.addEventListener('error', function() {
      console.log(Error('Can not load photo!'));
    });

    previewLoadTimeout = setTimeout(function() {
      preview.src = '';
      console.log(Error('Preview loading stops on timeout!'));
    }, PREVIEW_TIMEOUT);

    preview.src = activePhoto = photos[photoNumber];
  } else {
    console.log(Error('No such photo!'));
  }
};

/**
 * Проверяет, открыта ли галерея
 * @private
 */
var _isGalleryShown = function() {
  if (galleryOverlay.classList.contains(utils.HIDDEN_CLASS_NAME)) {
    return false;
  }
  return true;
};

/**
 * @param {KeyboardsEvent} evt
 * @private
 */
var _onDocumentKeyDown = function(evt) {
  if (_isGalleryShown()) {
    if (utils.isDeactivationEvent(evt)) {
      evt.preventDefault();
      hideGallery();
    } else if (utils.isPreviousEvent(evt)) {
      galleryControlLeft.click();
    } else if (utils.isNextEvent(evt)) {
      galleryControlRight.click();
    }
  }
};

/**
 * @param {MouseEvent} evt
 * @private
 */
var _onCloseClick = function(evt) {
  if (evt.type === 'click') {
    evt.preventDefault();
    hideGallery();
  }
};

/**
 * @param {KeyboardsEvent} evt
 * @private
 */
var _onCloseKeydown = function(evt) {
  if (evt.type === 'keydown' &&
  utils.isActivationEvent(evt)) {
    evt.preventDefault();
    hideGallery();
  }
};

/**
 * @param {Event} evt
 * @private
 */
var _toPreviousPhoto = function(evt) {
  if (evt.type === 'click' ||
  evt.type === 'keydown' && utils.isActivationEvent(evt)) {
    evt.preventDefault();
    if (photos.indexOf(activePhoto) === 0) {
      return;
    }
    _showPhoto(photos.indexOf(activePhoto) - 1);
  }
};

/**
 * @param {Event} evt
 * @private
 */
var _toNextPhoto = function(evt) {
  if (evt.type === 'click' ||
  evt.type === 'keydown' && utils.isActivationEvent(evt)) {
    evt.preventDefault();
    if (photos.indexOf(activePhoto) === photos.length - 1) {
      return;
    }
    _showPhoto(photos.indexOf(activePhoto) + 1);
  }
};

/**
 * Отображает фотогалерею, навешивает обработчики на кнопки
 * @param {number} photoNumber
 */
var showGallery = function(photoNumber) {
  _showPhoto(photoNumber);
  galleryOverlay.classList.remove(utils.HIDDEN_CLASS_NAME);
  document.addEventListener('keydown', _onDocumentKeyDown);  // вешаем обработчик нажатия клавиши ESC на документ
  galleryClose.addEventListener('click', _onCloseClick);  // вешаем обработчик клика по кнопке закрытия
  galleryClose.addEventListener('keydown', _onCloseKeydown);  // вешаем обработчик нажатия клавиши по кнопке закрытия
  galleryControlLeft.addEventListener('click', _toPreviousPhoto);  // вешаем обработчик клика по левому переключателю в галерее
  galleryControlLeft.addEventListener('keydown', _toPreviousPhoto);  // вешаем обработчик нажатия клавиши по левому переключателю в галерее
  galleryControlRight.addEventListener('click', _toNextPhoto);  // вешаем обработчик клика по правому переключателю в галерее
  galleryControlRight.addEventListener('keydown', _toNextPhoto);  // вешаем обработчик нажатия клавиши по правому переключателю в галерее
};

/**
 * Скрывает фотогалерею, снимает обработчики с кнопок
 */
var hideGallery = function() {
  galleryOverlay.classList.add(utils.HIDDEN_CLASS_NAME);
  document.removeEventListener('keydown', _onDocumentKeyDown);  // снимаем обработчик нажатия клавиши ESC на документ
  galleryClose.removeEventListener('click', _onCloseClick);  // снимаем обработчик клика по кнопке закрытия
  galleryClose.removeEventListener('keydown', _onCloseKeydown);  // снимаем обработчик нажатия клавиши по кнопке закрытия
  galleryControlLeft.removeEventListener('click', _toPreviousPhoto);  // снимаем обработчик клика по левому переключателю в галерее
  galleryControlLeft.removeEventListener('keydown', _toPreviousPhoto);  // снимаем обработчик нажатия клавиши по левому переключателю в галерее
  galleryControlRight.removeEventListener('click', _toNextPhoto);  // снимаем обработчик клика по правому переключателю в галерее
  galleryControlRight.removeEventListener('keydown', _toNextPhoto);  // снимаем обработчик нажатия клавиши по правому переключателю в галерее
};

module.exports = {
  savePhotos: savePhotos,
  showGallery: showGallery
};
