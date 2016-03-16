"use strict";

const app = angular.module("ngSkateApp", ["getJson", "ngMap", "mapService"]);

// Controller for getting data from server and presenting to view
app.controller("ListCtrl", ($scope, $http, $rootScope, getJson) => {


	// Initialise array to store databases response
	$scope.allData = [];

	$scope.fake = [
		{
			skateparkLocation: [0, 0]
		}
	]

	$scope.rev = (array) => {
		let copy = [].concat(array);
			return copy.reverse();
	};


	getJson.success((response) => {

		// Store the response in the array
		$scope.allData = response;

		console.log($scope.allData);


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
			// the server doesnt give a response upon success 
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

// Controller for Google maps presentation, marker and infoWindow logic
app.controller("MapCtrl", ($scope, $http, $rootScope, NgMap, mapService) => {

	var inst = this;

	// This is fired after the server has done it's thing
	$rootScope.$on("runMapCtrl", () => {

		// Get the map instance
		NgMap.getMap().then((map) => {
			inst.map = map;

			// Map map clickable
			mapService.createMarker(inst.map);

			// Show at least one so it gets added to the DOM
		    inst.map.showInfoWindow('detailsWindow', "showMePlease");

			$scope.fake = [];




			// Remove the horrible default infowindow style
			// This is a hack and I hate using setTimeout, but Google don't let you modify the infoWindow easily!
			setTimeout(() => {

				inst.map.hideInfoWindow('detailsWindow', "showMePlease");


			
				const iwOuter = $('.gm-style-iw');
				const iwBackground = iwOuter.prev();

				iwBackground.children(':nth-child(2)').css({'display' : 'none'});

				// Remove the white background DIV
				iwBackground.children(':nth-child(4)').css({'display' : 'none'});

			}, 1)


		});

		// Not using an arrow function as it messes up the reference to 'this'
		$scope.showSkateparkDetails = function(event, skatepark) {
			$scope.currentSkatepark = skatepark;
		    inst.map.showInfoWindow('detailsWindow', skatepark._id);
		};

	});

	$rootScope.$on("filterMarkers", function(event, data){

		$scope.parks = data;

	});

	$rootScope.$on("pushLastToScope", function(event, data){

		$scope.allData.push(data);

	});

});
