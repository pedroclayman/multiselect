/* focusin/out event polyfill (firefox) */
!function(){
    var w = window,
        d = w.document;

    if( w.onfocusin === undefined ){
        d.addEventListener('focus'    ,addPolyfill    ,true);
        d.addEventListener('blur'     ,addPolyfill    ,true);
        d.addEventListener('focusin'  ,removePolyfill ,true);
        d.addEventListener('focusout' ,removePolyfill ,true);
    }
    function addPolyfill(e){
        var type = e.type === 'focus' ? 'focusin' : 'focusout';
        var event = new CustomEvent(type, { bubbles:true, cancelable:false });
        event.c1Generated = true;
        e.target.dispatchEvent( event );
    }
    function removePolyfill(e){
        if(!e.c1Generated){ // focus after focusin, so chrome will the first time trigger tow times focusin
            d.removeEventListener('focus'    ,addPolyfill    ,true);
            d.removeEventListener('blur'     ,addPolyfill    ,true);
            d.removeEventListener('focusin'  ,removePolyfill ,true);
            d.removeEventListener('focusout' ,removePolyfill ,true);
        }
        setTimeout(function(){
            d.removeEventListener('focusin'  ,removePolyfill ,true);
            d.removeEventListener('focusout' ,removePolyfill ,true);
        });
    }

}();

angular.module('multi-select', []);

if (!Element.prototype.scrollIntoViewIfNeeded) {
  Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
    centerIfNeeded = arguments.length === 0 ? true : !!centerIfNeeded;

    var parent = this.parentNode,
        parentComputedStyle = window.getComputedStyle(parent, null),
        parentBorderTopWidth = parseInt(parentComputedStyle.getPropertyValue('border-top-width')),
        parentBorderLeftWidth = parseInt(parentComputedStyle.getPropertyValue('border-left-width')),
        overTop = this.offsetTop - parent.offsetTop < parent.scrollTop,
        overBottom = (this.offsetTop - parent.offsetTop + this.clientHeight - parentBorderTopWidth) > (parent.scrollTop + parent.clientHeight),
        overLeft = this.offsetLeft - parent.offsetLeft < parent.scrollLeft,
        overRight = (this.offsetLeft - parent.offsetLeft + this.clientWidth - parentBorderLeftWidth) > (parent.scrollLeft + parent.clientWidth),
        alignWithTop = overTop && !overBottom;

    if ((overTop || overBottom) && centerIfNeeded) {
      parent.scrollTop = this.offsetTop - parent.offsetTop - parent.clientHeight / 2 - parentBorderTopWidth + this.clientHeight / 2;
    }

    if ((overLeft || overRight) && centerIfNeeded) {
      parent.scrollLeft = this.offsetLeft - parent.offsetLeft - parent.clientWidth / 2 - parentBorderLeftWidth + this.clientWidth / 2;
    }

    if ((overTop || overBottom || overLeft || overRight) && !centerIfNeeded) {
      this.scrollIntoView(alignWithTop);
    }
  };
}

