/**
 * Base App Controller
 */
wittrControllers.controller('AppCtrl', function($rootScope,$scope, $ionicModal, $timeout, wittrService,$ionicSideMenuDelegate,$location) {



	$scope.devicePlatform = 'browser';
	$scope.appName = 'Wittr';

	/**
	 * We have two home screens (with the map), one using the Javascript Google Maps API
	 * and the other using the Native Google Maps API
	 */
	$scope.goHome = function(){
		if(wittrService.useJavascriptMap || wittrService.settings.forceJavascriptMap)
		{
			$location.path("/app/home");
		}else{
			$location.path("/app/homenative");
		}

		if (!$scope.$$phase) $scope.$apply()
	};

	/**
	 * Ionic Framework sidemenu system doesn't play well with Native maps
	 * so we have to hide/show the sidemenu as required.
	 */
	$scope.$watch(function(){
		return $ionicSideMenuDelegate.getOpenRatio();
	}, function(newValue, oldValue) {
		if (newValue == 0){
			$scope.hideLeft = true;
		} else{
			$scope.hideLeft = false;
		}
	});

	/**
	 * When the device and all scripts are loaded
	 */
	document.addEventListener('deviceready', function () {
		// Enable to debug issues.
		// window.plugins.OneSignal.setLogLevel({logLevel: 4, visualLevel: 4});
		var notificationOpenedCallback = function(jsonData) {
			// TODO - Process incoming push notification data
		};

		/**
		 * Set the app name based on the supplied device platform
		 * iOS = iWittr / Other = Wittr
		 */
		if(typeof device != 'undefined'){
			$scope.devicePlatform = device.platform;
			if($scope.devicePlatform == 'iOS'){
				$scope.appName = 'iWittr';
			}else{
				$scope.appName = 'Wittr';
			}
		}else{
			$scope.devicePlatform = 'browser';
			$scope.appName = 'Wittr';
		}

		/**
		 * If using the browser or the windows platform, we force the use of the javascript
		 * Google Maps API. Android/iOS platforms can use the Native API as well as receive
		 * push notifications via the One Signal system
		 */
		if(typeof device == "undefined" || device.platform == "windows"){
			wittrService.useJavascriptMap = true;
			wittrService.pushIDReady = false;
		}else{
			wittrService.useJavascriptMap = false;
			window.plugins.OneSignal.init("36844440-bccd-4650-b802-e5f70000d7df",
				{googleProjectNumber: "892589107284"},
				notificationOpenedCallback);

			// Show an alert box if a notification comes in when the user is in your app.
			window.plugins.OneSignal.enableInAppAlertNotification(true);

			window.plugins.OneSignal.getIds(function(ids) {
				wittrService.pushIDReady = true;
				wittrService.userID =  ids.userId;
				wittrService.deviceID = ids.pushToken;
			});
		}

	}, false);

	/**
	 * When the app is brought to the foreground we let the wittrService know
	 */
	document.addEventListener("resume", function() {
		wittrService.goForground();
	}, false);

	/**
	 * When the app is put to the background we let the wittrService know
	 */
	document.addEventListener("pause", function() {
		wittrService.goBackground();
	}, false);

	$rootScope.me = null; // TODO - Check if still relevant!

});
