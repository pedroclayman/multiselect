angular.module('multi-select').directive('multiSelect', [
  'constants', '$parse',
  function multiSelectDirective(constants, $parse) {



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
            function _dispatchKeyup(ev) {
              // horizontal nav
              if(~[constants.KEY.LEFT, constants.KEY.RIGHT, constants.KEY.BACKSPACE, constants.KEY.DELETE].indexOf(ev.keyCode)) {
                _registeredCtrls['pills'].handleEvent(ev);
              }
              else if (~[constants.KEY.UP, constants.KEY.DOWN, constants.KEY.ENTER].indexOf(ev.keyCode)) {
                _registeredCtrls['choices'].handleEvent(ev);
              }
              scope.$apply();
            }

            function _elementHandler(ev) {
              function isClickOnInput() {
                var input = element[0].querySelector('input');
                var matches = ev.path.filter(function(pi) {
                  return pi === input;
                });
                return matches.length > 0;
              }

              if (!scope.options.isOpen && isClickOnInput()) {
                scope.$apply(function() {
                  scope.options.isOpen = true;
                });
              }
            }

            function _bodyHandler(ev) {
              function isClickInside() {
                var matches = ev.path.filter(function(pi) {
                  return pi === element[0];
                });
                return matches.length > 0;
                //return element[0].contains(ev.srcElement) /*|| ev.originalEvent._clickInsideOfMultiselect === true*/;
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
            _initialize(attrs);

            // keystokes
            element[0].addEventListener('keydown', _dispatchKeyup);

            // click on input
            var searchEl = element[0].querySelector('input[type=search]');
            //searchEl.addEventListener('click', _handleInputClick);

            element[0].addEventListener('click', _elementHandler);
            element[0].addEventListener('focusin', _elementHandler);

            var bodyEl = document.querySelector('body');
            bodyEl.addEventListener('focusin', _bodyHandler);
            bodyEl.addEventListener('click', _bodyHandler);

            // var bodyEl = document.querySelector('body');
            // bodyEl.addEventListener('focusin', _handleBodyFocus);

            scope.$on('$destroy', function() {
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
    $templateCache.put('multiSelect/pills', '<ul class="pills" ng-show="getItems().length"><li ng-repeat="item in getItems()">{{item}}&nbsp;<a tabindex="-1" href ng-click="unselectItem(item)">x</a></li></ul>');
    $templateCache.put('multiSelect/choices', '<ul class="choices" ng-show="options.isOpen" tabindex="-1"><li ng-repeat="item in choices | filter : options.search | unselected : getItems() as filteredChoices" ng-class="{\'selected\' : $index === currentIndex }"><a tabindex="-1" ng-click="choiceClicked(item, $event)">{{item}}</a></li></ul>');
  }
]);
