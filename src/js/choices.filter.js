angular.module('multi-select').filter('unselected', [

  function unselectedFilter() {

    return function(items, selected) {

      return items.filter(function(item) {
        return selected.indexOf(item) === -1;
      });
    }
  }
]);
