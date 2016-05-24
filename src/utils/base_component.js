'use strict';

/**
 * @param {Object} data
 * @param {HTMLElement} container
 * @param {HTMLElement} template
 * @constructor
 */
var BaseComponent = function(data, container, template) {
  /** @type {Object} */
  this.data = data;

  /** @type {HTMLElement} */
  this.template = template || document.createElement('div');  // DOM-нода которую будем клонировать

  /**
   * Функция отрисовки элемента из шаблона и данных, возвращает новый элемент
   * @param {HTMLElement} templateElement
   * @param {Object} someData
   * @return {HTMLElement}
   */
  this.renderElement = function(templateElement, someData) {
    var element = templateElement.cloneNode(true);
    element.textContent = JSON.stringify(someData);

    return element;
  };

  /** @type {HTMLElement} */
  this.element = this.renderElement(this.template, this.data);

  this.reRender = this.reRender.bind(this);

  /** Метод для добавления компонента в DOM */
  this.mount = function(parentElement) {
    parentElement.appendChild(this.element);
  };

  this.unmount = this.unmount.bind(this);

  /** @type {Array} */
  this.clickEvents = [];
  /** @type {Array} */
  this.keyDownEvents = [];
  /** @type {Array} */
  this.customEvents = [];

  this.onClick = this.onClick.bind(this);
  this.onKeyDown = this.onKeyDown.bind(this);

  this.listenClickEvents = this.listenClickEvents.bind(this);
  this.listenKeyDownEvents = this.listenKeyDownEvents.bind(this);
  this.listenCustomEvents = this.listenCustomEvents.bind(this);
  this.listenEvents = this.listenEvents.bind(this);

  this.removeClickListeners = this.removeClickListeners.bind(this);
  this.removeKeyDownListeners = this.removeKeyDownListeners.bind(this);
  this.removeCustomListeners = this.removeCustomListeners.bind(this);
  this.removeListeners = this.removeListeners.bind(this);

  this.remove = this.remove.bind(this);

  // // Example:
  // this.mount(container);
  // this.listenEvents({
  //   'clickEvents': [this.onClick],
  //   'keyDownEvents': [this.onKeyDown]
  // });
};

/**
 * Метод для полной перерисовки компонента в том же месте,
 * внутри того же контейнера
 */
BaseComponent.prototype.reRender = function() {
  var container = this.element.parentNode;
  var nextElement = this.element.nextSibling;
  this.remove();
  this.element = this.renderElement(this.template, this.data);

  if (nextElement) {
    container.insertBefore(this.element, nextElement);
  } else {
    this.mount(container);
  }
  // // Example:
  // this.listenEvents({
  //   'clickEvents': [this.onClick],
  //   'keyDownEvents': [this.onKeyDown]
  // });
};

/** Метод для изъятия компонента из DOM */
BaseComponent.prototype.unmount = function() {
  this.element.parentNode.removeChild(this.element);
};

/**
 * Обработчик клика по DOM-элементу компоненту
 * @param {MouseEvent} evt
 */
BaseComponent.prototype.onClick = function(evt) {
  evt.preventDefault();
  console.log('event type is:', evt.type, '\nBase component ' + evt.target + ' was ' + evt.type + 'ed!');
};

/**
 * Обработчик нажатия клавиши при фокусе на DOM-элементе компонента
 * @param {MouseEvent} evt
 */
BaseComponent.prototype.onKeyDown = function(evt) {
  evt.preventDefault();
  console.log('event type is:', evt.type, '\nBase component ' + evt.target + ' was ' + evt.type + 'ed!');
};

BaseComponent.prototype.listenClickEvents = function() {
  if (!arguments.length) {
    console.log(Error('.listenClickEvents method need some event handler methods as arguments'));
    return;
  } else {
    for (var e = 0; e < arguments.length; e++) {
      this.element.addEventListener('click', arguments[e]);
      this.clickEvents.push(arguments[e]);
    }
  }
};

BaseComponent.prototype.listenKeyDownEvents = function() {
  if (!arguments.length) {
    console.log(Error('.listenKeyDownEvents method need some event handler methods as arguments'));
    return;
  } else {
    for (var e = 0; e < arguments.length; e++) {
      this.element.addEventListener('keydown', arguments[e]);
      this.keyDownEvents.push(arguments[e]);
    }
  }
};

BaseComponent.prototype.listenCustomEvents = function() {
  if (!arguments.length) {
    console.log(Error('.listenCustomEvents method need some event handler methods as arguments'));
    return;
  } else {
    for (var e = 0; e < arguments.length; e++) {
      document.addEventListener(arguments[e][0], arguments[e][1]);
      this.customEvents.push(arguments[e]);
    }
  }
};

