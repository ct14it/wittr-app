/**
 * Privacy controller
 */
wittrControllers.controller('PrivacyCtrl', function($scope,wittrService) {
	$scope.wittrService = function(){
		return wittrService;
	}
});
