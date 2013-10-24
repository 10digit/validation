angular.module('10digit.validation', ['10digit.utils']);

function tendigitvalidation_applyAsterisk(elm){
    $(document).ready(function(){
        var elm = $(elm);
        var label = (elm.prev('label').length > 0) ? elm.prev('label') : elm.parent('label');

        if(label.find('.asterisk').length == 0)
            label.append('<span class="asterisk">*</span>');
    });
}

function tendigitivalidation_removeAsterisk(elm){
    $(document).ready(function(){
        var elm = $(elm);
        var label = (elm.prev('label').length > 0) ? elm.prev('label') : elm.parent('label');

        label.find('.asterisk').remove();
    });
}

angular.module('10digit.validation')

.directive('required', function(){
	return {
		restrict: 'A',
		link: function($scope, elm, attrs){
			tendigitvalidation_applyAsterisk(elm);
		}
	}
})

.directive('ngRequired', [function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function($scope, elm, attrs, $ctrl) {
	        $scope.$watch(function(){
		        return $scope.$eval(attrs.ngRequired);
	        }, function(val){
				if(val) {
					tendigitvalidation_applyAsterisk(elm);
				} else {
					tendigitivalidation_removeAsterisk(elm);
				}
	        }, true);
        }
    };
}])

  /**
   * Check if name field consists of two words.
   *
   * @example <input type="email" ngp-valid-name-pair />
   */
.directive('ngpValidNamePair', [function() {
    return {
      restrict: 'A', // supports using directive as element, attribute and class
      require: 'ngModel',
      link: function($scope, elm, attrs, $ctrl) {
        return $scope.$watch(attrs.ngModel, function(val) {
          var result = false;
          
          // If there is defined value,
          if (typeof val != 'undefined') {
            val = val.replace(/ +(?= )/g, ''); // Trim for all spaces
            // If there exists two words,
            if (val.split(' ').length == 2) { 
              val = val.replace(/\s/g, ''); // Remove all spaces.
              // If there only exists English Characters,
              if (-1 === val.search(/[^a-zA-Z]+/)) {
                result = true;
              }
            }
          }
          $ctrl.$setValidity('ngp-valid-name-pair', result);
          return val;
        });
      }
    };
}])

  /**
   * Check if email address is valid and available.
   *
   * @param [options] {mixed} Can be an object with multiple options, or a string
   *    url {string} the url to check existance
   * @example <input type="email" ngp-valid-email="url" />
   */
.directive('ngpValidEmail', ['$ajax', function($ajax) {
    return {
      restrict: 'A', // supports using directive as element, attribute and class
      require: 'ngModel',
      link: function($scope, elm, attrs, $ctrl) {
        // Return the options for this directive
        var getOptions = function(attrs) {
          var result = {};
          if (attrs.ngpValidEmail) {
            if (attrs.ngpValidEmail == 'NOREST') {
              result = {'url': ''};
            } else {
              result = {'url': 'members/emailUsability'};
            }
          }
          result = angular.extend({tooltip: attrs.tooltip}, result)
          return result;
        };

        var opts = getOptions(attrs);

        // Check if email is formatted correctly and doesn't exist on the system.
        var validateEmail = function(email, $scope, opts) { 
          var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

          if (re.test(email)) {
            if (opts.url != '') {
                var initTooltipValue = angular.copy(attrs.tooltip)
                attrs.tooltip = 'Checking email...'
                $ctrl.$setValidity('ngp-valid-email', false);
              $ajax.run(opts.url, {'email': email, method: 'POST',
                'success': function(json) {
                  // If email is avaliable to use,
                  if (json.available) {
                    $ctrl.$setValidity('ngp-valid-email', true);
                    attrs.tooltip = 'You can use this email to register!'
                  } else {
                    $ctrl.$setValidity('ngp-valid-email', false);
                    attrs.tooltip = initTooltipValue
                  }
                }
              });
              return false;
            } else {
              return true;
            }
          }
          return false;
        };

        return $scope.$watch(attrs.ngModel, function(val) {
          var result = false;

          // If there is defined value,
          if (typeof val != 'undefined') {
            result = validateEmail(val, $scope, opts);
          }
          $ctrl.$setValidity('ngp-valid-email', result);
          return result ? val : undefined;
        });
      }
    };
}])

 /**
   * Check if phone number is valid and available.
   *
   * @param [options] {mixed} Can be an object with multiple options, or a string
   *    url {string} the url to check existance
   * @example <input type="email" ngp-valid-phone="url" />
   */
.directive('ngpValidPhone', ['$ajax', function($ajax) {
    return {
      restrict: 'A', // supports using directive as element, attribute and class
      require: 'ngModel',
      link: function($scope, elm, attrs, $ctrl) {
        // Return the options for this directive
        var getOptions = function(attrs) {
          var result = {};
          if (attrs.ngpValidPhone) {
            result = {'url': 'port-availability/'}
          }

          return result;
        };

        // Member variables
        var result, opts = getOptions(attrs);

        // Watch model for validation
        return $scope.$watch(attrs.ngModel, function(val) {
          var valid = true;
          // If there is defined value,
          if (typeof val != 'undefined' && val !== null && val != attrs['default']) {
            if (opts.url) {
              $ajax.run(opts.url + val, {
                'success': function(json) {
                  // If phone is avaliable to use,
                  if (json.available == 'yes') {
                    $ctrl.$setValidity('ngp-valid-phone', true);
                  } else {
                    $ctrl.$setValidity('ngp-valid-phone', false);
                  }
                }
              });
            }
          }
          $ctrl.$setValidity('ngp-valid-phone', valid);
          return valid ? val : undefined;
        });
      }
    };
}])

.directive('scrollToErrors', function(){
	return {
		restrict: 'A',
		link: function($scope, elm, attrs){
			var form = $scope[attrs.scrollToErrors];
            
            $(document).ready(function(){
                var elm = $(elm);
                elm.click(function(){
                    if(form.$invalid){
                        setTimeout(function(){
                            if($('.alert-error').filter(':visible').length != 0){
                                $('html, body').animate({
                                    scrollTop: $('.alert-error').filter(':visible').offset().top - 65
                                }, 500);
                            }
                        }, 50);
                    }
                });
            });
		}
	}
});
