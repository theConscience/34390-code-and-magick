'use strict';

var KeyCode = {
  ENTER: 13,
  ESC: 27,
  SPACE: 32,
  LEFT: 37,
  RIGHT: 39
};

module.exports = {

  /** @constant {string} */
  HIDDEN_CLASS_NAME: 'invisible',

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
  isDeactivationEvent: function(evt) {
    return evt.keyCode === KeyCode.ESC;
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
  isPreviousEvent: function(evt) {
    return evt.keyCode === KeyCode.LEFT;
  },

  /**
   * @param {KeyboardsEvent} evt
   * @return {boolean}
   */
  isNextEvent: function(evt) {
    return evt.keyCode === KeyCode.RIGHT;
  },

  /**
   * Итерирует по объектам типа NodeList.
   * @param {object} nodelist
   * @param {function} callback
   * @param {object} scope
   */
  forEachNode: function(nodelist, callback, scope) {
    for (var i = 0; i < nodelist.length; i++) {
      callback.call(scope, i, nodelist[i]);
    }
  },

  /**
   * Проверяет, является ли элемент потомком элемента с некоторым классом
   * @param {HTMLElement} elem
   * @param {string} className
   * @return {boolean}
   */
  hasOwnOrAncestorClass: function(elem, className) {
    while (elem.parentNode !== null && elem.parentNode.classList) {
      if (elem.classList.contains(className) ||
      elem.parentNode.classList.contains(className)) {
        return true;
      } else {
        elem = elem.parentNode;
      }
    }
    return false;
  },

  /**
   * Возвращает ближайший элемент с некоторым классом, идёт вверх по DOM-дереву
   * начиная с текущего элемента
   * @param {HTMLElement} elem
   * @param {string} className
   * @return {HTMLElement}
   */
  getClosestWithClass: function(elem, className) {
    while (elem.parentNode !== null) {
      if (elem.classList.contains(className)) {
        return elem;
      } else {
        elem = elem.parentNode;
      }
    }
    return null;
  },

  /**
   * Копирует в первый аргумент-объект - свойства всех последующих
   * аргументов (они тоже должны быть объектами). Может иметь сколько угодно аргументов.
   * При перекрытии - более новые одноимённые свойства перезапишут более старые.
   * @param {Object} newObj
   * @param {Object}
   * @return {Object}
   */
  assign: function(newObj) {
    newObj = newObj || {};
    var o = null;
    var k = null;
    var key = null;
    var value = null;
    for (o = 1; o < arguments.length; o++) {
      for (k = 0; k < Object.keys(arguments[o]).length; k++) {
        key = Object.keys(arguments[o])[k];
        value = arguments[o][Object.keys(arguments[o])[k]];
        newObj[key] = value;
      }
    }
    return newObj;
  },

  /**
   * Нацеливает свойство [[PROTOTYPE]] первого аргумента (функции-конструктора)
   * на прототип второго аргумента (также функция-конструктор),
   * если у первой функции уже был определён прототип - сохраняет его
   * в промежуточный объект, а после изменения цепочки прототипов
   * восстанавливает все значения из промежуточного объекта.
   * @param {Function} childClass
   * @param {Function} parentClass
   */
  inherit: function(childClass, parentClass) {
    var Empty = function() {};
    var childClassPrototypeCopy = this.assign({}, childClass.prototype);
    Empty.prototype = parentClass.prototype;
    childClass.prototype = new Empty();
    this.assign(childClass.prototype, childClassPrototypeCopy);
    childClass.prototype.constructor = childClass;
  }

};