angular.module('multi-select').directive('multiSelectChoices', [
  'constants', '$timeout',
  function multiSelectChoicesDirective(constants, $timeout) {
    function hasEventPathProperty() {
      return Event.prototype.hasOwnProperty('path');
    }

    function multiSelectChoicesCtrl(scope) {
    }

    return {
      restrict: 'E',
      require: ['^multiSelect', 'multiSelectChoices'],
      templateUrl: 'multiSelect/choices',
      scope: true,
      link: function (scope, element, attrs, ctrls) {
        var msCtrl = ctrls[0];
        var ctrl = ctrls[1];

        msCtrl.registerCtrl('choices', ctrl);

        var choicesEl =  element[0].querySelector('.multi-select-choices');
        var msEl = element[0].parentElement;
        var inputEl = msEl.querySelector('input[type=search]');
        var bodyEl = document.querySelector('body');

        scope.currentIndex = 0;
        scope.filteredChoices = [];

        function _resetCurrentIndex() {
          scope.currentIndex = scope.filteredChoices && scope.filteredChoices.length > 0 ? 0 : -1;
        }

        function _selectItem(item) {
          scope.selectItem(item);
          _resetCurrentIndex();

          if (scope.options.closeOnSelect) {
            scope.options.isOpen = false;
          }

          if (scope.options.resetInput) {
            scope.resetInput();
          }
        }

        function _scrollTo(itemSelector) {
          var scrollToEl = choicesEl.querySelector(itemSelector);
          if (scrollToEl) {
            scrollToEl.scrollIntoViewIfNeeded();
          }
        }

        ctrl.handleEvent = function(ev) {
          switch(ev.keyCode) {

            case constants.KEY.DOWN:
              if (!scope.options.isOpen) {
                scope.options.isOpen = true;
                scope.currentIndex = 0;
              }
              else {
                scope.currentIndex = (scope.currentIndex+1) % scope.filteredChoices.length;
                $timeout(function() {
                  _scrollTo('.selected');
                });
              }
              break;

            case constants.KEY.UP:
              scope.currentIndex = scope.currentIndex-1 < 0 ? scope.filteredChoices.length - 1 : scope.currentIndex-1;
              $timeout(function() {
                _scrollTo('.selected');
              });
              break;

            case constants.KEY.ENTER:
              if (scope.options.isOpen) {
                _selectItem(scope.filteredChoices[scope.currentIndex]);
              }
              break;

            case constants.KEY.ESC:
              scope.options.isOpen = false;
              break;
          }
        };

        scope.$watch('options.search',
          function(newVal, oldVal) {
            if (newVal !== oldVal) {
              _resetCurrentIndex();
              if (newVal && newVal.length) {
                scope.options.isOpen = true;
              }
            }
          }
        )



        scope.$watch('options.isOpen',
          function(newVal, oldVal) {
            if (newVal !== oldVal) {
              if (newVal) {

                choicesEl.style.width = msEl.clientWidth + 'px';
                bodyEl.appendChild(choicesEl);
                choicesEl.addEventListener('focusin', _choiceHandler);
              }
              else {
                choicesEl.removeEventListener('focusin', _choiceHandler);
                element[0].appendChild(choicesEl);
              }
            }

          }
        )

        scope.choiceClicked = function(item, ev) {
          _selectItem(item);
        };

        function _choiceHandler(ev) {
          if (!hasEventPathProperty()) {
            if (ev.path == null) {
              ev.path = []
            }
            ev.path.push(choicesEl);
          }
          inputEl.focus();
        }

        scope.$on('$destroy', function() {
          choicesEl.removeEventListener('focusin', _choiceHandler);
          msCtrl.unregisterCtrl('choices');
        });
      },
      controller: ['$scope', multiSelectChoicesCtrl]
    }
  }
]);

angular.module('multi-select').filter('unselected', [

  function unselectedFilter() {

    return function(items, selected) {
      if (selected == null) {
        return items;
      }

      return items.filter(function(item) {
        return selected.indexOf(item) === -1;
      });
    }
  }
]);

angular.module('multi-select').constant('constants', {
  KEY: {
    LEFT: 37,
    RIGHT: 39,
    UP: 38,
    DOWN: 40,
    TAB: 9,
    BACKSPACE: 8,
    DELETE: 46,
    ENTER: 13,
    ESC: 27
  }
});

