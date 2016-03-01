"use strict";

const app = angular.module("testAngular", ["getJson", "createMap"]);

// Controller for getting data from server and presenting to view
app.controller("ListCtrl", ($scope, $http, getJson, createMap) => {

	// Initialise as empty array
	$scope.allData = [];

	// Call getJson, which is a Factory method which returns a crapton of useful object data
	// This took a lot of effort, but the implementation is simples!
	getJson.success((response) => {

		// The data is now present for the view (index.html) to play with
		$scope.allData = response;


	}).then((response) => {

		// I know angular has its own foreach method, but jQuery is familiar

		$.each(response.data, (num, val) => {

			// 'createMap' is from the createMap factory (See mapFactory.js)

			createMap.addNewPoint(val);

		});


	});

});

// Controller to handle ratings / upvotes
app.controller("RatingCtrl", ($scope, $http) => {

	// A button in the view fires this method
	// It's bound to the scope, so automagically updates
	$scope.incrementRating = (item) => {

		item.skateparkRating += 1;

	};

});

// Controller to handle searching
app.controller("SearchCtrl", ($scope) => {

	// Another bit of magic, this string is auto populated by an input field thats bound to it
	// If any part of the string is matched, it's show up!
	$scope.searchParks = "";

});

app.controller("AddCtrl", ($scope) => {

	$scope.submitItemForm = () => {

		// Shorthand
		let name = $scope.itemInfo.name;
		let adder = $scope.itemInfo.adderName;

		// Super Primitive checks
		if (!name || !adder) return;

		console.log(name);
		console.log(adder);

	}

});

app.controller("MapCtrl", ($scope, $http, $rootScope, createMap) => {



});

