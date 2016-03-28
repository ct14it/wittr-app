/**
 * About View Controller
 */
wittrControllers.controller('AboutCtrl', function($scope,wittrService) {
	$scope.wittrService = function(){
		return wittrService;
	}
});
