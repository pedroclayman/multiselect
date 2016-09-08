angular.module('app', ['multi-select'])

.controller('app', [
  '$scope',
  function($scope) {
    $scope.options = [
      'one fish',
      'two fish',
      'red fish',
      'blue fish'
    ];

    $scope.model = {
      selections: []
    };

    var msElement = angular.element(document.querySelector('multi-select'));

    $scope.open = function() {
      var msCtrl = msElement.controller('multiSelect');
      msCtrl.open();
    }

    $scope.close = function() {
      var msCtrl = msElement.controller('multiSelect');
      msCtrl.close();
    }
  }
]);

angular.element(document).ready(function() {
  angular.bootstrap(document, ['app']);
});
