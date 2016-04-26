'use strict';

var browserCookies = require('browser-cookies');
var utils = require('../../utils/utils');
var checkFields = require('./check_fields');

var formContainer = document.querySelector('.overlay-container'),
  form = formContainer.querySelector('form.review-form'),
  formCloseButton = document.querySelector('.review-form-close'),
  formSubmitButton = form.querySelector('.review-submit'),
  formFields = form.querySelectorAll('#review-name, #review-text'),  // NodeList
  reviewMarks = form.querySelectorAll('input[name=review-mark]'),  // NodeList
  reviewMarksLabels = form.querySelectorAll('.review-mark-label'),
  reviewerName = form.querySelector('#review-name'),
  reviewFields = form.querySelector('.review-fields'),
  reviewMark = 3;

reviewFields.classList.add(utils.HIDDEN_CLASS_NAME);  // чтобы до начала ввода, при отсутствии куков - подсказки не появлялись
reviewerName.value = browserCookies.get('reviewerName') || '';

if (browserCookies.get('reviewMark')) {
  reviewMark = browserCookies.get('reviewMark');
  utils.forEachNode(reviewMarks, function(index, node) {
    if (node.value === String(reviewMark)) {
      node.checked = true;
    }
  });
}

if (browserCookies.get('reviewMark') || browserCookies.get('reviewerName')) {
  checkFields(reviewMark);
}

/**
 * Отображает форму, навешивает обработчики на кнопки
 */
var showForm = function() {
  document.addEventListener('keydown', _onDocumentKeyDown);  // вешаем обработчик нажатия клавиши ESC на документ
  formCloseButton.addEventListener('click', _onFormCloseButtonClick);
  formCloseButton.addEventListener('keydown', _onFormCloseButtonKeyDown);
  formContainer.classList.remove(utils.HIDDEN_CLASS_NAME);
};

/**
 * Скрывает форму, снимает обработчики
 * @private
 */
var _hideForm = function() {
  document.removeEventListener('keydown', _onDocumentKeyDown);  // вешаем обработчик нажатия клавиши ESC на документ
  formCloseButton.removeEventListener('click', _onFormCloseButtonClick);
  formCloseButton.removeEventListener('keydown', _onFormCloseButtonKeyDown);
  formContainer.classList.add(utils.HIDDEN_CLASS_NAME);
};

/**
 * Проверяет, открыта ли форма
 * @private
 */
var _isFormShown = function() {
  if (formContainer.classList.contains(utils.HIDDEN_CLASS_NAME)) {
    return false;
  }
  return true;
};

/**
 * @param {KeyboardEvent} evt
 * @private
 */
var _onDocumentKeyDown = function(evt) {
  if (_isFormShown() && utils.isDeactivationEvent(evt)) {
    evt.preventDefault();
    _hideForm();
  }
};

/**
 * @param {MouseEvent} evt
 * @private
 */
var _onFormCloseButtonClick = function(evt) {
  evt.preventDefault();
  _hideForm();
};

/**
 * @param {KeyboardEvent} evt
 * @private
 */
var _onFormCloseButtonKeyDown = function(evt) {
  if (utils.isActivationEvent(evt)) {
    evt.preventDefault();
    _hideForm();
  }
};

// переписать с использованием делегирования
utils.forEachNode(formFields, function(index, node) {
  node.oninput = function() {
    checkFields(reviewMark);
  };
});

// переписать с использованием делегирования
utils.forEachNode(reviewMarks, function(index, node) {
  node.onchange = function() {
    checkFields(reviewMark);
  };
});

// переписать с использованием делегирования
utils.forEachNode(reviewMarksLabels, function(index, node) {
  node.onkeydown = function(evt) {
    if (utils.isActivationEvent(evt)) {
      evt.preventDefault();
      document.querySelector('#' + evt.target.getAttribute('for')).checked = true;
      checkFields(reviewMark);
    }
  };
});

/**
 * Функция подсчета времени жизни куки от месяца и дня рождения
 * @param {number} birthMonth
 * @param {number} birthDay
 * @private
 * @return {Date}
 */
var _getExpiringDate = function(birthMonth, birthDay) {
  if (birthMonth > 12 || birthMonth < 1 || birthDay > 31 || birthDay < 1) {
    console.log(Error('Please, enter valid month and date!'));
    return false;
  }
  var now = new Date(),
    nowMS = now.valueOf(),
    thisYearBirthdayMS = now.setMonth(birthMonth - 1, birthDay),
    expiresLengthMS = 0,
    expiresDateMS = 0,
    expiresDate = 0;

  if (nowMS > thisYearBirthdayMS) {  // если день рождения был в этом году
    expiresLengthMS = nowMS - thisYearBirthdayMS;
  } else if (nowMS < thisYearBirthdayMS) {  // если день рождения был в прошлом году
    var lastYear = now.getFullYear() - 1;
    var lastYearBirthdayMS = now.setYear(lastYear, birthMonth - 1, birthDay);
    expiresLengthMS = nowMS - lastYearBirthdayMS;
  } else {  // если сегодня день рождения - ставим куки на год
    expiresLengthMS = 365 * 24 * 3600 * 1000;
  }

  expiresDateMS = Date.now() + expiresLengthMS;
  expiresDate = new Date(expiresDateMS);

  return expiresDate;
};

/**
 * Функция вызываемая непосредственно перед отправкой формы
 * @param {submit} evt
 * @private
 */
var _preSubmit = function(evt) {
  if (!checkFields(reviewMark)) {
    evt.preventDefault();  // блокируем отправку формы, если проверка не пройдена
  }

  var expiresDate = _getExpiringDate(7, 5);
  browserCookies.set('reviewerName', reviewerName.value, {expires: expiresDate});
  browserCookies.set('reviewMark', String(reviewMark), {expires: expiresDate});
};

/**
 * обработчик нажатия клавиш, при фокусе на кнопке отправки формы
 * @param {KeyboardEvent} evt [description]
 * @private
 */
var _onFormSubmitButtonKeyDown = function(evt) {
  if (utils.isActivationEvent(evt)) {
    evt.preventDefault();
    _preSubmit();
    form.submit();
  }
};

form.addEventListener('submit', _preSubmit);
formSubmitButton.addEventListener('keydown', _onFormSubmitButtonKeyDown);

module.exports = {
  showForm: showForm
};