angular.module('multi-select').directive('multiSelect', [
  'constants', '$parse',
  function multiSelectDirective(constants, $parse) {

    function hasEventPathProperty() {
      return Event.prototype.hasOwnProperty('path');
    }

    function multiSelectDirectiveCtrl() {
    }

    return {
      restrict: 'E',
      templateUrl: 'multiSelect/main',
      require: ['ngModel', 'multiSelect'],
      scope: {
        choices: '=',
        placeholder: '@',
        model: '=ngModel'
      },
      controller: ['$scope', multiSelectDirectiveCtrl],
      compile: function(tElement, tAttrs) {

        var _registeredCtrls = [];

        return {
          pre: function(scope, element, attrs, ctrls) {
            var ngModelCtrl = ctrls[0];
            var ctrl = ctrls[1];

            ctrl.open = function() {
              scope.options.isOpen = true;
            };
            ctrl.close = function() {
              scope.options.isOpen = false;
            };
            ctrl.registerCtrl = function(key, ctrl) {
              _registeredCtrls[key] = ctrl;
            };
            ctrl.unregisterCtrl = function(key) {
              var idx = _registeredCtrls.indexOf(key);
              if (idx !== -1) {
                _registeredCtrls.splice(idx, -1);
              }
            };

            ctrl.selectItem = scope.selectItem = function(item) {

              if (ngModelCtrl.$modelValue == null) {
                scope.model = [item];
              }
              else{
                // todo error handling
                scope.model.push(item);
              }
            };

            ctrl.unselectItem = scope.unselectItem = function(item) {
              if (ngModelCtrl.$modelValue != null) {
                var items = ngModelCtrl.$modelValue;
                var idx = items.indexOf(item);

                if (idx > -1) {
                  items.splice(idx, 1);
                }
              }
            };

            ctrl.resetInput = scope.resetInput = function resetInput() {
              scope.options.search = '';
            };
          },
          post: function(scope, element, attrs, ctrls) {
            var input = element[0].querySelector('input[type=search]');

            function _dispatchKeyup(ev) {
              // horizontal nav
              if (~[constants.KEY.LEFT].indexOf(ev.keyCode)) {
                if (input.selectionStart == 0) {
                  _registeredCtrls['pills'].handleEvent(ev);
                }
              }
              else if (~[constants.KEY.RIGHT].indexOf(ev.keyCode)) {
                if (input.selectionStart == 0 && scope.options.selectedPillIndex !== -1) {
                  _registeredCtrls['pills'].handleEvent(ev);
                }
              }
              else if(~[constants.KEY.BACKSPACE, constants.KEY.DELETE].indexOf(ev.keyCode)) {
                _registeredCtrls['pills'].handleEvent(ev);
              }
              else if (~[constants.KEY.UP, constants.KEY.DOWN, constants.KEY.ENTER, constants.KEY.ESC].indexOf(ev.keyCode)) {
                _registeredCtrls['choices'].handleEvent(ev);
              }
              scope.$apply();
            }

            function _inputKeyDownHandler(ev) {
              if (~[constants.KEY.LEFT, constants.KEY.RIGHT].indexOf(ev.keyCode) &&
                  input.selectionStart == 0 &&
                  scope.options.selectedPillIndex !== -1) {
                ev.preventDefault();
              }

              if (~[constants.KEY.TAB].indexOf(ev.keyCode)) {
                scope.$apply(function() {
                  scope.options.selectedPillIndex = -1;
                })
              }
            }

            function _inputHandler(ev) {
              if (!hasEventPathProperty()) {
                if (ev.path == null) {
                  ev.path = []
                }
                ev.path.push(input);
              }
            }

            function _elementHandler(ev) {
              function isClickOnInput() {
                if (ev.path) {
                  var matches = ev.path.filter(function(pi) {
                    return pi === input;
                  });
                  return matches.length > 0;
                }
                return false;
              }

              if (!hasEventPathProperty()) {
                if (ev.path == null) {
                  ev.path = []
                }
                ev.path.push(element[0]);
              }

              if (!scope.options.isOpen && isClickOnInput()) {
                scope.$apply(function() {
                  scope.options.isOpen = true;
                });
              }
            }

            function _bodyHandler(ev) {
              function isClickInside() {
                if (ev.path) {
                  var matches = ev.path.filter(function(pi) {
                    return pi === element[0] || (pi.classList && pi.classList.contains('multi-select-choices'));
                  });
                  return matches.length > 0;
                }
                return false;
              }

              if (scope.options.isOpen !== false && !isClickInside()) {
                scope.$apply(function() {
                  scope.options.isOpen = false;
                });
              }
            }


            function _initialize() {
              scope.options.closeOnSelect = true;
              scope.options.resetInput = true;

              attrs.$observe('closeOnSelect',
                function(newVal) {
                  scope.options.closeOnSelect = newVal == null ? true : scope.$eval(newVal);
                });

              attrs.$observe('resetInput',
                function(newVal) {
                  scope.options.resetInput = newVal == null ? true : scope.$eval(newVal);
                });
            }
            var ngModelCtrl = ctrls[0];
            var ctrl = ctrls[1];

            scope.options = {
              selectedPillIndex : -1,
              search: ''
            };

            _initialize(attrs);

            // keystokes
            element[0].addEventListener('keydown', _dispatchKeyup);

            // click on input
            input.addEventListener('click', _inputHandler);
            input.addEventListener('focusin', _inputHandler);
            input.addEventListener('keydown', _inputKeyDownHandler);

            element[0].addEventListener('click', _elementHandler);
            element[0].addEventListener('focusin', _elementHandler);

            document.addEventListener('focusin', _bodyHandler);
            document.addEventListener('click', _bodyHandler);

            scope.$on('$destroy', function() {
              input.removeEventListener('click', _inputHandler);
              input.removeEventListener('focusin', _inputHandler);
              input.removeEventListener('keydown', _inputKeyDownHandler);

              element[0].removeEventListener('keydown', _dispatchKeyup);
              element[0].removeEventListener('focusin', _elementHandler);
              element[0].removeEventListener('click', _elementHandler);
              document.removeEventListener('focusin', _bodyHandler);
              document.removeEventListener('click', _bodyHandler);

            });
          }
        }
      }
    }
  }
]);

