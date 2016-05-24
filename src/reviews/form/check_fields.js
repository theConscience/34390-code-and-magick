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

  /**
   * Действия выполняемые после проверки поля
   * @param {boolean} success
   * @param {HTMLElement} fieldElement
   * @param {HTMLElement} fieldErrorElement
   * @param {HTMLElement} fieldReminderElement
   * @param {string} validationText
   * @param {boolean} firstNumberCheck
   * @param {string} numberCheckValidationText
   * @private
   */
  var _onFieldCheck = function(success, fieldElement, fieldErrorElement, fieldReminderElement, validationText, firstNumberCheck, numberCheckValidationText) {
    validationText = validationText || '';
    if (firstNumberCheck) {
      if (!isNaN(parseInt(fieldElement.value, 10))) {
        fieldElement.setCustomValidity(numberCheckValidationText);
        fieldErrorElement.innerHTML = fieldElement.validationMessage;
      } else {
        fieldElement.setCustomValidity(validationText);
        fieldErrorElement.innerHTML = fieldElement.validationMessage;
      }
    } else {
      fieldElement.setCustomValidity(validationText);
      fieldErrorElement.innerHTML = fieldElement.validationMessage;
    }
    if (success) {
      fieldErrorElement.classList.add(utils.HIDDEN_CLASS_NAME);
      fieldReminderElement.classList.add(utils.HIDDEN_CLASS_NAME);
    } else {
      fieldErrorElement.classList.remove(utils.HIDDEN_CLASS_NAME);
      fieldReminderElement.classList.remove(utils.HIDDEN_CLASS_NAME);
    }
  };

  if (reviewerNameCheck) {
    _onFieldCheck(true, reviewerName, reviewerNameError, reviewFieldsName);
  } else {
    var reviewerNameEmptyText = 'Вам точно стоит это заполнить :)';
    var reviewerNameWrongText = 'Вы ввели что-то, не слишком похожее на имя... :(';
    _onFieldCheck(false, reviewerName, reviewerNameError, reviewFieldsName, reviewerNameEmptyText, true, reviewerNameWrongText);
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
    _onFieldCheck(true, reviewText, reviewTextError, reviewFieldsText);
  } else {
    var reviewEmptyText = 'Мы жаждем конструктивной критики, поэтому нам бы очень хотелось прочитать Ваш отзыв !';
    _onFieldCheck(false, reviewText, reviewTextError, reviewFieldsText, reviewEmptyText);
  }

  if (reviewerNameCheck && reviewTextCheck) {
    reviewFields.classList.add(utils.HIDDEN_CLASS_NAME);
    formSubmitButton.removeAttribute('disabled');
    return true;
  }

  reviewFields.classList.remove(utils.HIDDEN_CLASS_NAME);

  formSubmitButton.setAttribute('disabled', true);
  return false;
};

module.exports = checkFields;
