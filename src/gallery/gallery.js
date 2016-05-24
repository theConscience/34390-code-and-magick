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

  /** @type {Array.<strings>} */
  this.photos = [];

  /** @type {Array.<strings>} */
  this.photosAbsPathsPrefixes = [];

  /** @type {string} */
  this.activePhoto = '';

  /**  @const {number} */
  this.PREVIEW_TIMEOUT = 10000;

  /**  @type {number} */
  this.previewLoadTimeout = null;

  /**  @type {RegExp} */
  this.hashRegExp = /#photo\/(\S+)/;

  /** @type {HTMLElement} */
  this.galleryElement = null;

  /** @type {string} */
  this.newSrc = null;

  /** @type {string} */
  this.newSrcData = [];

  /** @type {string} */
  this.newHash = null;

  /**
   * Webpack меняет пути к картинкам на абсолютные, поэтому в массив photos попадают абсолютные пути
   * эта регулярка используется для отделения относительной части
   * @type {RegExp}
   */
  this.photoRelPathPrefixRegExp = /(img\/\S+)/;

  this._isGalleryShown = this._isGalleryShown.bind(this);

  this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);

  this._onCloseClick = this._onCloseClick.bind(this);

  this._onCloseKeydown = this._onCloseKeydown.bind(this);

  this._toPreviousPhoto = this._toPreviousPhoto.bind(this);

  this._toNextPhoto = this._toNextPhoto.bind(this);

  this._onHashChange = this._onHashChange.bind(this);

  this._onLoadHashCheck = this._onLoadHashCheck.bind(this);

  /**
   * Функция, переключающая фотогалерею
   * @param {Event} evt
   * @private
   */
  this._photoGalleryChange = function(evt) {
    evt.preventDefault();
    this.newSrc = evt.target.src || evt.target.querySelector('img').src;
    this.newSrcData = this.newSrc.match(this.hashRegExp) || this.newSrc.match(this.photoRelPathPrefixRegExp);
    this.newHash = '#photo/' + this.newSrcData[1];
    window.location.hash = this.newHash;
  };

  this._photoGalleryOnClick = this._photoGalleryOnClick.bind(this);

  this._photoGalleryOnKeyDown = this._photoGalleryOnKeyDown.bind(this);

  this.initialize = function(galleryElement) {
    this.galleryElement = galleryElement || this.galleryElement;
    this.galleryElement.addEventListener('click', this._photoGalleryOnClick);  // вешаем делегированный обработчик клика по фото на контейнер с фотографиями
    this.galleryElement.addEventListener('keydown', this._photoGalleryOnKeyDown);  // вешаем делегированный обработчик нажатия клавиши при фокусе на фото, на контейнер с фотографиями
    window.addEventListener('hashchange', this._onHashChange); // вешаем обработчик события изменения location.hash на window
    window.addEventListener('load', this._onLoadHashCheck); // проверяем location.hash при загрузке страницыы
  };

  this.stop = function(full) {
    if (full) {
      this.galleryElement = null;
    }
    this.galleryElement.removeEventListener('click', this._photoGalleryOnClick);  // снимаем делегированный обработчик клика по фото на контейнер с фотографиями
    this.galleryElement.removeEventListener('keydown', this._photoGalleryOnKeyDown);  // снимаем делегированный обработчик нажатия клавиши при фокусе на фото, на контейнер с фотографиями
    window.removeEventListener('hashchange', this._onHashChange); // снимаем обработчик события изменения location.hash на window
    window.removeEventListener('load', this._onLoadHashCheck); // снимаем location.hash при загрузке страницыы
  };

};

/**
 * Сохраняет относительную часть пути из значения атрибута src всех картинок
 * в блоке .photogallery в массив строк, возвращает его
 * @param {Array.<objects>} photos
 * @return {Array.<strings>}
 */
Gallery.prototype.savePhotos = function(photosObjects) {
  for (var i = 0; i < photosObjects.length; i++) {
    this.photos[i] = photosObjects[i].src.match(this.photoRelPathPrefixRegExp)[1];
  }

  this.galleryPreviewNumberTotal.textContent = this.photos.length;
  return this.photos;
};

/**
 * Отображает внутри фотогалереи изображение по номеру
 * @param {number} photoNumber
 */
