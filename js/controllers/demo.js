/**
 * Intro controller
 */
wittrControllers.controller('DemoCtrl', function($scope,wittrService,$location,$ionicSlideBoxDelegate) {
	$scope.wittrService = function(){
		return wittrService;
	};

	$scope.finishedDemo = function(){
		setTimeout(function(){
			$ionicSlideBoxDelegate.slide(0,1000);
		},1000);
		$scope.wittrService().settings.demoSeen = true;
		$scope.goHome();
	}

});