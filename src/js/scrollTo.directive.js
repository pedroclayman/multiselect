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
          scrollToEl.scrollIntoViewIfNeeded();
        }
      }
    }
  }
])
