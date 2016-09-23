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
                    scope.options.selectedPillIndex = -1;
                  }
                  else {
                    scope.options.selectedPillIndex--;
                  }
                }
                // remove last element if no pill is selected
                else if (modelLength > 0) {
                  scope.model.splice(modelLength - 1, 1);
                }
              break;
              case constants.KEY.DELETE:
                  if (scope.options.selectedPillIndex > -1) {
                    scope.model.splice(scope.options.selectedPillIndex, 1);

                    if (modelLength === 0) {
                      scope.options.selectedPillIndex = -1
                    }
                    else {
                      scope.options.selectedPillIndex = Math.min(modelLength - 2, scope.options.selectedPillIndex);
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
