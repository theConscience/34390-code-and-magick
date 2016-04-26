'use strict';

var utils = require('../../utils/utils');

var form = document.querySelector('form.review-form');
var reviewerName = form.querySelector('#review-name');
var reviewerNameError = form.querySelector('.review-name-error');
var reviewText = form.querySelector('#review-text');
var reviewTextError = form.querySelector('.review-text-error');
var reviewFields = form.querySelector('.review-fields');
var reviewFieldsName = form.querySelector('.review-fields-name');
var reviewFieldsText = form.querySelector('.review-fields-text');
var reviewMarks = form.querySelectorAll('input[name=review-mark]');
var formSubmitButton = form.querySelector('.review-submit');

/**
 * Проверяет поля ввода.
 * @return {boolean}
 */
var checkFields = function(mark) {
  var reviewerNameCheck = !!reviewerName.value && isNaN(parseInt(reviewerName.value, 10)) || false;  // имя введено, и не начинается с цифры
  var reviewTextCheck = true;

  if (reviewerNameCheck) {
    reviewerName.setCustomValidity('');
    reviewerNameError.innerHTML = reviewerName.validationMessage;
    reviewerNameError.classList.add(utils.HIDDEN_CLASS_NAME);
    reviewFieldsName.classList.add(utils.HIDDEN_CLASS_NAME);
  } else {
    if (!isNaN(parseInt(reviewerName.value, 10))) {  // имя начинается с цифры
      reviewerName.setCustomValidity('Вы ввели что-то, не слишком похожее на имя... :(');
      reviewerNameError.innerHTML = reviewerName.validationMessage;
    } else {  // имя не введено
      reviewerName.setCustomValidity('Вам точно стоит это заполнить :)');
      reviewerNameError.innerHTML = reviewerName.validationMessage;
    }
    if (reviewerNameError.classList.contains(utils.HIDDEN_CLASS_NAME)) {
      reviewerNameError.classList.remove(utils.HIDDEN_CLASS_NAME);
    }
    if (reviewFieldsName.classList.contains(utils.HIDDEN_CLASS_NAME)) {
      reviewFieldsName.classList.remove(utils.HIDDEN_CLASS_NAME);
    }
  }

  utils.forEachNode(reviewMarks, function(index, node) {
    if (node.checked) {  // запоминаем выбранную оценку в переменную
      mark = parseInt(node.value, 10);
      document.querySelector('label[for=' + node.id + ']').setAttribute('aria-checked', 'true');
    } else {
      //node.nextElementSibling.setAttribute('aria-checked', 'false');
      document.querySelector('label[for=' + node.id + ']').setAttribute('aria-checked', 'false');
    }
  });

  if (mark < 3) {  // если оценка меньше 3 - проверяем наличие текста отзыва
    reviewTextCheck = !!reviewText.value || false;
  }

  if (reviewTextCheck) {
    reviewText.setCustomValidity('');
    reviewTextError.innerHTML = reviewText.validationMessage;
    reviewTextError.classList.add(utils.HIDDEN_CLASS_NAME);
    reviewFieldsText.classList.add(utils.HIDDEN_CLASS_NAME);
  } else {
    reviewText.setCustomValidity('Мы жаждем конструктивной критики, поэтому нам бы очень хотелось прочитать Ваш отзыв !');
    reviewTextError.innerHTML = reviewText.validationMessage;
    if (reviewTextError.classList.contains(utils.HIDDEN_CLASS_NAME)) {
      reviewTextError.classList.remove(utils.HIDDEN_CLASS_NAME);
    }
    if (reviewFieldsText.classList.contains(utils.HIDDEN_CLASS_NAME)) {
      reviewFieldsText.classList.remove(utils.HIDDEN_CLASS_NAME);
    }
  }

  if (reviewerNameCheck && reviewTextCheck) {
    reviewFields.classList.add(utils.HIDDEN_CLASS_NAME);
    formSubmitButton.removeAttribute('disabled');
    return true;
  }

  if (reviewFields.classList.contains(utils.HIDDEN_CLASS_NAME)) {
    reviewFields.classList.remove(utils.HIDDEN_CLASS_NAME);
  }

  formSubmitButton.setAttribute('disabled', true);
  return false;
};

module.exports = checkFields;
