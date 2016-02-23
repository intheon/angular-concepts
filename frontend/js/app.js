const app = angular.module("testAngular", ["getJson"]);

// Controller for getting data from server

app.controller("ListCtrl", ($scope, $http, getJson) => {

	// Initialise as empty array
	$scope.allData = [];

	// Call getJson, which is a Factory method which returns a crapton of useful object data
	// This took a lot of effort, but the implementation is simples!
	getJson.success((response) => {
		$scope.allData = response;
	});

	// Our search function
	$scope.searchParks = "";

	$scope.incrementRating = (item) => {

		item.rating += 1;

	};


});

