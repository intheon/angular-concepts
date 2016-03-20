"use strict";

const app = angular.module("ngSkateApp", ["getJson", "ngMap", "mapService", "localStorageService"]);

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

		//console.log($scope.allData);

	}).then((response) => {

			// Tell the map controller to do its thing
			$rootScope.$broadcast("runMapCtrl");

			// Tell the vote controller to do its thing
			$rootScope.$broadcast("runVoteCtrl");

		});

});


// Controller to handle ratings / upvotes
app.controller("RatingCtrl", ($scope, $rootScope, $http, localStorageService) => {

	// A button in the view fires this method
	// It's bound to the scope, so automagically updates
	$scope.incrementRating = (item) => {

		// Update the local scope
		item.skateparkRating += 1;

		// Send put request to server
		$http.put("/skateparks/" + item._id, item).success((response) => { 

			// Once success has been reached, add a reference to localStorage to this particular item can't get upvoted by this device (can work around this by clearing browser cache / different browser but sufficient for this example)

			// init new localstorage
			if (!localStorageService.get("spUsrHasAdded")) localStorageService.set("spUsrHasAdded", [response]);
			else
			{
				// append to existing
				let currents = localStorageService.get("spUsrHasAdded");
					currents.push(response);

					localStorageService.set("spUsrHasAdded", currents);

				// Tell the vote controller to do its thing
				$rootScope.$broadcast("runVoteCtrl");

			}

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

	$scope.styles = [{"featureType":"water","elementType":"all","stylers":[{"hue":"#76aee3"},{"saturation":38},{"lightness":-11},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"hue":"#8dc749"},{"saturation":-47},{"lightness":-17},{"visibility":"on"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"hue":"#c6e3a4"},{"saturation":17},{"lightness":-2},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"all","stylers":[{"hue":"#cccccc"},{"saturation":-100},{"lightness":13},{"visibility":"on"}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"hue":"#5f5855"},{"saturation":6},{"lightness":-31},{"visibility":"on"}]},{"featureType":"road.local","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"simplified"}]},{"featureType":"water","elementType":"all","stylers":[]}]

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

				// Remove the InfoWindow Frame
				iwBackground.children(':nth-child(1)').css({'display' : 'none'});
				iwBackground.children(':nth-child(2)').css({'display' : 'none'});
				iwBackground.children(':nth-child(3)').css({'display' : 'none'});
				iwBackground.children(':nth-child(4)').css({'display' : 'none'});


				setTimeout(() => {

					// Remove preloader
						$(".preload").fadeOut(() => {
							$(this).hide();
						})

				}, 300)

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

// Vote Controller - to allow the user only be able to vote on an item once

app.controller("VoteCtrl", ($scope, $rootScope, localStorageService) => {

	$rootScope.$on("runVoteCtrl", () => {

		// add a prop to each element in the allData array to mention if it matches the id of that in LocalStorage

		let votedFor = localStorageService.get("spUsrHasAdded");

		// NOTE, this can definitely be optimised, but i need to read up on the big O to find out the best way
		// Cycle through all data 


		$.each($scope.allData, (allDataPointer, allDataVal) => {

			// sub-list: cycle through localstorage data
			$.each(votedFor, (lsPointer, lsVal) => {

				if (allDataVal._id === lsVal._id)
				{
					$scope.allData[allDataPointer].hasVote = true;
				}

			});


		});
	})

});
