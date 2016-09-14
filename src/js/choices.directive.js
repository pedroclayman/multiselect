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
