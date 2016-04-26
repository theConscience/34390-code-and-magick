'use strict';

var utils = require('../utils/utils');

/**
 * @constructor
 */
var Gallery = function() {
  this.galleryOverlay = document.querySelector('.overlay-gallery');
  this.galleryClose = this.galleryOverlay.querySelector('.overlay-gallery-close');
  this.galleryControlLeft = this.galleryOverlay.querySelector('.overlay-gallery-control-left');
  this.galleryControlRight = this.galleryOverlay.querySelector('.overlay-gallery-control-right');
  this.galleryPreview = this.galleryOverlay.querySelector('.overlay-gallery-preview');
  this.galleryPreviewNumber = this.galleryOverlay.querySelector('.overlay-gallery-preview-number');
  this.galleryPreviewNumberCurrent = this.galleryPreviewNumber.querySelector('.preview-number-current');
  this.galleryPreviewNumberTotal = this.galleryPreviewNumber.querySelector('.preview-number-total');

  /**
   * @type {Array.<strings>}
   */
  this.photos = [];

  /**
   * @type {string}
   */
  this.activePhoto = '';

  /**
   * @const {number}
   */
  this.PREVIEW_TIMEOUT = 10000;

  /**
   * @type {number}
   */
  this.previewLoadTimeout = null;

  var self = this;

  /**
   * Сохраняет значения атрибута src из всех картинок в блоке .photogallery в массив строк, возвращает его
   * @param {Array.<objects>} photos
   * @return {Array.<strings>}
   */
  this.savePhotos = function(photosObjects) {
    utils.forEachNode(photosObjects, function(index, node) {
      self.photos[index] = node.src;
    });
    self.galleryPreviewNumberTotal.textContent = self.photos.length;
    return self.photos;
  };

  /**
   * Отображает внутри фотогалереи изображение по номеру
   * @param {number} photoNumber
   * @private
   */
  this._showPhoto = function(photoNumber) {
    if (photoNumber > -1) {
      self.galleryPreviewNumberCurrent.textContent = photoNumber + 1;

      if (photoNumber === 0) {  // скрываем соответствующие стрелки, если больше нечего показывать
        self.galleryControlLeft.classList.add(utils.HIDDEN_CLASS_NAME);
      } else if (photoNumber >= self.photos.length - 1) {
        self.galleryControlRight.classList.add(utils.HIDDEN_CLASS_NAME);
      }

      if (photoNumber !== 0 &&  // показываем стрелку влево, если была скрыта
      self.galleryControlLeft.classList.contains(utils.HIDDEN_CLASS_NAME)) {
        self.galleryControlLeft.classList.remove(utils.HIDDEN_CLASS_NAME);
      }
      if (photoNumber < self.photos.length - 1 &&  // показываем стрелку вправо, если была скрыта
      self.galleryControlRight.classList.contains(utils.HIDDEN_CLASS_NAME)) {
        self.galleryControlRight.classList.remove(utils.HIDDEN_CLASS_NAME);
      }

      if (self.galleryPreview.querySelector('img') !== null) {  // если внутри галереи уже загружена картинка - убираем
        self.galleryPreview.removeChild(self.galleryPreview.querySelector('img'));
      }

      var preview = new Image();

      preview.addEventListener('load', function() {
        clearTimeout(self.previewLoadTimeout);
        self.galleryPreview.appendChild(preview);
      });

      preview.addEventListener('error', function() {
        console.log(Error('Can not load photo!'));
      });

      self.previewLoadTimeout = setTimeout(function() {
        preview.src = '';
        console.log(Error('Preview loading stops on timeout!'));
      }, self.PREVIEW_TIMEOUT);

      preview.src = self.activePhoto = self.photos[photoNumber];
    } else {
      console.log(Error('No such photo!'));
    }
  };

  /**
   * Проверяет, открыта ли галерея
   * @private
   */
  this._isGalleryShown = function() {
    if (self.galleryOverlay.classList.contains(utils.HIDDEN_CLASS_NAME)) {
      return false;
    }
    return true;
  };

  /**
   * @param {KeyboardsEvent} evt
   * @private
   */
  this._onDocumentKeyDown = function(evt) {
    if (self._isGalleryShown()) {
      if (utils.isDeactivationEvent(evt)) {
        evt.preventDefault();
        self.hideGallery();
      } else if (utils.isPreviousEvent(evt)) {
        self.galleryControlLeft.click();
      } else if (utils.isNextEvent(evt)) {
        self.galleryControlRight.click();
      }
    }
  };

  /**
   * @param {MouseEvent} evt
   * @private
   */
  this._onCloseClick = function(evt) {
    if (evt.type === 'click') {
      evt.preventDefault();
      self.hideGallery();
    }
  };

  /**
   * @param {KeyboardsEvent} evt
   * @private
   */
  this._onCloseKeydown = function(evt) {
    if (evt.type === 'keydown' &&
    utils.isActivationEvent(evt)) {
      evt.preventDefault();
      self.hideGallery();
    }
  };

  /**
   * @param {Event} evt
   * @private
   */
  this._toPreviousPhoto = function(evt) {
    if (evt.type === 'click' ||
    evt.type === 'keydown' && utils.isActivationEvent(evt)) {
      evt.preventDefault();
      if (self.photos.indexOf(self.activePhoto) === 0) {
        return;
      }
      self._showPhoto(self.photos.indexOf(self.activePhoto) - 1);
    }
  };

  /**
   * @param {Event} evt
   * @private
   */
  this._toNextPhoto = function(evt) {
    if (evt.type === 'click' ||
    evt.type === 'keydown' && utils.isActivationEvent(evt)) {
      evt.preventDefault();
      if (self.photos.indexOf(self.activePhoto) === self.photos.length - 1) {
        return;
      }
      self._showPhoto(self.photos.indexOf(self.activePhoto) + 1);
    }
  };

  /**
   * Отображает фотогалерею, навешивает обработчики на кнопки
   * @param {number} photoNumber
   */
  this.showGallery = function(photoNumber) {
    self._showPhoto(photoNumber);
    self.galleryOverlay.classList.remove(utils.HIDDEN_CLASS_NAME);
    document.addEventListener('keydown', self._onDocumentKeyDown);  // вешаем обработчик нажатия клавиши ESC на документ
    self.galleryClose.addEventListener('click', self._onCloseClick);  // вешаем обработчик клика по кнопке закрытия
    self.galleryClose.addEventListener('keydown', self._onCloseKeydown);  // вешаем обработчик нажатия клавиши по кнопке закрытия
    self.galleryControlLeft.addEventListener('click', self._toPreviousPhoto);  // вешаем обработчик клика по левому переключателю в галерее
    self.galleryControlLeft.addEventListener('keydown', self._toPreviousPhoto);  // вешаем обработчик нажатия клавиши по левому переключателю в галерее
    self.galleryControlRight.addEventListener('click', self._toNextPhoto);  // вешаем обработчик клика по правому переключателю в галерее
    self.galleryControlRight.addEventListener('keydown', self._toNextPhoto);  // вешаем обработчик нажатия клавиши по правому переключателю в галерее
  };

  /**
   * Скрывает фотогалерею, снимает обработчики с кнопок
   */
  this.hideGallery = function() {
    self.galleryOverlay.classList.add(utils.HIDDEN_CLASS_NAME);
    document.removeEventListener('keydown', self._onDocumentKeyDown);  // снимаем обработчик нажатия клавиши ESC на документ
    self.galleryClose.removeEventListener('click', self._onCloseClick);  // снимаем обработчик клика по кнопке закрытия
    self.galleryClose.removeEventListener('keydown', self._onCloseKeydown);  // снимаем обработчик нажатия клавиши по кнопке закрытия
    self.galleryControlLeft.removeEventListener('click', self._toPreviousPhoto);  // снимаем обработчик клика по левому переключателю в галерее
    self.galleryControlLeft.removeEventListener('keydown', self._toPreviousPhoto);  // снимаем обработчик нажатия клавиши по левому переключателю в галерее
    self.galleryControlRight.removeEventListener('click', self._toNextPhoto);  // снимаем обработчик клика по правому переключателю в галерее
    self.galleryControlRight.removeEventListener('keydown', self._toNextPhoto);  // снимаем обработчик нажатия клавиши по правому переключателю в галерее
  };
};

var gallery = new Gallery();

module.exports = gallery;