angular.module('multi-select').directive('multiSelect', [
  'resizeSensor', '$window',
  function fillBehaviourMultiSelectDirective(resizeSensor, $window) {
    return {
      link: function(scope, element, attrs, ctrls) {
        var treshold = 50;
        var input = element[0].querySelector('input[type=search]');

        function recomputeWidth() {
          var lis = element[0].querySelectorAll('.pills li');
          if (lis.length > 0) {
            var lastPill = lis[lis.length - 1];
            var mspRect = element[0].querySelector('.pills').getBoundingClientRect();
            var lpRect = lastPill.getBoundingClientRect();

            var availableWidth = parseFloat($window.getComputedStyle(element[0]).width);
            var right = lpRect.right - mspRect.left;

            if (availableWidth - right > treshold) {
              input.style.width = (availableWidth - right) + 'px';
            }
            else {
              input.style.width = '100%';
            }

          }
          else {
            input.style.width = '100%';
          }
        }

        resizeSensor(element[0], recomputeWidth);

        scope.$on('$destroy', function() {
          resizeSensor.detach(element[0], recomputeWidth);
        });

      }
    }
  }
]);


angular.module('multi-select').run(['$templateCache',
  function ($templateCache) {
    $templateCache.put('multiSelect/main', '<multi-select-pills></multi-select-pills><input type="search" ng-model="options.search" placeholder="{{placeholder}}" /><multi-select-choices tabindex="-1" scroll-to></multi-select-choices>');
    $templateCache.put('multiSelect/pills', '<ul class="pills" ng-show="model != null && model.length"><li ng-class="{\'selected\' : $index === options.selectedPillIndex }" ng-repeat="item in model">{{item}}&nbsp;<a tabindex="-1" href ng-click="unselectItem(item)">x</a></li></ul>');
    $templateCache.put('multiSelect/choices', '<ul class="multi-select-choices" ng-show="options.isOpen" tabindex="-1"><li ng-repeat="item in choices | filter : options.search | unselected : model as filteredChoices" ng-class="{\'selected\' : $index === currentIndex }"><a tabindex="-1" ng-click="choiceClicked(item, $event)">{{item}}</a></li></ul>');
  }
]);

