/**
 * Native map view controller
 */
wittrControllers.controller('HomeNativeCtrl', function($scope,wittrService,$ionicLoading) {

	$scope.wittrService = function(){
		return wittrService;
	};

	/**
	 * Init the native map when we first load this controller
	 */
	$scope.wittrService().map.initMap();

	$scope.centerOnMe = function () {
		if ($scope.wittrService().map._map == null) {
			console.log("No Map  yet");
			return;
		}

		$ionicLoading.show({
			template: 'Getting current location...',
			showBackdrop: false,
			duration: 5000
		});

		wittrService.attemptGetLocation();

	};

	/**
	 * Wait 1.5 seconds before attempting to centre to allow slower devices
	 * to load fully.
	 * TODO - More elegant loading solution. setTimeout is wrong, WRONG I SAY
	 */
	setTimeout(function(){
		console.log("Attempting centreOnMe");
		$scope.centerOnMe();
	},1500);

});
