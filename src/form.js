'use strict';

var browserCookies = require('browser-cookies');

(function() {
  var formContainer = document.querySelector('.overlay-container');
  var form = formContainer.querySelector('form.review-form');
  var formOpenButton = document.querySelector('.reviews-controls-new');
  var formCloseButton = document.querySelector('.review-form-close');
  var formSubmitButton = form.querySelector('.review-submit');
  var formFields = form.querySelectorAll('#review-name, #review-text');  // NodeList
  var reviewMarks = form.querySelectorAll('input[name=review-mark]');  // NodeList
  var reviewerName = form.querySelector('#review-name');
  var reviewerNameError = form.querySelector('.review-name-error');
  var reviewText = form.querySelector('#review-text');
  var reviewTextError = form.querySelector('.review-text-error');
  var reviewFields = form.querySelector('.review-fields');
  var reviewFieldsName = form.querySelector('.review-fields-name');
  var reviewFieldsText = form.querySelector('.review-fields-text');
  var reviewMark = null;

  formOpenButton.onclick = function(evt) {
    evt.preventDefault();
    formContainer.classList.remove('invisible');
  };

  formCloseButton.onclick = function(evt) {
    evt.preventDefault();
    formContainer.classList.add('invisible');
  };

  reviewFields.classList.add('invisible');  // чтобы при отсутствии куков до начала ввода подсказки не появлялись

  if (browserCookies.get('reviewerName')) {
    console.log('Имя найдено в куках:', browserCookies.get('reviewerName'));
    reviewerName.value = browserCookies.get('reviewerName');
  } else {
    console.log('Имя не найдено в куках');
  }

  /**
   * Итерирует по объектам типа NodeList.
   * @param {object} nodelist
   * @param {function} callback
   * @param {object} scope
   */
  var forEachNode = function(nodelist, callback, scope) {
    for (var i = 0; i < nodelist.length; i++) {
      callback.call(scope, i, nodelist[i]);
    }
  };

  if (browserCookies.get('reviewMark')) {
    console.log('Оценка найдена в куках:', browserCookies.get('reviewMark'));
    reviewMark = browserCookies.get('reviewMark');
    forEachNode(reviewMarks, function(index, node) {
      if (node.value === String(reviewMark)) {
        node.checked = true;
      }
    });
  } else {
    console.log('Оценка не найдена в куках');
  }

  /**
   * Проверяет поля ввода.
   * @return {boolean}
   */
  var checkFields = function() {
    var reviewerNameCheck = !!reviewerName.value && isNaN(parseInt(reviewerName.value, 10)) || false;
    var reviewTextCheck = true;

    if (reviewerNameCheck) {
      reviewerName.setCustomValidity('');
      reviewerNameError.innerHTML = reviewerName.validationMessage;
      reviewerNameError.classList.add('invisible');
      reviewFieldsName.classList.add('invisible');
    } else {
      if (!isNaN(parseInt(reviewerName.value, 10))) {
        reviewerName.setCustomValidity('Вы ввели что-то, не слишком похожее на имя... :(');
        reviewerNameError.innerHTML = reviewerName.validationMessage;
      } else {
        reviewerName.setCustomValidity('Вам точно стоит это заполнить :)');
        reviewerNameError.innerHTML = reviewerName.validationMessage;
      }
      if (reviewerNameError.classList.contains('invisible')) {
        reviewerNameError.classList.remove('invisible');
      }
      if (reviewFieldsName.classList.contains('invisible')) {
        reviewFieldsName.classList.remove('invisible');
      }
    }

    forEachNode(reviewMarks, function(index, node) {
      if (node.checked) {
        reviewMark = parseInt(node.value, 10);
      }
    });

    if (reviewMark < 3) {
      reviewTextCheck = !!reviewText.value || false;
    }

    if (reviewTextCheck) {
      reviewText.setCustomValidity('');
      reviewTextError.innerHTML = reviewText.validationMessage;
      reviewTextError.classList.add('invisible');
      reviewFieldsText.classList.add('invisible');
    } else {
      reviewText.setCustomValidity('Мы жаждем конструктивной критики, поэтому нам бы очень хотелось прочитать Ваш отзыв !');
      reviewTextError.innerHTML = reviewText.validationMessage;
      if (reviewTextError.classList.contains('invisible')) {
        reviewTextError.classList.remove('invisible');
      }
      if (reviewFieldsText.classList.contains('invisible')) {
        reviewFieldsText.classList.remove('invisible');
      }
    }

    if (reviewerNameCheck && reviewTextCheck) {
      reviewFields.classList.add('invisible');
      formSubmitButton.removeAttribute('disabled');
      return true;
    }

    if (reviewFields.classList.contains('invisible')) {
      reviewFields.classList.remove('invisible');
    }

    formSubmitButton.setAttribute('disabled', true);
    return false;
  };

  forEachNode(formFields, function(index, node) {
    node.oninput = checkFields;
  });

  forEachNode(reviewMarks, function(index, node) {
    node.onchange = checkFields;
  });

  form.onsubmit = function(e) {
    if (!checkFields()) {
      e.preventDefault();
    }

    var now = new Date();
    var nowMS = now.valueOf();
    var thisYearBirthdayMS = now.setMonth(7 - 1, 5);
    var expiresLengthMS = 0;
    if (nowMS > thisYearBirthdayMS) {  // если день рождения был в этом году
      expiresLengthMS = nowMS - thisYearBirthdayMS;
    } else if (nowMS < thisYearBirthdayMS) {  // если день рождения был в прошлом году
      var lastYear = now.getFullYear() - 1;
      var lastYearBirthdayMS = now.setYear(lastYear, 7 - 1, 5);
      expiresLengthMS = nowMS - lastYearBirthdayMS;
    } else {  // если сегодня день рождения - ставим куки на год
      expiresLengthMS = 365 * 24 * 3600 * 1000;
    }
    var expiresDateMS = Date.now() + expiresLengthMS;
    var expiresDate = new Date(expiresDateMS);
    browserCookies.set('reviewerName', reviewerName.value, {expires: expiresDate});
    browserCookies.set('reviewMark', String(reviewMark), {expires: expiresDate});
  };

  if (browserCookies.get('reviewMark') || browserCookies.get('reviewerName')) {
    checkFields();
  }

})();
