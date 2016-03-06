"use strict";

const app = angular.module("testAngular", ["getJson", "createMap", "ngMap"]);

// Controller for getting data from server and presenting to view
app.controller("ListCtrl", ($scope, $http, $rootScope, getJson) => {


	$scope.positions =[ [40.71, -74.21], [40.72, -74.20], [40.73, -74.19],
      [40.74, -74.18], [40.75, -74.17], [40.76, -74.16], [40.77, -74.15]];


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
app.controller("SearchCtrl", ($scope) => {

	// Another bit of magic, this string is auto populated by an input field thats bound to it
	// If any part of the string is matched, it's show up!
	$scope.searchParks = "";

});

app.controller("MapCtrl", ($scope, $http, $rootScope, NgMap) => {


	// This is fired after the server has done it's thing
	$rootScope.$on("runMapCtrl", () => {

		NgMap.getMap().then((map) => {
			$scope.map = map;
		});

		$scope.showSkatepark = function(event, skatepark) {
			$scope.currentSkatepark = skatepark;
		    $scope.map.showInfoWindow('detailsWindow', this);
		  };


	});






});