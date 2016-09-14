angular.module('multi-select').filter('unselected', [

  function unselectedFilter() {

    return function(items, selected) {
      if (selected == null) {
        return items;
      }

      return items.filter(function(item) {
        return selected.indexOf(item) === -1;
      });
    }
  }
]);
