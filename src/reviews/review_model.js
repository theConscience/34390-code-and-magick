'use strict';

var Model = require('../utils/model');

/**
 * @param {Object} review
 * @constructor
 */
var ReviewModel = function(review) {
  Model.call(this, review);
};

/** @return {string} */
ReviewModel.prototype.getAuthorName = function() {
  return this.data.author.name;
};

/** @return {string} */
ReviewModel.prototype.getPictureSrc = function() {
  return this.data.author.picture;
};

/** @return {string} */
ReviewModel.prototype.getDate = function() {
  return this.data.date;
};

/** @return {string} */
ReviewModel.prototype.getDescription = function() {
  return this.data.description;
};

/** @return {number} */
ReviewModel.prototype.getRating = function() {
  return this.data.rating;
};

/** @return {number} */
ReviewModel.prototype.getReviewUsefulness = function() {
  return this.data.review_usefulness;
};

/** @param {number} value */
ReviewModel.prototype.setRating = function(value) {
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
ReviewModel.prototype.setReviewUsefulness = function(value) {
  this.data.review_usefulness = value ?
    this.data.review_usefulness + 1 :
    this.data.review_usefulness;  // эту логику надо получше продумать...
  var setUsefulnessEvent = new CustomEvent('set:usefulness', {
    'bubbles': true, 'cancellable': true, 'detail': {'data': this, 'answer': value}
  });
  document.dispatchEvent(setUsefulnessEvent);
};

module.exports = ReviewModel;
