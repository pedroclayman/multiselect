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
    function multiSelectChoicesCtrl(scope) {
    }

    return {
      restrict: 'E',
      require: ['^multiSelect', 'multiSelectChoices', 'scrollTo'],
      templateUrl: 'multiSelect/choices',
      scope: true,
      link: function (scope, element, attrs, ctrls) {
        var msCtrl = ctrls[0];
        var ctrl = ctrls[1];
        var scrollToCtrl = ctrls[2];

        msCtrl.registerCtrl('choices', ctrl);

        scope.currentIndex = 0;
        scope.filteredChoices = [];

        function _resetCurrentIndex() {
          scope.currentIndex = scope.filteredChoices.length > 0 ? 0 : -1;
        }

        function _selectItem(item) {
          scope.selectItem(item);
          _resetCurrentIndex();

          if (scope.options.closeOnSelect) {
            scope.options.isOpen = false;
          }

          if (scope.options.resetInput) {
            scope.resetInput();
            // scope.$apply(function() {
            //   scope.resetInput();
            // });
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
                  scrollToCtrl.scrollTo('.selected');
                });
              }
              break;

            case constants.KEY.UP:
              scope.currentIndex = scope.currentIndex-1 < 0 ? scope.filteredChoices.length - 1 : scope.currentIndex-1;
              $timeout(function() {
                scrollToCtrl.scrollTo('.selected');
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

        scope.$watch('options.searchTerm',
          function() {
            _resetCurrentIndex();
          }
        )

        scope.choiceClicked = function(item, ev) {
          _selectItem(item);
        };

        scope.$on('$destroy', function() {
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
      if (!selected) {
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
      compile: function() {
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

            ctrl.getItems = scope.getItems = function() {
              return ngModelCtrl.$modelValue;
            }

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
              scope.options.search = null;
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

            function _inputHandler(ev) {

              if (!hasEventPathProperty()) {
                if (ev.path == null) {
                  ev.path = []
                }
                ev.path.push(input);
              }
            }

            function _inputKeyDownHandler(ev) {
              if (input.selectionStart == 0 && scope.options.selectedPillIndex !== -1) {
                ev.preventDefault();
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
                    return pi === element[0];
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

            scope.options = {};
            scope.options.selectedPillIndex = -1;
            _initialize(attrs);

            // keystokes
            element[0].addEventListener('keydown', _dispatchKeyup);

            // click on input
            input.addEventListener('click', _inputHandler);
            input.addEventListener('focusin', _inputHandler);
            input.addEventListener('keydown', _inputKeyDownHandler);

            element[0].addEventListener('click', _elementHandler);
            element[0].addEventListener('focusin', _elementHandler);

            var bodyEl = document.querySelector('body');
            bodyEl.addEventListener('focusin', _bodyHandler);
            bodyEl.addEventListener('click', _bodyHandler);

            // var bodyEl = document.querySelector('body');
            // bodyEl.addEventListener('focusin', _handleBodyFocus);

            scope.$on('$destroy', function() {
              input.removeEventListener('click', _inputHandler);
              input.removeEventListener('focusin', _inputHandler);
              input.removeEventListener('keydown', _inputKeyDownHandler);

              element[0].removeEventListener('keydown', _dispatchKeyup);
              element[0].removeEventListener('focusin', _elementHandler);
              element[0].removeEventListener('click', _elementHandler);
              bodyEl.removeEventListener('focusin', _bodyHandler);
              bodyEl.removeEventListener('click', _bodyHandler);

            });
          }
        }
      }
    }
  }
]);

angular.module('multi-select').run(['$templateCache',
  function ($templateCache) {
    $templateCache.put('multiSelect/main', '<multi-select-pills></multi-select-pills><input type="search" ng-model="options.search" placeholder="{{placeholder}}" /><multi-select-choices tabindex="-1" scroll-to></multi-select-choices>');
    $templateCache.put('multiSelect/pills', '<ul class="pills" ng-show="getItems().length"><li ng-class="{\'selected\' : $index === options.selectedPillIndex }" ng-repeat="item in getItems()">{{item}}&nbsp;<a tabindex="-1" href ng-click="unselectItem(item)">x</a></li></ul>');
    $templateCache.put('multiSelect/choices', '<ul class="choices" ng-show="options.isOpen" tabindex="-1"><li ng-repeat="item in choices | filter : options.search | unselected : getItems() as filteredChoices" ng-class="{\'selected\' : $index === currentIndex }"><a tabindex="-1" ng-click="choiceClicked(item, $event)">{{item}}</a></li></ul>');
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
          switch (ev.keyCode) {
            case constants.KEY.LEFT:
                if (scope.options.selectedPillIndex === -1) {
                    scope.options.selectedPillIndex = scope.model.length - 1;
                }
                else if (scope.options.selectedPillIndex > 0) {
                  scope.options.selectedPillIndex--;
                }

              break;
            case constants.KEY.RIGHT:
                if (scope.options.selectedPillIndex < scope.model.length - 1) {
                  scope.options.selectedPillIndex++;
                }
                else if (scope.options.selectedPillIndex === scope.model.length - 1) {
                  scope.options.selectedPillIndex = -1;
                }
              break;
            case constants.KEY.BACKSPACE:
                if (scope.options.selectedPillIndex > -1) {
                  scope.model.splice(scope.options.selectedPillIndex, 1);

                  if (scope.model.length === 0) {
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

                    if (scope.model.length === 0) {
                      scope.options.selectedPillIndex = -1
                    }
                    else if (scope.options.selectedPillIndex > scope.model.length - 1) {
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

angular.module('multi-select').directive('scrollTo', [

  function scrollToDirective() {

    function scrollToController() {
    }

    return {
      restrict: 'A',
      scope: false,
      require: ['scrollTo'],
      controller: [scrollToController],
      link: function(scope, element, attrs, ctrls) {
        var ctrl = ctrls[0];

        ctrl.scrollTo = function(itemSelector) {
          var scrollToEl = element[0].querySelector(itemSelector);
          if (scrollToEl) {
            scrollToEl.scrollIntoViewIfNeeded();
          }
        }
      }
    }
  }
]);
