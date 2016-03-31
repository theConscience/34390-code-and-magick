'use strict';

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

  var forEachNode = function(nodelist, callback, scope) {
    for (var i = 0; i < nodelist.length; i++) {
      callback.call(scope, i, nodelist[i]);
    }
  };

  var checkFields = function() {
    var reviewerNameCheck = !!reviewerName.value || false;
    var reviewTextCheck = true;

    forEachNode(reviewMarks, function(index, node) {
      if (node.checked) {
        reviewMark = parseInt(node.value, 10);
      }
    });

    if (reviewMark < 3) {
      reviewTextCheck = !!reviewText.value || false;
    }

    if (reviewerNameCheck) {
      reviewerName.setCustomValidity('');
      reviewerNameError.innerHTML = reviewerName.validationMessage;
      reviewerNameError.classList.add('invisible');
      reviewFieldsName.classList.add('invisible');
    } else {
      reviewerName.setCustomValidity('Вам точно стоит это заполнить :)');
      reviewerNameError.innerHTML = reviewerName.validationMessage;
      if (reviewerNameError.classList.contains('invisible')) {
        reviewerNameError.classList.remove('invisible');
      }
      if (reviewFieldsName.classList.contains('invisible')) {
        reviewFieldsName.classList.remove('invisible');
      }
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
  };

  checkFields();
})();
