'use strict';

var KeyCode = {
  ENTER: 13,
  ESC: 27,
  SPACE: 32
};

module.exports = {

  /**
   * @param {Array} elements
   * @param {Number} page
   * @param {Number} pageSize
   * @return {boolean}
   */
  isNextPageAvailable: function(elements, page, pageSize) {
    var lastPage = Math.floor(elements.length / pageSize);
    return page < lastPage;
  },

  /**
   * @param {KeyboardsEvent} evt
   * @return {boolean}
   */
  isActivationEvent: function(evt) {
    return [KeyCode.ENTER, KeyCode.SPACE].indexOf(evt.keyCode) > -1;
  },

  /**
   * @param {KeyboardsEvent} evt
   * @return {boolean}
   */
  isPauseEvent: function(evt) {
    return evt.keyCode === KeyCode.SPACE;
  },

  /**
   * @param {KeyboardsEvent} evt
   * @return {boolean}
   */
  isDeactivationEvent: function(evt) {
    return evt.keyCode === KeyCode.ESC;
  }

};
