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
              if (scope.options.isOpen && scope.currentIndex > -1) {
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

        function _recomputePosition() {
          choicesEl.style.width = msEl.clientWidth + 'px';

          var elRect = msEl.getBoundingClientRect();

          var offsetBottom = (parseFloat(window.getComputedStyle(msEl).paddingBottom) || 0) + (parseFloat(window.getComputedStyle(msEl).borderBottom) || 0);
          var offsetLeft = (parseFloat(window.getComputedStyle(msEl).paddingLeft) || 0) + (parseFloat(window.getComputedStyle(msEl).borderLeft) || 0);

          choicesEl.style.left = (elRect.left + offsetLeft) + 'px';
          choicesEl.style.top = (elRect.bottom + offsetBottom) + 'px';
        }

        var unregisterModelWatch;

        scope.$watch('options.isOpen',
          function(newVal, oldVal) {
            if (newVal !== oldVal) {
              if (newVal) {
                _recomputePosition();
                bodyEl.appendChild(choicesEl);
                choicesEl.addEventListener('focusin', _choiceHandler);

                unregisterModelWatch = scope.$watch('model', function() {
                  $timeout(function() {
                    _recomputePosition();
                  });
                });
              }
              else {
                if (unregisterModelWatch != null) {
                  unregisterModelWatch();
                  unregisterModelWatch = null;
                }

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
