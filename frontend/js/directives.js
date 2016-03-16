app.directive("upvoteButton", () => {

	return {
		restrict: "E",
		template: "<i class='material-icons upvote'>navigation</i>",
		replace: true
	};

});


// This doesnt actually render in the factory yet... to do!

app.directive("fileUploadArea", ["mapService", () => {

	return {

		restrict: "E",
		template: "<div class='file-upload'>TESTING</div>",
		replace: true

	};

}]);