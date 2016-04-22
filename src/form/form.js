'use strict';

var browserCookies = require('browser-cookies');
var utils = require('../utils/utils');
var checkFields = require('./check_fields');

var formContainer = document.querySelector('.overlay-container'),
  form = formContainer.querySelector('form.review-form'),
  formOpenButton = document.querySelector('.reviews-controls-new'),
  formCloseButton = document.querySelector('.review-form-close'),
  formSubmitButton = form.querySelector('.review-submit'),
  formFields = form.querySelectorAll('#review-name, #review-text'),  // NodeList
  reviewMarks = form.querySelectorAll('input[name=review-mark]'),  // NodeList
  reviewMarksLabels = form.querySelectorAll('.review-mark-label'),
  reviewerName = form.querySelector('#review-name'),
  reviewFields = form.querySelector('.review-fields'),
  reviewMark = 3;

/**
 * @param {MouseEvent} evt [description]
 */
formOpenButton.onclick = function(evt) {
  evt.preventDefault();
  formContainer.classList.remove(utils.HIDDEN_CLASS_NAME);
};

/**
 * @param {KeyboardEvent} evt [description]
 */
formOpenButton.onkeydown = function(evt) {
  if (utils.isActivationEvent(evt)) {
    evt.preventDefault();
    formContainer.classList.remove(utils.HIDDEN_CLASS_NAME);
  }
};

/**
 * @param {MouseEvent} evt [description]
 */
formCloseButton.onclick = function(evt) {
  evt.preventDefault();
  formContainer.classList.add(utils.HIDDEN_CLASS_NAME);
};

/**
 * @param {KeyboardEvent} evt [description]
 */
formCloseButton.onkeydown = function(evt) {
  if (utils.isActivationEvent(evt)) {
    evt.preventDefault();
    formContainer.classList.add(utils.HIDDEN_CLASS_NAME);
  }
};

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

utils.forEachNode(formFields, function(index, node) {
  node.oninput = function() {
    checkFields(reviewMark);
  };
});

utils.forEachNode(reviewMarks, function(index, node) {
  node.onchange = function() {
    checkFields(reviewMark);
  };
});

utils.forEachNode(reviewMarksLabels, function(index, node) {
  node.onkeydown = function(evt) {
    if (utils.isActivationEvent(evt)) {
      document.querySelector('#' + evt.target.getAttribute('for')).checked = true;
      checkFields(reviewMark);
    }
  };
});

var preSubmit = function(evt) {
  if (!checkFields(reviewMark)) {
    evt.preventDefault();  // блокируем отправку формы, если проверка не пройдена
  }

  var now = new Date(),
    nowMS = now.valueOf(),
    thisYearBirthdayMS = now.setMonth(7 - 1, 5),
    expiresLengthMS = 0,
    expiresDateMS = 0,
    expiresDate = null;

  if (nowMS > thisYearBirthdayMS) {  // если день рождения был в этом году
    expiresLengthMS = nowMS - thisYearBirthdayMS;
  } else if (nowMS < thisYearBirthdayMS) {  // если день рождения был в прошлом году
    var lastYear = now.getFullYear() - 1;
    var lastYearBirthdayMS = now.setYear(lastYear, 7 - 1, 5);
    expiresLengthMS = nowMS - lastYearBirthdayMS;
  } else {  // если сегодня день рождения - ставим куки на год
    expiresLengthMS = 365 * 24 * 3600 * 1000;
  }
  expiresDateMS = Date.now() + expiresLengthMS;
  expiresDate = new Date(expiresDateMS);
  browserCookies.set('reviewerName', reviewerName.value, {expires: expiresDate});
  browserCookies.set('reviewMark', String(reviewMark), {expires: expiresDate});
};

form.onsubmit = preSubmit;

/**
 * @param {KeyboardEvent} evt [description]
 */
formSubmitButton.onkeydown = function(evt) {
  if (utils.isActivationEvent(evt)) {
    preSubmit();
    form.submit();
  }
};