Gallery.prototype.showPhoto = function(photoIdentifier) {
  var photoNumber = null;
  var photoSrc = '';

  if (typeof photoIdentifier === 'string') {
    photoSrc = photoIdentifier.match(this.hashRegExp)[1];
    photoNumber = this.photos.indexOf(photoSrc);
  } else if (typeof photoIdentifier === 'number') {
    photoNumber = photoIdentifier;
  }

  if (photoNumber > -1) {
    this.galleryPreviewNumberCurrent.textContent = photoNumber + 1;

    if (photoNumber === 0) {  // скрываем соответствующие стрелки, если больше нечего показывать
      this.galleryControlLeft.classList.add(utils.HIDDEN_CLASS_NAME);
    } else if (photoNumber >= this.photos.length - 1) {
      this.galleryControlRight.classList.add(utils.HIDDEN_CLASS_NAME);
    }

    if (photoNumber !== 0 &&  // показываем стрелку влево, если была скрыта
        this.galleryControlLeft.classList.contains(utils.HIDDEN_CLASS_NAME)) {
      this.galleryControlLeft.classList.remove(utils.HIDDEN_CLASS_NAME);
    }
    if (photoNumber < this.photos.length - 1 &&  // показываем стрелку вправо, если была скрыта
        this.galleryControlRight.classList.contains(utils.HIDDEN_CLASS_NAME)) {
      this.galleryControlRight.classList.remove(utils.HIDDEN_CLASS_NAME);
    }

    if (this.galleryPreview.querySelector('img') !== null) {  // если внутри галереи уже загружена картинка - убираем
      this.galleryPreview.removeChild(this.galleryPreview.querySelector('img'));
    }

    var preview = new Image();

    var onPreviewLoad = function() {
      clearTimeout(this.previewLoadTimeout);
      this.galleryPreview.appendChild(preview);
    };

    preview.addEventListener('load', onPreviewLoad.bind(this));

    preview.addEventListener('error', function() {
      console.log(Error('Can not load photo!'));
    });

    this.previewLoadTimeout = setTimeout(function() {
      preview.src = '';
      console.log(Error('Preview loading stops on timeout!'));
    }, this.PREVIEW_TIMEOUT);

    preview.src = this.activePhoto = this.photos[photoNumber];
  } else {
    console.log(Error('No such photo!'));
  }
};

/**
 * Проверяет, открыта ли галерея
 * @private
 */
Gallery.prototype._isGalleryShown = function() {
  if (this.galleryOverlay.classList.contains(utils.HIDDEN_CLASS_NAME)) {
    return false;
  }
  return true;
};

/**
 * @param {KeyboardsEvent} evt
 * @private
 */
Gallery.prototype._onDocumentKeyDown = function(evt) {
  if (this._isGalleryShown()) {
    if (utils.isDeactivationEvent(evt)) {
      evt.preventDefault();
      this.hideGallery();
    } else if (utils.isPreviousEvent(evt)) {
      this.galleryControlLeft.click();
    } else if (utils.isNextEvent(evt)) {
      this.galleryControlRight.click();
    }
  }
};

/**
 * @param {MouseEvent} evt
 * @private
 */
Gallery.prototype._onCloseClick = function(evt) {
  if (evt.type === 'click') {
    evt.preventDefault();
    this.hideGallery();
  }
};

/**
 * @param {KeyboardsEvent} evt
 * @private
 */
Gallery.prototype._onCloseKeydown = function(evt) {
  if (evt.type === 'keydown' &&
      utils.isActivationEvent(evt)) {
    evt.preventDefault();
    this.hideGallery();
  }
};

/**
 * @param {Event} evt
 * @private
 */
Gallery.prototype._toPreviousPhoto = function(evt) {
  if (evt.type === 'click' ||
      evt.type === 'keydown' && utils.isActivationEvent(evt)) {
    evt.preventDefault();
    if (this.photos.indexOf(this.activePhoto) === 0) {
      return;
    }

    var activePhotoNumber = this.photos.indexOf(this.activePhoto) - 1;
    var newPhotoSrc = this.photos[activePhotoNumber];
    window.location.hash = '#photo/' + newPhotoSrc;
  }
};

/**
 * @param {Event} evt
 * @private
 */
Gallery.prototype._toNextPhoto = function(evt) {
  if (evt.type === 'click' ||
      evt.type === 'keydown' && utils.isActivationEvent(evt)) {
    evt.preventDefault();
    if (this.photos.indexOf(this.activePhoto) === this.photos.length - 1) {
      return;
    }

    var activePhotoNumber = this.photos.indexOf(this.activePhoto) + 1;
    var newPhotoSrc = this.photos[activePhotoNumber];
    window.location.hash = '#photo/' + newPhotoSrc;
  }
};

/**
 * Отображает фотогалерею, навешивает обработчики на кнопки
 * @param {number} photoNumber
 */
