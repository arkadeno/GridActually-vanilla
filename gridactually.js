
/**
 * An animated grid of images that resizes to the viewport.
 *
 * @param {Object} options {
 *   allAtOnce: false (if true, show all images immediately on loading),
 *   debug: false (if true, log verbosely to the console),
 *   useFlip: true (if true, flip images during render)
 * }
 *
 * Requires jQuery.
 *
 * @constructor
 */
function GridActually(options) {
  this.IMAGE_SIZE = 128; // in pixels
  this.BOX_SIZE = 100; // in pixels
  this.IMAGE_WIDTH = 3456; // in pixels

  this.$img = document.querySelector('.gridactually-image');

  this.$container = document.createElement('div');
  this.addClass(this.$container, 'gridactually-container');
  this.$img.insertAdjacentHTML('afterend', this.$container.outerHTML);
  this.$container = document.querySelector('.gridactually-container');

  this.$el = document.createElement('div');
  this.addClass(this.$el, 'gridactually');
  this.$container.appendChild(this.$el);
  this.$el = document.querySelector('.gridactually');

  this.$overlay = document.createElement('div');
  this.insertAfter(this.$overlay, this.$container);
  this.addClass(this.$overlay, 'gridactually-overlay');
  this.$overlay = document.querySelector('.gridactually-overlay');

  /**
   * Number of images in the grid.
   * @type {Number}
   */
  this.imageTotal = Math.floor(this.IMAGE_WIDTH/this.IMAGE_SIZE);
  this.imageUrl = this.$img.src;

  // Instance options
  this.allAtOnce = options ? options.allAtOnce : false;
  this.useFlip = options ? (options.useFlip === true || options.useFlip === undefined) : true;
  this.debug = options ? options.debug : false;

  this.$event = new EventEmitter();

  // Only start drawing after the image loads.
  this.one(this.$img, 'load', this.draw.bind(this));
  var event = document.createEvent('Event');
  event.initEvent('load', false, false);
  if (this.boxesDrawn !== 0) {
    this.$img.dispatchEvent(event);
  }
  window.onresize = this.delayedDraw.bind(this);

  if (this.debug) {
    console.log('Images', {
      url: this.imageUrl,
      total: this.imageTotal,
      totalWidth: this.IMAGE_WIDTH
    });
  }
}

