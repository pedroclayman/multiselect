angular.module('multi-select').directive('multiSelectPills', [
  function multiSelectDirective() {
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
          console.log('pills');
        }

        scope.$on('$destroy', function() {
          msCtrl.unregisterCtrl('pills');
        });
      },
      controller: [multiSelectPillsCtrl]
    }
  }
]);