Gallery.prototype.showGallery = function(photoIdentifier) {
  this.showPhoto(photoIdentifier);
  this.galleryOverlay.classList.remove(utils.HIDDEN_CLASS_NAME);
  document.addEventListener('keydown', this._onDocumentKeyDown);  // вешаем обработчик нажатия клавиши ESC на документ
  this.galleryClose.addEventListener('click', this._onCloseClick);  // вешаем обработчик клика по кнопке закрытия
  this.galleryClose.addEventListener('keydown', this._onCloseKeydown);  // вешаем обработчик нажатия клавиши по кнопке закрытия
  this.galleryControlLeft.addEventListener('click', this._toPreviousPhoto);  // вешаем обработчик клика по левому переключателю в галерее
  this.galleryControlLeft.addEventListener('keydown', this._toPreviousPhoto);  // вешаем обработчик нажатия клавиши по левому переключателю в галерее
  this.galleryControlRight.addEventListener('click', this._toNextPhoto);  // вешаем обработчик клика по правому переключателю в галерее
  this.galleryControlRight.addEventListener('keydown', this._toNextPhoto);  // вешаем обработчик нажатия клавиши по правому переключателю в галерее
};

/**
 * Скрывает фотогалерею, снимает обработчики с кнопок
 */
Gallery.prototype.hideGallery = function() {
  this.galleryOverlay.classList.add(utils.HIDDEN_CLASS_NAME);
  document.removeEventListener('keydown', this._onDocumentKeyDown);  // снимаем обработчик нажатия клавиши ESC на документ
  this.galleryClose.removeEventListener('click', this._onCloseClick);  // снимаем обработчик клика по кнопке закрытия
  this.galleryClose.removeEventListener('keydown', this._onCloseKeydown);  // снимаем обработчик нажатия клавиши по кнопке закрытия
  this.galleryControlLeft.removeEventListener('click', this._toPreviousPhoto);  // снимаем обработчик клика по левому переключателю в галерее
  this.galleryControlLeft.removeEventListener('keydown', this._toPreviousPhoto);  // снимаем обработчик нажатия клавиши по левому переключателю в галерее
  this.galleryControlRight.removeEventListener('click', this._toNextPhoto);  // снимаем обработчик клика по правому переключателю в галерее
  this.galleryControlRight.removeEventListener('keydown', this._toNextPhoto);  // снимаем обработчик нажатия клавиши по правому переключателю в галерее
  window.location.hash = '';
};

/**
 * Обработчик клика по фотографии
 * @param {MouseEvent} evt
 */
Gallery.prototype._photoGalleryOnClick = function(evt) {
  if (utils.hasOwnOrAncestorClass(evt.target, 'photogallery-image')) {
    this._photoGalleryChange(evt);
  }
};

/**
 * Обработчик нажатия клавиши при фокусе на фотографии
 * @param {KeyboardEvent} evt
 */
Gallery.prototype._photoGalleryOnKeyDown = function(evt) {
  if (utils.hasOwnOrAncestorClass(evt.target, 'photogallery-image') &&
      utils.isActivationEvent(evt)) {
    this._photoGalleryChange(evt);
  }
};

/**
 * Поведение галереи при изменении хэша страницы
 * @param {Event} evt
 * @private
 */
Gallery.prototype._onHashChange = function(evt) {
  var galleryHash = null;
  var galleryWasOpen = Boolean(evt.oldURL.match(this.hashRegExp));
  var galleryHashData = evt.newURL.match(this.hashRegExp);
  if (galleryHashData) {
    galleryHash = galleryHashData[0];
  }
  if (!galleryWasOpen && galleryHash) {  // если галерея закрыта и мы получили хэш - открываем галерею, а она покажет фото
    this.showGallery(galleryHash);
  } else if (galleryWasOpen && galleryHash) {  // если галерея уже открыта и мы получили хэш - просто показываем фото
    this.showPhoto(galleryHash);
  } else if (galleryWasOpen && !galleryHash) {  // если галерея уже открыта а хэш стал пустым - закрываем галерею
    this.hideGallery();
  }
};

/**
 * Проверка хэша страницы в момент загрузки
 * @private
 */
Gallery.prototype._onLoadHashCheck = function() {
  if (window.location.href.match(this.hashRegExp)) {
    var galleryHash = window.location.href.match(this.hashRegExp)[0];
    if (galleryHash) {
      this.showGallery(galleryHash);
    }
  }
};

var gallery = new Gallery();

module.exports = gallery;