GridActually.prototype.insertAfter = function(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

GridActually.prototype.addClass = function(el, className) {
  if (el.classList) {
    el.classList.add(className);
  } else {
    el.className += ' ' + className;
  }
}

GridActually.prototype.removeClass = function(el, className) {
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
}


GridActually.prototype.addEventListener = function(el, eventName, handler) {
  if (el.addEventListener) {
    el.addEventListener(eventName, handler);
  } else if(el.attachEvent) {
    el.attachEvent('on' + eventName, function(){
      handler.call(el);
    });
  }
}

GridActually.prototype.removeEventListener = function(el, eventName, handler) {
  if (el.removeEventListener) {
    el.removeEventListener(eventName, handler);
  } else if(el.detachEvent) {
    el.detachEvent('on' + eventName, handler);
  }
}

GridActually.prototype.one = function(el, eventName, handler) {
  this.removeEventListener(el, eventName, handler);
  return this.addEventListener(el, eventName, function(){
    if (handler) return handler();
  })
}

GridActually.prototype.addAllBoxesAscending = function() {
  for (var i = 0; i < this.cells; i++) {
    this.addBoxToCell(i);
  }
};

/** @param {Number} cellNumber */
GridActually.prototype.addBoxToCell = function(cellNumber) {
  // Fill out the grid even if we don't have enough images.
  var imageNumber =  (cellNumber >= this.imageTotal)
    ? cellNumber - (Math.floor(cellNumber / this.imageTotal) * this.imageTotal)
    : cellNumber;

  this.makeBox(cellNumber, imageNumber);
};

/**
 * @param  {jQuery.Element} $boxEl
 * @param  {Number} cellNumber
 */

GridActually.prototype.appendBox = function($boxEl, cellNumber) {
  var $existingBox = this.$el.querySelectorAll('.box:nth-child(' + cellNumber + ')');

  if ($existingBox.length) {
    $existingBox.outerHTML = $boxEl;
  } else {
    this.$el.appendChild($boxEl);
  }


  window.setTimeout(this.appendBoxFinal.bind(this, $boxEl), this.allAtOnce ? 0 : 700);
};

/**
 * @param  {jQuery.Element} $boxEl
 */
GridActually.prototype.appendBoxFinal = function($boxEl) {
  this.unflipBox($boxEl);
  this.boxesDrawn++;
  if (this.boxesDrawn == this.cells) {
    this.triggerDrawComplete();
  }
};

/**
 * Use this to draw the grid in cases where you need to protect against
 * repeated draw calls in a short period of time. e.g. window.resize
 */
GridActually.prototype.delayedDraw = function() {
  if (this.drawTimeout) {
    window.clearInterval(this.drawTimeout);
  }

  this.$el.querySelector('.box').style.display = 'none';

  this.drawTimeout = window.setTimeout(this.draw.bind(this), 300);
};

GridActually.prototype.draw = function() {
  this.triggerDrawStart();
  this.boxesDrawn = 0;

  this.setDimensions();
  this.setOverlay();
  this.addAllBoxesAscending();
};

/**
 * @param {Number} cellNumber
 * @param {Number} imageNumber
 */
GridActually.prototype.makeBox = function(cellNumber, imageNumber) {
  if (this.debug) {
    console.log('Drawn!', {
      cellNumber: cellNumber,
      imageNumber: imageNumber
    });
  }

  var boxHtml = '<div class="images">' +
                '<div class="front"></div><div class="back"></div>' +
                '</div>';

  var $el = document.createElement('div');
  $el.innerHTML = boxHtml;
  this.addClass($el, 'box');

  var $front = $el.querySelector('.front');
  $front.style.backgroundImage = 'url(' + this.imageUrl + ')';
    // Firefox can't set explicit axis values e.g. background-position-x
  $front.style.backgroundPosition = '-' + (this.BOX_SIZE * imageNumber) + 'px 0';

  if (this.useFlip) {
    this.addClass($el, 'flipped');
  }

  $el.style.width = $el.style.height = this.BOX_SIZE + 'px';
  var els = $el.querySelectorAll('.front, .back');
  [].forEach.call(els, function(e){
    e.style.width = e.style.height = this.BOX_SIZE + 'px';
  }.bind(this));

  // Stagger appending, evenly.
  var animIntervalInMs = this.allAtOnce ? 0 : 5;
  window.setTimeout(this.appendBox.bind(this, $el, cellNumber),
                    cellNumber * animIntervalInMs);
};

GridActually.prototype.setDimensions = function() {
  this.columns = Math.ceil(window.innerWidth/this.BOX_SIZE);
  this.rows = Math.ceil(window.innerHeight/this.BOX_SIZE);
  this.cells = (this.columns * this.rows) + 1;

  this.$el.style.width = this.columns * this.BOX_SIZE + 'px';
  this.$el.style.height = this.rows * this.BOX_SIZE + 'px';

  if (this.debug) {
    console.log("DIMENSIONS", {
      columns: this.columns,
      rows: this.rows,
      cells: this.cells
    });
  }
};

GridActually.prototype.setOverlay = function() {
  this.$overlay.style.height = this.$el.offsetHeight + 'px';
};

GridActually.prototype.triggerDrawComplete = function() {
  this.$event.emitEvent('GridActually:draw:complete');
};

GridActually.prototype.triggerDrawStart = function() {
  this.$event.emitEvent('GridActually:draw:start');
};

/** @param  {jQuery.Element} $boxEl */
GridActually.prototype.unflipBox = function($boxEl) {
  if (!this.useFlip) return;
  this.removeClass($boxEl, 'flipped');
};

// Get things started.
document.addEventListener('DOMContentLoaded', function() {
  new GridActually();
});

/*!
 * EventEmitter v4.2.11 - git.io/ee
 * Unlicense - http://unlicense.org/
 * Oliver Caldwell - http://oli.me.uk/
 * @preserve
 */
(function(){"use strict";function t(){}function i(t,n){for(var e=t.length;e--;)if(t[e].listener===n)return e;return-1}function n(e){return function(){return this[e].apply(this,arguments)}}var e=t.prototype,r=this,s=r.EventEmitter;e.getListeners=function(n){var r,e,t=this._getEvents();if(n instanceof RegExp){r={};for(e in t)t.hasOwnProperty(e)&&n.test(e)&&(r[e]=t[e])}else r=t[n]||(t[n]=[]);return r},e.flattenListeners=function(t){var e,n=[];for(e=0;e<t.length;e+=1)n.push(t[e].listener);return n},e.getListenersAsObject=function(n){var e,t=this.getListeners(n);return t instanceof Array&&(e={},e[n]=t),e||t},e.addListener=function(r,e){var t,n=this.getListenersAsObject(r),s="object"==typeof e;for(t in n)n.hasOwnProperty(t)&&-1===i(n[t],e)&&n[t].push(s?e:{listener:e,once:!1});return this},e.on=n("addListener"),e.addOnceListener=function(e,t){return this.addListener(e,{listener:t,once:!0})},e.once=n("addOnceListener"),e.defineEvent=function(e){return this.getListeners(e),this},e.defineEvents=function(t){for(var e=0;e<t.length;e+=1)this.defineEvent(t[e]);return this},e.removeListener=function(r,s){var n,e,t=this.getListenersAsObject(r);for(e in t)t.hasOwnProperty(e)&&(n=i(t[e],s),-1!==n&&t[e].splice(n,1));return this},e.off=n("removeListener"),e.addListeners=function(e,t){return this.manipulateListeners(!1,e,t)},e.removeListeners=function(e,t){return this.manipulateListeners(!0,e,t)},e.manipulateListeners=function(r,t,i){var e,n,s=r?this.removeListener:this.addListener,o=r?this.removeListeners:this.addListeners;if("object"!=typeof t||t instanceof RegExp)for(e=i.length;e--;)s.call(this,t,i[e]);else for(e in t)t.hasOwnProperty(e)&&(n=t[e])&&("function"==typeof n?s.call(this,e,n):o.call(this,e,n));return this},e.removeEvent=function(e){var t,r=typeof e,n=this._getEvents();if("string"===r)delete n[e];else if(e instanceof RegExp)for(t in n)n.hasOwnProperty(t)&&e.test(t)&&delete n[t];else delete this._events;return this},e.removeAllListeners=n("removeEvent"),e.emitEvent=function(r,o){var e,i,t,s,n=this.getListenersAsObject(r);for(t in n)if(n.hasOwnProperty(t))for(i=n[t].length;i--;)e=n[t][i],e.once===!0&&this.removeListener(r,e.listener),s=e.listener.apply(this,o||[]),s===this._getOnceReturnValue()&&this.removeListener(r,e.listener);return this},e.trigger=n("emitEvent"),e.emit=function(e){var t=Array.prototype.slice.call(arguments,1);return this.emitEvent(e,t)},e.setOnceReturnValue=function(e){return this._onceReturnValue=e,this},e._getOnceReturnValue=function(){return this.hasOwnProperty("_onceReturnValue")?this._onceReturnValue:!0},e._getEvents=function(){return this._events||(this._events={})},t.noConflict=function(){return r.EventEmitter=s,t},"function"==typeof define&&define.amd?define(function(){return t}):"object"==typeof module&&module.exports?module.exports=t:r.EventEmitter=t}).call(this);