/**
 * The wittrService used to handle the majority of app tasks. This has actually changed quite a bit
 * in it's short life so there's probably some redundant sections / variables
 */
wittrApp.factory('wittrService', function($rootScope,$http,$ionicLoading,NgMap){

	var wittrService = {
		useJavascriptMap: true,			// Whether to use the javascript or native Google Map
		pushIDReady: false,				// Whether the app is in a position to receive push notifications
		uuidReady: false,				// Whether the app has a UUID either from local storage or the API
		map: {
			_viewLat: null,				// Latitude at the centre of the screen
			_viewLng: null,				// Longitude at the centre of the screen
			_getMoreData: null,			// Used as a setTimeout to get more markers from the API
			_map: null,					// Reference to the native or javascript map object
			/**
			 * Add a marker to the map
			 * @param hash - the unique marker ID
			 * @param lat - the latitude of the marker
			 * @param lng - the longitude of the marker
			 * @param b - whether the marker is battenberg or not
			 */
			addMarker: function(hash,lat,lng,b)
			{

				// If b isn't provided set to false
				b = (typeof b == 'undefined' ? false : b);

				if(wittrService.map._map != null){

					// if using the javascript map add a javascript marker, else add a native marker
					// (both API's are slightly different so we need to separate them)
					if(wittrService.useJavascriptMap || wittrService.settings.forceJavascriptMap){
						wittrService.map.addMarkerJavascript(hash,lat,lng,b);
					}else{
						wittrService.map.addMarkerNative(hash,lat,lng,b);
					}
				}

			},
			/**
			 * Add marker to the native map instance
			 * @param hash - the unique marker ID
			 * @param lat - the latitude of the marker
			 * @param lng - the longitude of the marker
			 * @param b - whether the marker is battenberg or not
			 */
			addMarkerNative: function(hash,lat,lng,b)
			{
				b = (typeof b == 'undefined' ? false : b);
				wittrService.map._map.addMarker({
					position: new plugin.google.maps.LatLng(lat,lng),
					icon: {
						url: "www/img/" + ( hash == "ME" ? "me" : "wittee" ) + (b ? 'B' : '') + ".png"
					}
				},function(marker){
					markerHash[hash] = marker;
				});
			},
			/**
			 * Add marker to the javascript map instnace
			 * @param hash - the unique marker ID
			 * @param lat - the latitude of the marker
			 * @param lng - the longitude of the marker
			 * @param b - whether the marker is battenberg or not
			 */
			addMarkerJavascript: function(hash,lat,lng,b)
			{

				b = (typeof b == 'undefined' ? false : b);

				var pos = new google.maps.LatLng(lat,lng);
				var marker = new google.maps.Marker({
					map: wittrService.map._map,
					position: pos,
					icon: (hash == "ME" ? (b ? imageMeB : imageMe ): (b ? imageB : image)),
					draggable: true
				});

				marker.addListener('drag', function() {
					marker.setPosition(pos);
				});

				marker.hash = hash;
				markerHash[hash] = marker;

			},
			/**
			 * Remove all markers from the map
			 * (currently not in use)
			 */
			clearAllMarkersButMe: function(){

				for(var thisHash in markerHash)
				{
					if(thisHash != "ME")
					{
						markerHash[thisHash].remove();
						delete markerHash[thisHash];
					}
				}
			},
			/**
			 * Remove the marker with the provided hash from the map
			 * (currently not in use, was from previous experiment to prevent loading too many markers)
			 * @param hash
			 */
			removeMarker: function(hash)
			{
				if(wittrService.map._map != null){
					if(wittrService.useJavascriptMap || wittrService.settings.forceJavascriptMap){
						wittrService.map.removeMarkerJavascript(hash);
					}else{
						wittrService.map.removeMarkerNative(hash);
					}
				}

			},
			/**
			 * Remove native marker
			 * (currently not in use, was from previous experiment to prevent loading too many markers)
			 * @param hash
			 */
			removeMarkerNative: function(hash)
			{

			},
			/**
			 * Remove javascript marker
			 * (currently not in use, was from previous experiment to prevent loading too many markers)
			 * @param hash
			 */
			removeMarkerJavascript: function(hash)
			{

			},
			/**
			 * Starts up either the javascript or native Google Map Instance
			 * We also clear the markerHash as it's reset when the map changes
			 */
			initMap: function()
			{
				markerHash = {};
				if(wittrService.useJavascriptMap || wittrService.settings.forceJavascriptMap){
					wittrService.map.initMapJavascript();
				}else{
					wittrService.map.initMapNative();
				}
			},
			/**
			 * Set up the Native Map Instance
			 * (for good measure we clear the markerHash again, just in case)
			 */
			initMapNative: function()
			{
				markerHash = {};
				var mapDiv = document.getElementById("native_map");
				var map = plugin.google.maps.Map.getMap(mapDiv);
				wittrService.map._map = map;
				wittrService.map.readyNative(); // Native initialisation is near instant so we call readyNative() straight after

			},
			/**
			 * Set up the javascript map instance
			 */
			initMapJavascript: function()
			{
				var element = document.getElementById("javascript_map");
				NgMap.getMap({id:'javascript_map'}).then(function(map) {
					wittrService.map._map = map;
					wittrService.map.readyJavascript();	// Javascript initialisation relies on a call back, so we call readyJavascript() in a call back

				});
			},
			/**
			 * Prepare native map functionality and broadcast that the map is ready
			 * We watch the CAMERA_CHANGE event to determine when the map view has moved.
			 * Once the map has moved, but has now settled for 0.75 seconds (defined in a setTimeout stored in map._getMoreData, we call the API
			 * to get any new markers we might require
			 */
			readyNative: function()
			{

				var evtMapMove = plugin.google.maps.event.CAMERA_CHANGE;
				wittrService.map._map.on(evtMapMove, function(position) {

					if(wittrService.map._getMoreData != null){
						clearTimeout(wittrService.map._getMoreData);

					}
					wittrService.map._getMoreData = setTimeout(function(){
						wittrService.map._viewLat = position.target.lat;
						wittrService.map._viewLng = position.target.lng;
						wittrService.getWittees();
					},750);

				});

				$rootScope.$broadcast("map-ready");
			},
			/**
			 * Prepare javascript map functionality and broadcast that the map is ready
			 * We watch the 'center_changed' event to determine when the map view has moved.
			 * Once the map has moved, but has now settled for 0.75 seconds (defined in a setTimeout stored in map._getMoreData, we call the API
			 * to get any new markers we might require
			 */
			readyJavascript: function()
			{

				wittrService.map._map.addListener('center_changed', function() {

					if(wittrService.map._getMoreData != null){
						clearTimeout(wittrService.map._getMoreData);

					}

					wittrService.map._getMoreData = setTimeout(function(){

						var center = wittrService.map._map.getCenter();
						wittrService.map._viewLat = center.lat();
						wittrService.map._viewLng = center.lng();

						$rootScope.latlng = wittrService.map._map.getCenter();
						wittrService.getWittees();
					},750);

				});

				$rootScope.$broadcast("map-ready");
			},
			/**
			 * Using the provided hash as a guide, we either update an existing marker, or create a new one
			 * @param hash - the unique marker ID
			 * @param lat - the latitude of the marker
			 * @param lng - the longitude of the marker
			 * @param b - whether the marker is battenberg or not
			 */
			updateOrAddMarker: function(hash,lat,lng,b)
			{

				b = (typeof b == 'undefined' ? false : b);

				// If the marker already exists
				if (markerHash.hasOwnProperty(hash)) {

					// We update the position of the existing marker
					if(wittrService.useJavascriptMap || wittrService.settings.forceJavascriptMap){
						var newLatLng = new google.maps.LatLng(lat,lng);
						markerHash[hash].setPosition(newLatLng);
					}else{
						var newLatLng = new plugin.google.maps.LatLng(lat,lng);
						markerHash[hash].setPosition(newLatLng);
					}

					// We also update the marker icon (either standard or battenberg) if required
					wittrService.map.updateMarkerIcon(hash,b);

				}else{
					// If the marker doesn't already exist, we add a new one
					wittrService.map.addMarker(hash,lat,lng,b);

				}
			},
			/**
			 * Focus the map on the provided latitude and longitude
			 * @param lat - latitude
			 * @param lng - longitude
			 */
			setCenter: function(lat,lng)
			{
				if(wittrService.useJavascriptMap || wittrService.settings.forceJavascriptMap) {
					wittrService.map.setCenterJavascript(lat,lng);
				}else{
					wittrService.map.setCenterNative(lat,lng);
				}
			},
			/**
			 * Focus the centre of the native map, this uses an animation to get to the provided location
			 * @param lat - latitude
			 * @param lng - longitude
			 */
			setCenterNative: function(lat,lng)
			{
				wittrService.map._map.animateCamera({
					'target': new plugin.google.maps.LatLng(lat,lng),
					'tilt': 60,
					'zoom': 12,
					'bearing': 0
				});
			},
			/**
			 * Focus the map javascript map on the provided latitude and longitude
			 * @param lat - latitude
			 * @param lng - longitude
			 */
			setCenterJavascript: function(lat,lng) {
				wittrService.map._map.setCenter(new google.maps.LatLng(lat,lng));
			},
			/**
			 * Update the icon of a marker to either the standard one or the battenberg one
			 * @param hash - UUID of the marker
			 * @param b - true = battenberg , false = standard
			 */
			updateMarkerIcon: function(hash,b)
			{
				if(wittrService.useJavascriptMap || wittrService.settings.forceJavascriptMap){
					wittrService.map.updateMarkerIconJavascript(hash,b);
				}else{
					wittrService.map.updateMarkerIconNative(hash,b);
				}
			},
			/**
			 * Update the icon of a native marker
			 * @param hash - UUID of the marker
			 * @param b - true = battenberg , false = standard
			 */
			updateMarkerIconNative: function(hash,b)
			{
				markerHash[hash].setIcon( {url: "www/img/" + ( hash == "ME" ? "me" : "wittee" ) + (b ? 'B' : '') + ".png" });
			},
			/**
			 * Update the icon of a javascript marker
			 * @param hash - UUID of the marker
			 * @param b - true = battenberg , false = standard
			 */
			updateMarkerIconJavascript: function(hash,b)
			{
				markerHash[hash].setIcon( (hash == "ME" ? (b ? imageMeB : imageMe ): (b ? imageB : image)) );
			}
		},
		/*wittees: [],*/
		inForeground: true,				// Whether the app is running in the foreground or the background
		uuid: '',						// The UUID of this install
		userID: '',						// The OneSignal user id
		deviceID: '',					// The OneSignal device id
		latitude: '',					// Your current latitude
		longitude: '',					// Your current longitude
		lastLocated: new Date(),		// When you were last located
		lastPublished: new Date(),		// When your position was last published
		/**
		 * The Settings object contains user defined values (except demoSeen which is set after seeing the intro) for a set of variables
		 * Each time this object changes, it is saved to local storage
		 */
		settings: {
			canSubmit: true,					// Can the app submit position
			submitIntervalInMinutes: "60",		// How often can the app submit your position
			fuzzDistance: "0.1",				// The level of fuzz to apply to the position before submitting
			demoSeen: false,					// Has the intro been seen yet? If not show the intro
			forceJavascriptMap: false			// Force the use of the javascript maps instance (in case there are issues for users with the native one)
		},
		/**
		 * The user can set which demographics they are a member of from the Demographics screen.
		 * Each time a value is changed, the updated set is sent to the
		 */
		demographics: {
			pipeSmoker: false,
			ltl: false,
			clergyCorner: false,
			ceramicistsCorner: false,
			norwegianBranch: false,
			colonialCommoner: false,
			cravateer: false,
			diafls: false,
			aals: false,
			pils: false,
			hils: false,
			ncg: false,
			iji: false,
			niji: false,
			battenberg: false
		},
		/**
		 * Get a UUID from the remote API. Originally the app used the OneSignal userID/deviceID combo, but it doesn't work on all platforms
		 * See the Wittr-API repo for more details.
		 */
		getUUID: function(){
			
			$http({
				method: 'POST',
				url: wittrService.getApiURL() + "id",
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj){
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					}
					return str.join("&");
				},
				data: {
					userID: wittrService.userID,
					deviceID: wittrService.deviceID
				}

			})
				.success(function (data, status, headers, config) {

					if(data.success){
						wittrService.uuid = data.id;
						wittrService.uuidReady = true;
						$ionicLoading.hide();
					}else{
						$ionicLoading.show({template: "Error getting UUID", duration: 2000});
					}

				})
				.error(function (data, status, headers, config) {
					$ionicLoading.show({template: "Error getting UUID", duration: 2000});
				});
		},
		_submitInterval: (1000 * 60 * 60),		// By default, how often the app should resubmit it's position to the API (1000 * 60 * 60) == 1 Hour
		/**
		 * Update the submit interval to the new time
		 * @param minutes - new interval time in minutes
		 */
		setSubmitInterval: function(minutes){
			minutes = (typeof minutes != 'undefined') ? minutes : parseInt(wittrService.settings.submitIntervalInMinutes);
			minutes = isInt(minutes) ? parseInt(minutes) : 60;
			// The minimum interval time is one minute
			if (minutes < 1){
				minutes = 1;
			}

			// 1000 = 1 seconds, 60,000 = 1 minute
			wittrService._submitInterval = minutes * 60000;

			// If we have a interval already set up, we clear it
			if(wittrService.submitIntervalPointer != null){
				clearInterval(wittrService.submitIntervalPointer);
			}

			// Record the new interval
			wittrService.submitIntervalPointer = setInterval(function(){
				wittrService.attemptGetLocation();
			},wittrService._submitInterval);
		},
		submitIntervalPointer: null,				// used to store the location submission interval
		gettingLocation: false,						// whether the app thinks it's waitinf for feedback from the geolocation plugin or not
		/**
		 * Attempt to get the current location of the device, this may cause a prompt to show up on iOS devices and newer Android devices
		 */
		attemptGetLocation: function(){
			if(!wittrService.gettingLocation){
				navigator.geolocation.getCurrentPosition(wittrService.getLocationSuccess,
					wittrService.getLocationError);
			}

		},
		/**
		 * Go into the foreground
		 */
		goForground: function(){
			wittrService.inForeground = true;
		},
		/**
		 * Go into the background
		 */
		goBackground: function(){
			wittrService.inForeground = false;
		},
		/**
		 * Callback for when the geolocation attempt was a success
		 * @param position
		 */
		getLocationSuccess: function(position){

			wittrService.gettingLocation = false;					// We are no longer getting the location
			wittrService.lastLocated = new Date();					// Update last located date
			wittrService.latitude = position.coords.latitude;		// Record the provided latitude
			wittrService.longitude = position.coords.longitude;		// Record the provided longitude

			// Update the location of my marker ("ME")
			wittrService.map.updateOrAddMarker("ME",position.coords.latitude,position.coords.longitude,wittrService.demographics.battenberg);

			// Center the map on the new marker
			wittrService.map.setCenter(position.coords.latitude,position.coords.longitude);

			// If the user has allowed the app to publish it's location to the API, attempt to do so
			if(wittrService.settings.canSubmit){
				wittrService.publishLocation(false);
			}

			$ionicLoading.hide();
			$rootScope.$broadcast('position-updated');
			$rootScope.$apply();
		},
		/**
		 * Call back when there is an error getting location
		 * @param error
		 */
		getLocationError: function(error){
			wittrService.gettingLocation = false;					// We are no longer getting the location
			console.error(error);
		},
		/**
		 * Publish the current position of the user to the API, if this was a user instigated request (foreground == true)
		 * We show status popups after a request if there are issues
		 * @param foreground - Bool - whether this was a user instigated publication or a routine one
		 */
		publishLocation:function(foreground){

			foreground = (typeof foreground != 'undefined') ? foreground : false;

			var latFuzz = (parseFloat(wittrService.settings.fuzzDistance) * Math.random()) - (parseFloat(wittrService.settings.fuzzDistance) * 0.5);
			var lngFuzz = (parseFloat(wittrService.settings.fuzzDistance) * Math.random()) - (parseFloat(wittrService.settings.fuzzDistance) * 0.5);

			$http({
				method: 'POST',
				url: wittrService.getApiURL() + "locate/",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj){
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					}
					return str.join("&");
				},
				data: {
					uuid: wittrService.uuid,
					userID: wittrService.userID,
					deviceID: wittrService.deviceID,
					latitude: wittrService.latitude + latFuzz,
					longitude: wittrService.longitude + lngFuzz
				}
			})
				.success(function (data, status, headers, config) {

					wittrService.lastPublished = new Date();

					if(typeof data.success == 'undefined' || !data.success){
						if(foreground) {
							if (data.error != '') {
								$ionicLoading.show({template: data.error, duration: 2000});
							} else {
								$ionicLoading.show({template: "Error updating location", duration: 2000});
							}
						}
					}else{

					}

				})
				.error(function (data, status, headers, config) {
					if(foreground) {
						$ionicLoading.show({template: "Error updating location", duration: 2000});
					}
				});


		},
		/**
		 * Post the demographics object to the API. This is called each time a demographic is changed
		 * TODO - make this more flexible, so I don't have to individually type each demographic, make it so the app can receive demographic types as well
		 */
		updateDemographics:function(){

			if(wittrService.forceJavascriptMap || wittrService.useJavascriptMap){
				markerHash["ME"].setIcon("img/me" + (wittrService.demographics.battenberg ? 'B' : '') + ".png");
			}else{
				markerHash["ME"].setIcon("www/img/me" + (wittrService.demographics.battenberg ? 'B' : '') + ".png");
			}


			$http({
				method: 'POST',
				url: wittrService.getApiURL() + "demographics/",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj){
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					}
					return str.join("&");
				},
				data: {
					uuid: wittrService.uuid,
					userID: wittrService.userID,
					deviceID: wittrService.deviceID,
					pipeSmoker: (wittrService.demographics.pipeSmoker ? 1 : 0),
					ltl: (wittrService.demographics.ltl ? 1 : 0),
					clergyCorner: (wittrService.demographics.clergyCorner ? 1 : 0),
					ceramicistsCorner: (wittrService.demographics.ceramicistsCorner ? 1 : 0),
					norwegianBranch: (wittrService.demographics.norwegianBranch ? 1 : 0),
					colonialCommoner: (wittrService.demographics.colonialCommoner ? 1 : 0),
					cravateer: (wittrService.demographics.cravateer ? 1 : 0),
					diafls: (wittrService.demographics.diafls ? 1 : 0),
					aals: (wittrService.demographics.aals ? 1 : 0),
					pils: (wittrService.demographics.pils ? 1 : 0),
					hils: (wittrService.demographics.hils ? 1 : 0),
					ncg: (wittrService.demographics.ncg ? 1 : 0),
					iji: (wittrService.demographics.iji ? 1 : 0),
					niji: (wittrService.demographics.niji ? 1 : 0),
					battenberg: (wittrService.demographics.battenberg ? 1 : 0)

				}
			})
				.success(function (data, status, headers, config) {
					if(typeof data.success == 'undefined' || !data.success){
						if(data.error != ''){
							$ionicLoading.show({template: data.error, duration: 2000});
						}else{
							$ionicLoading.show({template:"Error updating demographics", duration: 2000});
						}
					}
				})
				.error(function (data, status, headers, config) {
					$ionicLoading.show({template: "Error updating demographics", duration: 2000});
				});
		},
		/**
		 * Get Wittees from the remote API using the lat/lng of the current map position as a centre point
		 * TODO - Allow the app to specify the radius for searches as well as the max number of items that can be returned.
		 */
		getWittees: function(){

			$http({
				method: 'POST',
				url: wittrService.getApiURL() + "wittees/",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj){
						str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					}
					return str.join("&");
				},
				data: {
					uuid: wittrService.uuid,
					userID: wittrService.userID,
					deviceID: wittrService.deviceID,
					latitude: wittrService.map._viewLat,
					longitude: wittrService.map._viewLng
				}
			})
				.success(function (data, status, headers, config) {
					if(typeof data.success == 'undefined' || !data.success){
						if(data.error != ''){
							$ionicLoading.show({template: data.error, duration: 2000});
						}else{
							$ionicLoading.show({template:"Error getting Wittees", duration: 2000});
						}
					}else{

						for(var i = 0; i < data.wittees.length; i++){
							var r = data.wittees[i];
							wittrService.map.updateOrAddMarker(r.hash,r.latitude,r.longitude,r.bb);
						}

					}
				})
				.error(function (data, status, headers, config) {
					$ionicLoading.show({template: "Error getting Wittees", duration: 2000});
				});
		},
		/**
		 * Helper function to construct the API URL, based mainly on the develop variable set in js/app.js
		 * @returns {*}
		 */
		getApiURL: function(){
			if(developer){
				if(typeof device != 'undefined' && device.platform == "Android"){
					return "http://localhost:5001/av2/";
				}else{
					return "http://wittr.local/av2/";
				}

			}else{
				return "https://wittr.ct14hosted.co.uk/av2/";
			}
		},
		mapSystemChange: false,						// Whether the map system has been changed while the app is loaded (from the settings screen)
		/**
		 * Instigate the change of map
		 */
		startMapSystemChange: function(){
			wittrService.mapSystemChange = true;
		}

	};

	/**
	 * Wait 0.3 seconds and then load whatever details are available from local storage
	 * TODO - Remove the requirement of a timeout, it's messy.
	 */
	setTimeout(function(){

		// Load the settings object and set the submit interval based on this
		if(typeof localStorage['settings']!='undefined'){
			wittrService.settings = JSON.parse(localStorage['settings']);
			if(typeof wittrService.settings.fuzzDistance == 'undefined')
			{
				wittrService.settings.fuzzDistance = 0.1;
			}
			wittrService.setSubmitInterval();
		}else{
			wittrService.setSubmitInterval();
		}

		// Load the demographics using the extend function (allowing the app to update demographics without breaking the local save
		if(typeof localStorage['demographics']!='undefined') {
			wittrService.demographics = angular.extend(wittrService.demographics,JSON.parse(localStorage['demographics']));
		}

		// Load the OneSignal provided userID
		if(typeof localStorage['userID']!='undefined') {
			wittrService.userID = localStorage['userID'];
		}

		// Load the OneSignal provided deviceID
		if(typeof localStorage['deviceID']!='undefined') {
			wittrService.deviceID = localStorage['deviceID'];
		}

		// Load the API provided UUID
		if(typeof localStorage['uuid']!='undefined') {
			wittrService.uuid = localStorage['uuid'];
		}

		// Force a rootScope apply to make sure the whole app is aware of these changes (messy but unfortunately required)
		$rootScope.$apply();

	},300);


	/**
	 * We prevent the app from being able to use $watch to save variables until after we are sure they're all loaded.
	 * TODO - come up with a more elegant solution to this, yuck.
	 */
	var canSave = false;
	setTimeout(function() {
		canSave = true;
	},350);

	/**
	 * Watch the settings object for changes, if they occur and we can save (canSave), we write the changes
	 * to local storage
	 */
	$rootScope.$watch(function () {
		return wittrService.settings;
	}, function (newVal,oldVal) {
		if(canSave){
			localStorage['settings'] = JSON.stringify(wittrService.settings);
			// If the map setting has changed
			if(newVal.forceJavascriptMap != oldVal.forceJavascriptMap)
			{
				/**
				 * If the user isn't already forced to use the javascript map and we've instigated a change of map
				 * from the settings screen, we cheat at reloading the app (by making it load the index.html file again)
				 * This is required because ng-map / native map can interfere with each other as they have similar references
				 */

				if(!wittrService.useJavascriptMap)
				{
					if(wittrService.mapSystemChange){
						document.location.href = 'index.html'; // RELOAD CHEAT LINE!
					}
				}
			}

		}
	}, true);

	/**
	 * Watch the demographics object and if it changes, write it to local storage
	 */
	$rootScope.$watch(function () {
		return wittrService.demographics;
	}, function () {
		if(canSave){
			localStorage['demographics'] = JSON.stringify(wittrService.demographics);
		}
	}, true);

	/**
	 * Watch the DeviceID and write it to local storage when it changes
	 */
	$rootScope.$watch(function(){
		return wittrService.deviceID;
	},function(){
		if(canSave){
			localStorage['deviceID'] = wittrService.deviceID;
		}
	});

	/**
	 * Watch the UserID and write it to local storage when it changes
	 */
	$rootScope.$watch(function(){
		return wittrService.userID;
	},function(){
		if(canSave){
			localStorage['userID'] = wittrService.userID;
		}
	});

	/**
	 * Watch the UUID and write it to local storage when it changes
	 */
	$rootScope.$watch(function(){
		return wittrService.uuid;
	},function(){
		if(canSave){
			localStorage['uuid'] = wittrService.uuid;
		}
	});

	return wittrService;

});
