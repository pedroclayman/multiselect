# multiselect

A multiselect angular directive.

## Installation

Currently, the project cannot be installed via any package manager since it's still under heavy development. What you can do now is to simply reference multiselect[.min].js and multiselect.css located in the dist directory.

## Usage

Reference the 

Reference the module in your own module
```javascript
angular.module('yourModule', ['multi-select']);
```

In your controller / directive
```javascript
angular.module('yourModule').controller('ctrl', [
  '$scope',
  function ctrl($scope) {
    $scope.choices = [ 'red', 'green', 'blue' ];
    $scope.model = {
      colors: []
    };
  }

]);
```

Add a markup like this 
```html
<!-- remember the use-dot-in-ng-model rule ! -->
<multi-select choices="choices" ng-model="model.colors" close-on-select="true" placeholder="..."></multi-select>
```
... and you're good to go.
