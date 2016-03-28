/**
 * Demographics Controller
 */
wittrControllers.controller('DemographicsCtrl', function($scope,wittrService) {
	$scope.wittrService = function(){
		return wittrService;
	}

});
