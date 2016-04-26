'use strict';

var reviewsSection = document.querySelector('.reviews');

/** @param {function(Array.<Object>)} callback */
var loadReviews = function(url, callback) {
  var xhr = new XMLHttpRequest();
  var XHR_UNSENT = 0;
  var XHR_OPENED = 1;
  var XHR_HEADERS_RECEIVED = 2;
  var XHR_LOADING = 3;
  var XHR_DONE = 4;
  //var REVIEWS_LOAD_URL = '//o0.github.io/assets/json/reviews.json';
  var XHR_TIMEOUT = 10000;

  xhr.open('GET', url, true);

  xhr.onreadystatechange = function(evt) {
    var requestObject = evt.target;

    switch (requestObject.readyState) {
      case XHR_UNSENT:
        break;
      case XHR_OPENED:
        reviewsSection.classList.add('reviews-list-loading');
        break;
      case XHR_HEADERS_RECEIVED:
        console.log('xhr headers recieved');
        break;
      case XHR_LOADING:
        console.log('xhr loading...');
        break;
      case XHR_DONE:
        console.log('xhr done!');
        reviewsSection.classList.remove('reviews-list-loading');
        var loadedReviews = JSON.parse(requestObject.response);
        callback(loadedReviews);
        break;
      default:
        console.log(Error('Неизвестная ошибка'));
    }

    xhr.onerror = function() {
      console.log(Error('Ошибка сервера'));
      reviewsSection.classList.remove('reviews-list-loading');
      reviewsSection.classList.add('reviews-load-failure');
    };

    xhr.timeout = XHR_TIMEOUT;
    xhr.ontimeout = function() {
      console.log(Error('Соединение сброшено по тайм-ауту'));
      reviewsSection.classList.remove('reviews-list-loading');
      reviewsSection.classList.add('reviews-load-failure');
      xhr.abort();
    };
  };

  xhr.send();
};

module.exports = loadReviews;
