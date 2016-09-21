angular.module('multi-select').filter('unselected', [

  function unselectedFilter() {

    // items are choices
    // selected is model

    return function(items, selected, valueResolveFn) {
      if (selected == null) {
        return items;
      }

      return items.filter(function(item) {
        return selected.indexOf(valueResolveFn(item)) === -1;
      });
    }
  }
]);
