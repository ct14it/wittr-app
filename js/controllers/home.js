/**
 * Javascript map view controller
 */
wittrControllers.controller('HomeCtrl', function($scope,wittrService,$ionicLoading) {

	$scope.wittrService = function(){
		return wittrService;
	};



	$scope.googleMapsUrl="https://maps.googleapis.com/maps/api/js?key=" + googleMapsJavascriptAPIKey;

	/**
	 * AngularJS has a habit of attempting to load scripts before the DOM is fully loaded, this has caused
	 * the app to try and init a div that does not yet exist. We lazily wait 0.75 seconds before attempting to
	 * load the map
	 */
	setTimeout(function(){
		$scope.wittrService().map.initMap();
	},750);


	/**
	 * Attempt to get the current location.
	 * wittrService.attemptGetLocation() handles a successful attempt
	 * at getting your location and recentres the map.
	 * TODO - Reports of app not actually bothering to attempt centering
	 */
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
	 * When the map is first initialised we attempt to centre the map
	 * map-ready is broadcast by wittrService.map.readyNative/readyJavascript
	 */
	$scope.$on('map-ready',function(){
		console.log("Attempting centreOnMe");
		$scope.centerOnMe();
	});

});
