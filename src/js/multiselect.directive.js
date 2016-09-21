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

              var resolvedItem = scope.resolveValueByItem(item);

              if (ngModelCtrl.$modelValue == null) {
                scope.model = [resolvedItem];
              }
              else{
                // todo error handling
                scope.model.push(resolvedItem);
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
            var ngModelCtrl = ctrls[0];
            var ctrl = ctrls[1];

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

            scope.resolveAbbrevationByItem = function(item) {
              if (attrs.abbrevationKey) {
                var getter = $parse(attrs.abbrevationKey);
                var abbrevation = getter(item);

                if (abbrevation) {
                  return abbrevation;
                }
              }
              return scope.resolveLabelByItem(item);
            }

            scope.resolveLabelByItem = function(item) {
              if (attrs.labelKey) {
                var getter = $parse(attrs.labelKey);
                var label = getter(item);

                if (label) {
                  return label;
                }
              }
              return item;
            }

            scope.resolveValueByItem = function(item) {
              if (attrs.labelValue) {
                var getter = $parse(attrs.labelValue);
                return getter(item);
              }
              return item;
            }

            scope.resolveItemsFromCollectionByValue = function(collection, value) {
              var getter;
              if (attrs.labelValue) {
                getter = $parse(attrs.labelValue);
              }
              else {
                getter = function(item) { return item };
              }

              return collection.filter(function(item) {
                return getter(item) === value;
              });
            }

            scope.resolveChoiceByValue = function(value) {
              var filteredChoices = scope.resolveItemsFromCollectionByValue(scope.choices, value);

              if (filteredChoices != null || filteredChoices.length > 0) {
                return filteredChoices[0];
              }
              return null;
            }

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
    $templateCache.put('multiSelect/pills', '<ul class="pills" ng-show="model != null && model.length"><li ng-class="{\'selected\' : $index === options.selectedPillIndex }" ng-repeat="item in model">{{resolveAbbrevationByItem(resolveChoiceByValue(item))}}&nbsp;<a tabindex="-1" href ng-click="unselectItem(item)">x</a></li></ul>');
    $templateCache.put('multiSelect/choices', '<ul class="multi-select-choices" ng-show="options.isOpen" tabindex="-1"><li ng-repeat="item in choices | filter : options.search | unselected : model : resolveValueByItem as filteredChoices" ng-class="{\'selected\' : $index === currentIndex }"><a tabindex="-1" ng-click="choiceClicked(item, $event)">{{resolveLabelByItem(item)}}</a></li></ul>');
  }
]);
