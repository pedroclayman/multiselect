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