/**
 * Функция для навешивания множественных обработчиков
 * @param {Object} options
 */
BaseComponent.prototype.listenEvents = function(options) {
  if (options.clickEvents) {
    this.listenClickEvents.apply(this, options.clickEvents);
  }
  if (options.keyDownEvents) {
    this.listenKeyDownEvents.apply(this, options.keyDownEvents);
  }
  if (options.customEvents) {
    this.listenCustomEvents.apply(this, options.customEvents);
  }
};

BaseComponent.prototype.removeClickListeners = function() {
  var e = null;
  if (arguments.length === 0) {
    for (e = 0; e < this.clickEvents.length; e++) {
      this.element.removeEventListener('click', this.clickEvents[e]);
    }
    this.clickEvents = [];
  } else {
    for (e = 0; e < arguments.length; e++) {
      var eventPosition = this.clickEvents.indexOf(arguments[e]);
      if (!~eventPosition) {
        console.error(Error('There is no such handler in this component`s clickEvents array'));
        continue;
      }
      this.element.removeEventListener('click', arguments[e]);
      this.clickEvents.splice(eventPosition, 1);
    }
  }
};

BaseComponent.prototype.removeKeyDownListeners = function() {
  var e = null;
  if (arguments.length === 0) {
    for (e = 0; e < this.keyDownEvents.length; e++) {
      this.element.removeEventListener('keydown', this.keyDownEvents[e]);
    }
    this.keyDownEvents = [];
  } else {
    for (e = 0; e < arguments.length; e++) {
      var eventPosition = this.keyDownEvents.indexOf(arguments[e]);
      if (!~eventPosition) {
        console.error(Error('There is no such handler in this component`s keyDownEvents array'));
        continue;
      }
      this.element.removeEventListener('keydown', arguments[e]);
      this.keyDownEvents.splice(eventPosition, 1);
    }
  }
};

BaseComponent.prototype.removeCustomListeners = function() {
  if (arguments.length === 0) {
    for (e = 0; e < this.customEvents.length; e++) {
      document.removeEventListener(this.customEvents[e][0], this.customEvents[e][1]);
    }
    this.customEvents = [];
  } else {
    for (var a = 0; a < arguments.length; a++) {
      var e = 0;
      while (this.customEvents[e]) {
        if (arguments[a][0] === this.customEvents[e][0] &&
            arguments[a][1] === this.customEvents[e][1]) {
          document.removeEventListener(arguments[a][0], arguments[a][1]);
        } else if (arguments[a][0] === this.customEvents[e][0] &&
            !arguments[a][1]) {
          document.removeEventListener(arguments[a][0], this.customEvents[e][1]);
        } else if (!arguments[a][0] &&
            arguments[a][1] === this.customEvents[e][1]) {
          document.removeEventListener(this.customEvents[e][0], arguments[a][1]);
        } else {
          e++;
          continue;
        }
        this.customEvents.splice(e, 1);
      }
    }
  }
};

/** Снимает все обработчики кликов (не доработана для customEvents) */
BaseComponent.prototype.removeListeners = function() {
  var e = null;
  if (arguments.length === 0) {  // если метод выполняется без аргументов
    this.removeClickListeners();
    this.removeKeyDownListeners();
    this.removeCustomListeners();
  } else {  // если в качестве аргумента переданы (this.обработчик1, this.обработчик2, ...)
    for (e = 0; e < arguments.length; e++) {
      var clickEventPosition = this.clickEvents.indexOf(arguments[e]);
      var keyDownEventPosition = this.keyDownEvents.indexOf(arguments[e]);
      //var customEventPosition = this.customEvents.indexOf(arguments[e]);
      if (!~clickEventPosition && !~keyDownEventPosition) {  // && !~customEventPosition
        console.error(Error('There is no such handler in this component`s events arrays'));
        return;
      } else if (~clickEventPosition) {
        this.removeClickListeners(arguments[e]);
      } else if (~keyDownEventPosition) {
        this.removeKeyDownListeners(arguments[e]);
      }// else if (~customEventPosition) {
      //   this.removeCustomListeners(arguments[e]);
      // }  // подумать как - и доделать
    }
  }
};

/**
 * Метод для удаления компонента - изымает его из DOM, убирает все обработчики
 */
BaseComponent.prototype.remove = function() {
  this.unmount();
  this.removeListeners();
};

module.exports = BaseComponent;
