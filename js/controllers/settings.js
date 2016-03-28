/**
 * Settings controller
 */
wittrControllers.controller('SettingsCtrl', function($scope,wittrService,$ionicPopover) {

	$scope.wittrService = function(){
		return wittrService;
	};


	$scope.showFuzzPopover = function($event){
		$scope.fuzzPopover.show($event);
	};

	/**
	 * Simple popover explaining how the fuzz system works
	 */
	$ionicPopover.fromTemplateUrl('fuzz-popover.html', {
		scope: $scope
	}).then(function(popover) {
		$scope.fuzzPopover = popover;
	});
	
});
