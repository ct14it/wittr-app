/**
 * Code of conduct controller
 */
wittrControllers.controller('CodeOfConductCtrl', function($scope,wittrService) {
	$scope.wittrService = function(){
		return wittrService;
	};

	/**
	 * Open the BBC hosted Code Of Conduct
	 */
	$scope.openPDF = function(){
		window.open(encodeURI('http://www.bbc.co.uk/5live/films/code_of_conduct.pdf'), '_system');
	};
});
