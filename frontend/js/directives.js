app.directive("upvoteButton", () => {

	return {
		restrict: "E",
		template: "<div class='svg-div'><svg width='32' height='32' class='hideUpVote'><line x1='2' y1='32' x2='16' y2='8'/><line x1='30' y1='32' x2='16' y2='8'/></svg></div>",
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