'use strict';

var Filter = require('./filter_types');

/**
 * @param {Array.<Object>} reviewsToFilter
 * @param {Filter} filter
 * @return {Array.<Object>}
 */
var filterReviews = function(reviewsToFilter, filter) {
  var reviewsToFilterClone = reviewsToFilter.slice(0),
    TWO_WEEKS_MS = 14 * 24 * 3600 * 1000;

  switch (filter) {
    case Filter.RECENT:
      return reviewsToFilterClone.filter(function(review) {
        return Date.now() - new Date(review.date).valueOf() < TWO_WEEKS_MS;
      }).sort(function(a, b) {
        return new Date(b.date).valueOf() - new Date(a.date).valueOf();
      });
    case Filter.GOOD:
      return reviewsToFilterClone.filter(function(review) {
        return review.rating >= 3;
      }).sort(function(a, b) {
        return b.rating - a.rating;
      });
    case Filter.BAD:
      return reviewsToFilterClone.filter(function(review) {
        return review.rating <= 2;
      }).sort(function(a, b) {
        return a.rating - b.rating;
      });
    case Filter.POPULAR:
      return reviewsToFilterClone.sort(function(a, b) {
        return b.review_usefulness - a.review_usefulness;
      });
    case Filter.ALL:
    default:
      return reviewsToFilterClone;
  }
};

module.exports = filterReviews;
