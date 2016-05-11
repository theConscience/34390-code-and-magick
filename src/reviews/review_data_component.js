'use strict';

var DataComponent = require('../utils/data_component');

/**
 * @param {Object} review
 * @constructor
 */
var ReviewData = function(review) {
  DataComponent.call(this, review);
};

/** @return {string} */
ReviewData.prototype.getAuthorName = function() {
  return this.data.author.name;
};

/** @return {string} */
ReviewData.prototype.getPictureSrc = function() {
  return this.data.author.picture;
};

/** @return {string} */
ReviewData.prototype.getDate = function() {
  return this.data.date;
};

/** @return {string} */
ReviewData.prototype.getDescription = function() {
  return this.data.description;
};

/** @return {number} */
ReviewData.prototype.getRating = function() {
  return this.data.rating;
};

/** @return {number} */
ReviewData.prototype.getReviewUsefulness = function() {
  return this.data.review_usefulness;
};

/** @param {number} value */
ReviewData.prototype.setRating = function(value) {
  value = parseInt(value, 10) || 0;
  value = value < 0 ? 0 : value;
  value = value > 5 ? 5 : value;
  this.data.rating = value;
  var setRatingEvent = new CustomEvent('set:rating', {
    'bubbles': true, 'cancellable': true, 'detail': {'data': this}
  });
  document.dispatchEvent(setRatingEvent);
};

/** @param {boolean} value */
ReviewData.prototype.setReviewUsefulness = function(value) {
  this.data.review_usefulness = value ?
    this.data.review_usefulness + 1 :
    this.data.review_usefulness;  // эту логику надо получше продумать...
  var setUsefulnessEvent = new CustomEvent('set:usefulness', {
    'bubbles': true, 'cancellable': true, 'detail': {'data': this, 'answer': value}
  });
  document.dispatchEvent(setUsefulnessEvent);
};

module.exports = ReviewData;
