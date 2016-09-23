// copied from this blog here https://davidwalsh.name/javascript-debounce-function
// inspired by the underscore implementation
angular.module('multi-select').factory('msDebounce', [

  function debounceFactory() {
    return function debounce(func, wait, immediate) {
      	var timeout;
      	return function() {
      		var context = this, args = arguments;
      		var later = function() {
      			timeout = null;
      			if (!immediate) func.apply(context, args);
      		};
      		var callNow = immediate && !timeout;
      		clearTimeout(timeout);
      		timeout = setTimeout(later, wait);
      		if (callNow) func.apply(context, args);
      	};
      };
  }
]);
