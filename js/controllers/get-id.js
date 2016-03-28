/**
 * Get Ready / ID holding page.
 * This page dispalys until the app status is deemed ready
 */
wittrControllers.controller('GetIDCtrl', function($scope,wittrService,$location) {

	$scope.wittrService = function(){
		return wittrService;
	};

	/**
	 * Allow the app to sort itself out and give the user a chance to realise
	 * the app is waiting for something to config (instead of flashing view on the screen for 0.1 seconds
	 * If the app already has a UUID we use that.
	 */
	setTimeout(function(){
		if(wittrService.uuid != ''){
			$scope.wittrService().uuidReady = true;
			$scope.$apply();
		}else{
			wittrService.getUUID();
		}
	},1000);

	/**
	 * Every 0.25 seconds we check to see if the app has received it's UUID from either local storage
	 * or via the API. If the user hasn't seen the demo, they see that, else they go home.
	 */
	var checkInterval = setInterval(function(){
		if($scope.wittrService().uuidReady == true){
			if($scope.wittrService().settings.demoSeen){
				$scope.goHome();
			}else{
				$location.path("/app/demo");
			}
			$scope.$apply();
			clearInterval(checkInterval);
		}
	},250);

});

