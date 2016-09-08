angular.module('multi-select').directive('multiSelect', [
  'constants',
  function multiSelectDirective(constants) {

    var _registeredCtrls = [];

    function multiSelectDirectiveCtrl() {
    }

    return {
      restrict: 'E',
      templateUrl: 'multiSelect/main',
      require: ['ngModel', 'multiSelect'],
      scope: {
        choices: '='
      },
      controller: ['$scope', multiSelectDirectiveCtrl],
      compile: function() {
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
              ngModelCtrl.$modelValue.push(item);
            };

            ctrl.unselectItem = scope.unselectItem = function(item) {
              var items = ngModelCtrl.$modelValue;
              var idx = items.indexOf(item);

              if (idx > -1) {
                items.splice(idx, 1);
              }
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

            function _handleInputClick(ev) {
              if (!scope.options.isOpen) {
                scope.$apply(function() {
                  scope.options.isOpen = true;
                });
              }
            }

            function _initialize() {
              attrs.$observe('closeOnSelect',
                function(newVal) {
                  scope.options.closeOnSelect = newVal == null ? true : scope.$eval(newVal);
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
            searchEl.addEventListener('click', _handleInputClick);

            scope.$on('$destroy', function() {
              element[0].removeEventListener('keydown', _dispatchKeyup);
              searchEl.removeEventListener('click', _handleInputClick);
            });
          }
        }
      }
    }
  }
]);

angular.module('multi-select').run(['$templateCache',
  function ($templateCache) {
    $templateCache.put('multiSelect/main', '<multi-select-pills></multi-select-pills><input type="search" ng-model="options.search" /><multi-select-choices></multi-select-choices>');
    $templateCache.put('multiSelect/pills', '<ul class="pills" ng-show="getItems().length"><li ng-repeat="item in getItems()">{{item}}&nbsp;<a href ng-click="unselectItem(item)">x</a></li></ul>');
    $templateCache.put('multiSelect/choices', '<ul class="choices" ng-show="options.isOpen"><li ng-repeat="item in choices | filter : options.search | unselected : getItems() as filteredChoices" ng-class="{\'selected\' : $index === currentIndex }"><a href ng-click="choiceClicked(item)">{{item}}</a></li></ul>');
  }
]);
