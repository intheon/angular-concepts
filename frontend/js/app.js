const app = angular.module("testAngular", ["getJson"]);

// Controller for getting data from server and presenting to view
app.controller("ListCtrl", ($scope, $http, getJson) => {

	// Initialise as empty array
	$scope.allData = [];

	// Call getJson, which is a Factory method which returns a crapton of useful object data
	// This took a lot of effort, but the implementation is simples!
	getJson.success((response) => {
		$scope.allData = response;
	});

});

// Controller to handle ratings / upvotes
app.controller("RatingCtrl", ($scope, $http) => {

	// A button in the view fires this method
	// It's bound to the scope, so automagically updates
	$scope.incrementRating = (item) => {

		item.rating += 1;

	};

});

// Controller to handle searching
app.controller("SearchCtrl", ($scope) => {

	// Another bit of magic, this string is auto populated by an input field thats bound to it
	// If any part of the string is matched, it's show up!
	$scope.searchParks = "";

});

app.controller("AddCtrl", ($scope, $rootScope) => {

	$scope.submitItemForm = () => {

		// Shorthand
		let name = $scope.itemInfo.name;
		let adder = $scope.itemInfo.adderName;

		// Super Primitive checks
		if (!name || !adder) return;

	}

});

