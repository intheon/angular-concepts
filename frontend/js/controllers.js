"use strict";

const app = angular.module("testAngular", ["getJson", "ngMap", "mapService"]);

// Controller for getting data from server and presenting to view
app.controller("ListCtrl", ($scope, $http, $rootScope, getJson) => {


	// Initialise array to store databases response
	$scope.allData = [];

	getJson.success((response) => {

		// Store the response in the array
		$scope.allData = response;

	}).then((response) => {

			// Tell the map controller to do its thing
			$rootScope.$broadcast("runMapCtrl");

		});

});


// Controller to handle ratings / upvotes
app.controller("RatingCtrl", ($scope, $http) => {

	// A button in the view fires this method
	// It's bound to the scope, so automagically updates
	$scope.incrementRating = (item) => {

		item.skateparkRating += 1;

		// Send put request to server
		$http.put("/skateparks/" + item._id, item).success((response) => {

			// Update the scope
			console.log(response);

		});

	};

});

// Controller to handle searching
app.controller("SearchCtrl", ($scope, $http, $rootScope, NgMap) => {


    $scope.$watch('searchString', function(newValue, oldValue) {

    	let payload = null;

    	if (newValue) payload = newValue;

    	$rootScope.$broadcast("filterMarkers", newValue);
    });

});

// Controller to handle searching
app.controller("DetailsController", ($scope, $http, $rootScope, NgMap, searchPark) => {

	$scope.triggerDetails = (item) => {

		$scope.map.showInfoWindow('detailsWindow', item);

	}

});



app.controller("MapCtrl", ($scope, $http, $rootScope, NgMap, mapService) => {

	// This is fired after the server has done it's thing
	$rootScope.$on("runMapCtrl", () => {

		$scope.map = null;

		// Get the map instance
		NgMap.getMap().then((map) => {
			$scope.map = map;

			// Map map clickable
			mapService.listenForMarkers($scope.map);

		});

		// Not using an arrow function as it messes up the reference to 'this'
		$scope.showSkateparkDetails = function(event, skatepark) {
			$scope.currentSkatepark = skatepark;
		    $scope.map.showInfoWindow('detailsWindow', this);
		};

	});

	$rootScope.$on("filterMarkers", function(event, data){

		$scope.parks = data;

	});

	$rootScope.$on("pushLastToScope", function(event, data){

		$scope.allData.push(data);

	});

});