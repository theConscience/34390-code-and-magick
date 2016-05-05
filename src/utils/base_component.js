'use strict';

var BaseComponent = function(data, container, template) {
  this.template = template || document.createElement('div');  // DOM-нода которую будем клонировать
  this.data = data;

  this.renderElement = function(templateElement, someData) {
    var element = templateElement.cloneNode(true);
    element.textContent = JSON.stringify(someData);

    return element;
  };

  this.element = this.renderElement(this.template, this.data);

  this.mount = function(mountHere) {
    mountHere.appendChild(this.element);
  };

  this.unmount = this.unmount.bind(this);

  this.clickEvents = [];
  this.keyDownEvents = [];

  this.onClick = this.onClick.bind(this);
  this.onKeyDown = this.onKeyDown.bind(this);

  this.listenClickEvents = this.listenClickEvents.bind(this);
  this.listenKeyDownEvents = this.listenKeyDownEvents.bind(this);
  this.listenEvents = this.listenEvents.bind(this);

  this.removeClickListeners = this.removeClickListeners.bind(this);
  this.removeKeyDownListeners = this.removeKeyDownListeners.bind(this);
  this.removeListeners = this.removeListeners.bind(this);

  this.remove = this.remove.bind(this);

  //this.listenEvents({'clickEvents': [this.onClick], 'keyDownEvents': [this.onKeyDown]});
  //this.mount(container);
};

BaseComponent.prototype.unmount = function() {
  this.element.parentNode.removeChild(this.element);
};

BaseComponent.prototype.onClick = function(evt) {
  evt.preventDefault();
  console.log('event type is:', evt.type, '\nBase component ' + evt.target + ' was ' + evt.type + 'ed!');
};

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

BaseComponent.prototype.listenEvents = function(options) {
  if (options.clickEvents) {
    this.listenClickEvents.apply(this, options.clickEvents);
  }
  if (options.keyDownEvents) {
    this.listenKeyDownEvents.apply(this, options.keyDownEvents);
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

BaseComponent.prototype.removeListeners = function() {
  var e = null;
  if (arguments.length === 0) {  // если метод выполняется без аргументов
    this.removeClickListeners();
    this.removeKeyDownListeners();
  } else {  // если в качестве аргумента переданы (this.обработчик1, this.обработчик2, ...)
    for (e = 0; e < arguments.length; e++) {
      var clickEventPosition = this.clickEvents.indexOf(arguments[e]);
      var keyDownEventPosition = this.keyDownEvents.indexOf(arguments[e]);
      if (!~clickEventPosition && !~keyDownEventPosition) {
        console.error(Error('There is no such handler in this component`s events arrays'));
        return;
      } else if (~clickEventPosition) {
        this.removeClickListeners(arguments[e]);
      } else if (~keyDownEventPosition) {
        this.removeKeyDownListeners(arguments[e]);
      }
    }
  }
};

BaseComponent.prototype.remove = function() {
  this.unmount();
  this.removeListeners();
};

module.exports = BaseComponent;
