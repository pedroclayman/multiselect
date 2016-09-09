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
          // var boundingRect = scrollToEl.getBoundingClientRectangle();
          // var offsetTop = boundingRect.top;
          // var height = boundingRect.height;
          //
          // var parent = scrollToEl.parentElement;
          // var parentHeight = parent.scrollHeight;
          //
          // if ()
        }
      }
    }
  }
])
