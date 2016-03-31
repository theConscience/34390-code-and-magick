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

  var forEveryNode = function(nodelist, callback, scope) {
    for (var i = 0; i < nodelist.length; i++) {
      callback.call(scope, i, nodelist[i]);
    }
  };

  var checkFields = function() {
    console.log('checkFields was called!');

    var reviewerNameCheck = !!reviewerName.value || false;
    console.log('reviewerName.value = \'' + reviewerName.value + '\'', reviewerNameCheck);
    var reviewTextCheck = true;

    forEveryNode(reviewMarks, function(index, node) {
      if (node.checked) {
        reviewMark = parseInt(node.value, 10);
        console.log('reviewMark', reviewMark);
      }
    });

    if (reviewMark < 3) {
      console.log('reviewMark < 3, need to enter review text!');
      reviewTextCheck = !!reviewText.value || false;
    }

    console.log('reviewText.value = \'' + reviewText.value + '\'', reviewTextCheck);

    if (reviewerNameCheck) {
      console.log('hide namefield label');
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
        console.log('show namefield label');
        reviewFieldsName.classList.remove('invisible');
      }
    }

    if (reviewTextCheck) {
      console.log('hide textfield label');
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
        console.log('show textfield label');
        reviewFieldsText.classList.remove('invisible');
      }
    }

    if (reviewerNameCheck && reviewTextCheck) {
      console.log('hide all fields label');
      reviewFields.classList.add('invisible');
      formSubmitButton.removeAttribute('disabled');
      return true;
    }

    if (reviewFields.classList.contains('invisible')) {
      console.log('show all fields label');
      reviewFields.classList.remove('invisible');
    }
    formSubmitButton.setAttribute('disabled', true);
    return false;
  };

  forEveryNode(formFields, function(index, node) {
    node.oninput = checkFields;
  });

  forEveryNode(reviewMarks, function(index, node) {
    node.onchange = checkFields;
  });

  form.onsubmit = function(e) {
    if (!checkFields()) {
      e.preventDefault();
    }
  };

  checkFields();
})();