angular.module('multi-select').directive('multiSelectPills', [
  'constants',
  function multiSelectDirective(constants) {
    function multiSelectPillsCtrl() {

    }

    return {
      restrict: 'E',
      require: ['^multiSelect', 'multiSelectPills'],
      templateUrl: 'multiSelect/pills',
      link: function (scope, element, attrs, ctrls) {
        var msCtrl = ctrls[0];
        var ctrl = ctrls[1];
        msCtrl.registerCtrl('pills', ctrl);

        ctrl.handleEvent = function(ev) {
          var modelLength = scope.model ? scope.model.length : 0;

          switch (ev.keyCode) {
            case constants.KEY.LEFT:
                if (scope.options.selectedPillIndex === -1) {
                    scope.options.selectedPillIndex = modelLength - 1;
                }
                else if (scope.options.selectedPillIndex > 0) {
                  scope.options.selectedPillIndex--;
                }

              break;
            case constants.KEY.RIGHT:
                if (scope.options.selectedPillIndex < modelLength - 1) {
                  scope.options.selectedPillIndex++;
                }
                else if (scope.options.selectedPillIndex === modelLength - 1) {
                  scope.options.selectedPillIndex = -1;
                }
              break;
            case constants.KEY.BACKSPACE:
                if (scope.options.selectedPillIndex > -1) {
                  scope.model.splice(scope.options.selectedPillIndex, 1);

                  if (modelLength === 0) {
                    scope.options.selectedPillIndex = -1
                  }
                  else if (scope.options.selectedPillIndex > 0) {
                    scope.options.selectedPillIndex--;
                  }

                }
              break;
              case constants.KEY.DELETE:
                  if (scope.options.selectedPillIndex > -1) {
                    scope.model.splice(scope.options.selectedPillIndex, 1);

                    if (modelLength === 0) {
                      scope.options.selectedPillIndex = -1
                    }
                    else if (scope.options.selectedPillIndex > modelLength - 1) {
                      scope.options.selectedPillIndex--;
                    }
                  }
                break;

          }
        }

        scope.$on('$destroy', function() {
          msCtrl.unregisterCtrl('pills');
        });
      },
      controller: [multiSelectPillsCtrl]
    }
  }
]);

/**
 * Copyright Marc J. Schmidt. See the LICENSE file at the top-level
 * directory of this distribution and at
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */

