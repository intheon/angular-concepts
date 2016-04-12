"use strict";

const app = angular.module("ngSkateApp", ["getJson", "ngMap", "newParkService", "miscHelpFunctionsService", "localStorageService", "cloudinary", "ngFileUpload", "addImageToCloud"]);

// Controller for getting data from server and presenting to view
app.controller("ListCtrl", ($scope, $http, $rootScope, getJson) => {

	// Initialise array to store databases response
	$scope.allData = [];

	// This is fired on page init to get ALL the skateparks
	getJson.success((response) => {

		// Store the response in the array
		$scope.allData = response;

		console.log($scope.allData);

	}).then((response) => {

			// Tell the map controller to do its thing
			$rootScope.$broadcast("runMapCtrl");

			// Tell the vote controller to do its thing
			$rootScope.$broadcast("runVoteCtrl");

			// Remove preloader
			$(".preload").fadeOut(() => {
				$(this).hide();
			})

		});

	// Helper function to reverse contents of array
	$scope.rev = (array) => {
		let copy = [].concat(array);
		return copy.reverse();
	};


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

			// Once success has been reached, add a reference within localStorage so that this particular skatepark can't get upvoted by this device.
			// note: can work around this by clearing browser cache / different browser but sufficient for this example - look into this as part of ongoing maintanence

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
app.controller("MapCtrl", ($scope, $http, $rootScope, NgMap, Upload) => {


	// Namespace
	const inst = this;

	// Apply some custom css
	$scope.styles = [{"featureType":"water","elementType":"all","stylers":[{"hue":"#76aee3"},{"saturation":38},{"lightness":-11},{"visibility":"on"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"hue":"#8dc749"},{"saturation":-47},{"lightness":-17},{"visibility":"on"}]},{"featureType":"poi.park","elementType":"all","stylers":[{"hue":"#c6e3a4"},{"saturation":17},{"lightness":-2},{"visibility":"on"}]},{"featureType":"road.arterial","elementType":"all","stylers":[{"hue":"#cccccc"},{"saturation":-100},{"lightness":13},{"visibility":"on"}]},{"featureType":"administrative.land_parcel","elementType":"all","stylers":[{"hue":"#5f5855"},{"saturation":6},{"lightness":-31},{"visibility":"on"}]},{"featureType":"road.local","elementType":"all","stylers":[{"hue":"#ffffff"},{"saturation":-100},{"lightness":100},{"visibility":"simplified"}]},{"featureType":"water","elementType":"all","stylers":[]}]

	// This is fired after the server has done it's thing
	$rootScope.$on("runMapCtrl", () => {

		// Get the map instance
		NgMap.getMap().then((map) => {

			// Set these to be local and scope vars
			inst.map = map;
			$scope.scopeMap = map;
			$scope.addNew = {}
			$scope.addAmendment = {}

			// Show a skateparks InfoWindow when clicked
			// Not using an arrow function as it messes up the reference to 'this'
			$scope.showSkateparkDetails = function(event, skatepark) {
				$scope.currentSkatepark = skatepark;
		    	inst.map.showInfoWindow('detailsWindow', skatepark._id);

		    	setTimeout(() => {

					const goo  = $(".gm-style-iw");
					const background1 = $(goo).prev().children(":nth-child(2)");
					const background2 = $(goo).prev().children(":nth-child(4)");
					const pin1 = $(goo).prev().children(":nth-child(3)").children(":first-child");
					const pin2 = $(goo).prev().children(":nth-child(3)").children(":last-child");


					$(background1).css({"background":"transparent"});
					$(background1).css({"box-shadow":"none"});
					$(background2).css({"background":"transparent"});
					$(pin1).css({"top":"-12px"});
					$(pin2).css({"top":"-12px"});


				},25);


				// IMPORTANT!!!! Only initialise the Slider method if theres at least one image to show... else show a fallback (see the ng-if in the view)
		    	if (skatepark.skateparkImages.length > 0) $rootScope.$broadcast("activateSlideshow", $scope.currentSkatepark.skateparkImages);



			};

			$scope.navigateThroughSlideshow = (direction) => {
				console.log(direction);
			}

			$scope.toolsShown = false;

			$scope.showTools = () => {

				if (!$scope.toolsShown)
				{
					$(".description").fadeOut(() => {
						$(".hidden-tools").fadeIn(() => {
							$scope.toolsShown = true;
						});
					});
				}
				else
				{
					$(".hidden-tools").fadeOut(() => {
						$(".description").fadeIn(() => {
							$scope.toolsShown = false;
						});
					});
				}

			}

			$scope.showSlideshowModal = () => {

				console.log("aha");

			}



			/* DISCLAIMER 

				The below code is a horrible, horrible hack to remove the default InfoWindow style from Google.
				It's prone to errors, so it will probably be removed completely and just go with the default styling



			// Show at least one so it gets added to the DOM
		    inst.map.showInfoWindow('detailsWindow', "showMePlease");

		    // Delete the 'fake' scope so they all disappear
			$scope.fake = [];

			// Remove the horrible default infowindow style
			// This is a hack and I hate using setTimeout, but Google don't let you modify the infoWindow easily!
			// TODO - Move this to its own helper service
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

			}, 100)

			*/

			// NOW THE FUN STUFF

			// Make the map clickable
			google.maps.event.addListener(inst.map, "click", (event) => {

				// get the latLng from precisely where the user clicked
				const clickedLocation = [{
					location: [
						event.latLng.lat(),
						event.latLng.lng(),
					]
				}];

				// $apply binds stuff that would normally automagically work where the click event handler screws it up
				$scope.$apply(function(){
					$scope.clickedLocation = clickedLocation;
				})

				// show an InfoWindow
				inst.map.showInfoWindow('newSkateparkWindow', "inProgressMarker");

				$("#uploadScrollbar").hide();

				// Allow form to be submitted
				$scope.submitNewSkateparkForm = () => {
					$rootScope.$broadcast("addNewSkatepark");


				}


				// TODO - Have markers disappear when infoWindows are clicked

				// This is the best implementation I can find because the API doesnt have it's own method to do so!
					// LOL
					setTimeout(function(){
						$("div img[src='https://maps.gstatic.com/mapfiles/api-3/images/mapcnt6.png']").click(function(){
						
							$scope.addNew = {};

							$scope.$apply(function(){
								$scope.clickedLocation = [];
							})
						})
					},100)


			});

		});

	});

	$rootScope.$on("filterMarkers", function(event, data){

		$scope.parks = data;

	});

	$rootScope.$on("pushLastToScope", function(event, data){

		// Add the last one to the front-end
		$scope.allData.push(data);

		setTimeout(() => {
			$scope.scopeMap.hideInfoWindow('newSkateparkWindow');
		}, 400)

		// read this https://github.com/angular/angular.js/wiki/Understanding-Scopes
		$scope.addNew = {};

	});

	$rootScope.$on("activateSlideshow", function(event, data){

		$scope.currentSkatepark.skateparkImages = data;

		setTimeout(function(){

			const swiper = new Swiper(".swiper-container", {

				nextButton: ".swiper-button-next",
				prevButton: ".swiper-button-prev",
				pagination: ".swiper-pagination",
				paginationClickable: true,
				preloadImages: true,
				lazyLoading: true,
				loop: true

			});


		}, 300);

	});

	// Helper function to make the new form fields blank (useful for when a submit event never happens)
	$scope.makeFieldsBlank = () => {
		$scope.addNew = null;
	}

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

// Responsive Controller - Allow the toggle button to switch between hidden/shown panels
app.controller("responsiveCtrl", ($scope, $rootScope, NgMap) => {

	const resizeLogic = () => {

		let width = window.innerWidth;

		let fullScreenMap = $(".left-column").hasClass("big-left");

		if (width < 1000 && !fullScreenMap)
		{
			$("#resizeSwitch").trigger("click")
		}	
		else if (width > 1000 && fullScreenMap)
		{
			$("#resizeSwitch").trigger("click")
		}

	}

	$scope.togglePanel = () => {

		if($(".left-column").hasClass("big-left") || $(".left-column").hasClass("little-right"))
		{
			$(".left-column").removeClass("big-left");
			$(".right-column").removeClass("little-right");
		}
		else
		{

			$(".left-column").addClass("big-left");
			$(".right-column").addClass("little-right");
		}

		NgMap.getMap().then((map) => {

		 	setTimeout(function(){
				google.maps.event.trigger(map, 'resize')
		 	},700)

		 });

	}

	// Listen for resize
	$(window).resize(() => {
		resizeLogic();
	});

	setTimeout(() => {

		// Fire once when page is initialised
		resizeLogic();

	},2000)




});

// File Controller - Handles uploads of skatepark screenshots to the server
app.controller("addNewSkateparkCtrl", ($scope, $http, $q, $timeout, $rootScope, NgMap, newParkService, Upload, miscHelpFunctionsService, addImageToCloud) => {

	// Is called at some point in the future when the form on the InfoWindow is submitted
	$rootScope.$on("addNewSkatepark", () => {

		// if empty mandatory fields
		if (!$scope.addNew.skateparkName || !$scope.addNew.skateparkAdder )
		{
			miscHelpFunctionsService.displayErrorMessage("Please enter the first two fields! :)");
			return;
		}
		else
		{
			// If no screenshots are needed
			if (!$scope.addNew.screenshots && !$scope.addNew.screenshotURL)
			{
				submitMetaToMongoDb($scope.addNew.skateparkName, $scope.addNew.skateparkDesc, $scope.clickedLocation, $scope.addNew.skateparkAdder, null);
				$("#uploadScrollbar div").width("100%");
			}
			else if ($scope.addNew.screenshots || $scope.addNew.screenshotURL)
			{	
				// Handle JUST local screenshots
				if ($scope.addNew.screenshots && !$scope.addNew.screenshotURL)
				{
					// TODO - virus checking etc!!
					submitToCloudAndDB($scope.addNew.screenshots);
				}
				// Handle JUST remote screenshots
				else if (!$scope.addNew.screenshots && $scope.addNew.screenshotURL)
				{
					if (miscHelpFunctionsService.testIsValidURL($scope.addNew.screenshotURL))
					{
						submitToCloudAndDB($scope.addNew.screenshotURL);
					}
					else
					{
						miscHelpFunctionsService.displayErrorMessage("Please enter a correct URL :)");
						$scope.addNew.screenshotURL = "";
					}
				}
				// Handle BOTH local screenshots AND remotes
				else if ($scope.addNew.screenshots && $scope.addNew.screenshotURL)
				{
					// TODO - Look into performance of this


					/*
						THIS IS BROKEN FOR NOW....
					submitLocalFiles($scope.addNew.screenshots);
					submitRemoteFiles($scope.addNew.screenshotURL);
					*/
				}

			}
		}


	});


	// Internal functions

	// Submits metadata to internal database - The final stage
	const submitMetaToMongoDb = (skateparkName, skateparkDesc, skateparkLocation, skateparkAdder, cloudinaryImageMeta) => {

		const skateparkImages = [];

		if (cloudinaryImageMeta)
		{
			$.each(cloudinaryImageMeta, (pointer, image) => {
				skateparkImages.push(image);
			});
		}

		const payload = {
			skateparkName : skateparkName,
			skateparkDesc : skateparkDesc,
			skateparkLocation : skateparkLocation[0].location,
			skateparkAdder : skateparkAdder,
			skateparkRating : 1,
			skateparkImages : skateparkImages
		}

		newParkService.submitNewPark(payload);

	};


	// Submits URLS or LOCAL files to Cloudinary
	const submitToCloudAndDB = (urls) => {

		let toSubmit = [];

		if (typeof urls === "string") toSubmit.push(urls);
		else if (typeof urls === "object") toSubmit = urls

		const cloudPromise = addImageToCloud.uploadImages(toSubmit);

		cloudPromise.then((response) => {

			submitMetaToMongoDb($scope.addNew.skateparkName, $scope.addNew.skateparkDesc, $scope.clickedLocation, $scope.addNew.skateparkAdder, response);
			$scope.makeFieldsBlank();

		});

	}

});



app.controller("updateSkateparkImagesCtrl", ($scope, $http, $rootScope, miscHelpFunctionsService) => {

});
