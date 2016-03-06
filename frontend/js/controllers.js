"use strict";

const app = angular.module("testAngular", ["getJson", "createMap", "ngMap"]);

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
app.controller("SearchCtrl", ($scope) => {

	// Another bit of magic, this string is auto populated by an input field thats bound to it
	// If any part of the string is matched, it's show up!
	$scope.searchParks = "";

});

// Controller to handle searching
app.controller("DetailsController", ($scope, $http, $rootScope, NgMap) => {

	$scope.triggerDetails = (item) => {

		$scope.map.showInfoWindow('detailsWindow', item);

	}

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