angular.module('multi-select').factory('resizeSensor', [

  function () {

      // Only used for the dirty checking, so the event callback count is limted to max 1 call per fps per sensor.
      // In combination with the event based resize sensor this saves cpu time, because the sensor is too fast and
      // would generate too many unnecessary events.
      var requestAnimationFrame = window.requestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.webkitRequestAnimationFrame;

      /**
       * Iterate over each of the provided element(s).
       *
       * @param {HTMLElement|HTMLElement[]} elements
       * @param {Function}                  callback
       */
      function forEachElement(elements, callback){
          var elementsType = Object.prototype.toString.call(elements);
          var isCollectionTyped = ('[object Array]' === elementsType
              || ('[object NodeList]' === elementsType)
              || ('[object HTMLCollection]' === elementsType)
              || ('undefined' !== typeof jQuery && elements instanceof jQuery) //jquery
              || ('undefined' !== typeof Elements && elements instanceof Elements) //mootools
          );
          var i = 0, j = elements.length;
          if (isCollectionTyped) {
              for (; i < j; i++) {
                  callback(elements[i]);
              }
          } else {
              callback(elements);
          }
      }

      /**
       * Class for dimension change detection.
       *
       * @param {Element|Element[]|Elements|jQuery} element
       * @param {Function} callback
       *
       * @constructor
       */
      var ResizeSensor = function(element, callback) {
          /**
           *
           * @constructor
           */
          function EventQueue() {
              var q = [];
              this.add = function(ev) {
                  q.push(ev);
              };

              var i, j;
              this.call = function() {
                  for (i = 0, j = q.length; i < j; i++) {
                      q[i].call();
                  }
              };

              this.remove = function(ev) {
                  var newQueue = [];
                  for(i = 0, j = q.length; i < j; i++) {
                      if(q[i] !== ev) newQueue.push(q[i]);
                  }
                  q = newQueue;
              }

              this.length = function() {
                  return q.length;
              }
          }

          /**
           * @param {HTMLElement} element
           * @param {String}      prop
           * @returns {String|Number}
           */
          function getComputedStyle(element, prop) {
              if (element.currentStyle) {
                  return element.currentStyle[prop];
              } else if (window.getComputedStyle) {
                  return window.getComputedStyle(element, null).getPropertyValue(prop);
              } else {
                  return element.style[prop];
              }
          }

          /**
           *
           * @param {HTMLElement} element
           * @param {Function}    resized
           */
          function attachResizeEvent(element, resized) {
              if (!element.resizedAttached) {
                  element.resizedAttached = new EventQueue();
                  element.resizedAttached.add(resized);
              } else if (element.resizedAttached) {
                  element.resizedAttached.add(resized);
                  return;
              }

              element.resizeSensor = document.createElement('div');
              element.resizeSensor.className = 'resize-sensor';
              var style = 'position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1; visibility: hidden;';
              var styleChild = 'position: absolute; left: 0; top: 0; transition: 0s;';

              element.resizeSensor.style.cssText = style;
              element.resizeSensor.innerHTML =
                  '<div class="resize-sensor-expand" style="' + style + '">' +
                      '<div style="' + styleChild + '"></div>' +
                  '</div>' +
                  '<div class="resize-sensor-shrink" style="' + style + '">' +
                      '<div style="' + styleChild + ' width: 200%; height: 200%"></div>' +
                  '</div>';
              element.appendChild(element.resizeSensor);

              if (getComputedStyle(element, 'position') == 'static') {
                  element.style.position = 'relative';
              }

              var expand = element.resizeSensor.childNodes[0];
              var expandChild = expand.childNodes[0];
              var shrink = element.resizeSensor.childNodes[1];

              var reset = function() {
                  expandChild.style.width  = 100000 + 'px';
                  expandChild.style.height = 100000 + 'px';

                  expand.scrollLeft = 100000;
                  expand.scrollTop = 100000;

                  shrink.scrollLeft = 100000;
                  shrink.scrollTop = 100000;
              };

              reset();
              var dirty = false;

              var dirtyChecking = function() {
                  if (!element.resizedAttached) return;

                  if (dirty) {
                      element.resizedAttached.call();
                      dirty = false;
                  }

                  requestAnimationFrame(dirtyChecking);
              };

              requestAnimationFrame(dirtyChecking);
              var lastWidth, lastHeight;
              var cachedWidth, cachedHeight; //useful to not query offsetWidth twice

              var onScroll = function() {
                if ((cachedWidth = element.offsetWidth) != lastWidth || (cachedHeight = element.offsetHeight) != lastHeight) {
                    dirty = true;

                    lastWidth = cachedWidth;
                    lastHeight = cachedHeight;
                }
                reset();
              };

              var addEvent = function(el, name, cb) {
                  if (el.attachEvent) {
                      el.attachEvent('on' + name, cb);
                  } else {
                      el.addEventListener(name, cb);
                  }
              };

              addEvent(expand, 'scroll', onScroll);
              addEvent(shrink, 'scroll', onScroll);
          }

          forEachElement(element, function(elem){
              attachResizeEvent(elem, callback);
          });

          this.detach = function(ev) {
              ResizeSensor.detach(element, ev);
          };
      };

      ResizeSensor.detach = function(element, ev) {
          forEachElement(element, function(elem){
              if(elem.resizedAttached && typeof ev == "function"){
                  elem.resizedAttached.remove(ev);
                  if(elem.resizedAttached.length()) return;
              }
              if (elem.resizeSensor) {
                  if (elem.contains(elem.resizeSensor)) {
                      elem.removeChild(elem.resizeSensor);
                  }
                  delete elem.resizeSensor;
                  delete elem.resizedAttached;
              }
          });
      };

      return ResizeSensor;

  }

]);
