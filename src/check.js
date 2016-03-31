"use strict";

var getMessage = function(a, b) {
  if (typeof a === "boolean") {
    if (a) {
      return "Я попал в " + b;
    } else {
      return "Я никуда не попал";
    }
  } else if (typeof a === "number") {
    return "Я прыгнул на " + a * 100 + " сантиметров";
  } else if (a instanceof Array && !(b instanceof Array)) {  //  Array.isArray(a)
    var sumItemsA = 0;
    a.forEach(function(value, index, arr) {
      sumItemsA += value;
    });
    return "Я прошёл " + sumItemsA + " шагов";
  } else if (a instanceof Array && b instanceof Array) {
    var sumOfMultipliedItems = 0;
    if (a.length > b.length) {
      for (var i = 0; i < a.length; i++) {
        if (i < b.length) {
          sumOfMultipliedItems += a[i]*b[i];
        } else {
          sumOfMultipliedItems += a[i];
        }
      }
    } else {  // для случаев, когда b >= a
      for (var i= 0; i < b.length; i++) {
        if (i < a.length) {
          sumOfMultipliedItems += b[i]*a[i];
        } else {
          sumOfMultipliedItems += b[i];
        }
      }
    }
    return "Я прошёл " + sumOfMultipliedItems + " метров";
  }
};
