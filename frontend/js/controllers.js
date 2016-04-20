"use strict";

const app = angular.module("ngSkateApp", ["getJson", "ngMap", "parkService", "miscHelpFunctionsService", "localStorageService", "cloudinary", "ngFileUpload", "addImageToCloud"]);

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

	$scope.fullscreenSlideshowShown = false;
	$scope.helpShown = false;
	$scope.slideshowImages = null;

	$scope.showSlideshowFullscreen = (currentSkatepark) => {

		if (!$scope.fullscreenSlideshowShown)
		{
			$scope.slideshowImages = currentSkatepark.skateparkImages;

			$(".full-screen-slideshow").fadeIn(() => {

				$scope.fullscreenSlideshowShown = true;

				setTimeout(function(){

					const swiper = new Swiper(".fullscreen-swiper-container", {

						nextButton: ".swiper-button-next",
						prevButton: ".swiper-button-prev",
						pagination: ".swiper-pagination",
						paginationClickable: true,
						preloadImages: true,
						lazyLoading: true,
						loop: true

					});


				}, 400);

			});
		}
		else
		{
			$scope.slideshowImages = [];
			$(".full-screen-slideshow").fadeOut(() => {
				$scope.fullscreenSlideshowShown = false;
			});
		}
	}

	$scope.launchHelp = () => {

		console.log("clicked");

		if (!$scope.helpShown)
		{
			$(".full-screen-help").fadeIn(() => {

				$scope.helpShown = true;

			});
		}
		else
		{
			$(".full-screen-help").fadeOut(() => {
				$scope.helpShown = false;
			});
		}
	}



});

// Controller to handle ratings / upvotes
app.controller("RatingCtrl", ($scope, $rootScope, $http, localStorageService) => {

	// A button in the view fires this method
	// It's bound to the scope, so automagically updates
	$scope.incrementRating = (item) => {

		// Update the local scope // This means that no further GET request is needed for now
		item.skateparkRating += 1;

		// Send put request to server
		$http.put("/skateparks/" + item._id, item).success((response) => { 

			// Once success has been reached, add a reference within localStorage so that this particular skatepark can't get upvoted by this device.
			// note: can work around this by clearing browser cache / different browser but sufficient for this example - look into this as part of ongoing maintanence

			// init new localstorage
			if (!localStorageService.get("spUsrHasAdded"))
			{
				localStorageService.set("spUsrHasAdded", [response]);
				$rootScope.$broadcast("runVoteCtrl");
			}
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

		    	// Remove the frame around the InfoWindow (no way to easily do this without it first being added to the dom...)
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

			$scope.toolsShown = false;
			$scope.commentsShown = false;

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

			$scope.showComments = (currentSkatepark) => {

				if (!$scope.toolsShown)
				{
					$(".comments-full-window").fadeIn(() => {
						$scope.toolsShown = true;
					});
				}
				else
				{
					$(".comments-full-window").fadeOut(() => {
						$scope.toolsShown = false;
					});
				}

			}


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

				// This is the best implementation I can come up with because the API doesnt have it's own method to do so! (remove in-progress InfoWindows)
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

	},1800)

});

// File Controller - Handles uploads of skatepark screenshots to the server
app.controller("addNewSkateparkCtrl", ($scope, $http, $q, $timeout, $rootScope, NgMap, parkService, Upload, miscHelpFunctionsService, addImageToCloud) => {

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
					submitOneToCloudAndDB($scope.addNew.screenshots);
				}
				// Handle JUST remote screenshots
				else if (!$scope.addNew.screenshots && $scope.addNew.screenshotURL)
				{
					// Need to make sure user just doesnt mash the keyboard
					if (miscHelpFunctionsService.testIsValidURL($scope.addNew.screenshotURL))
					{
						submitOneToCloudAndDB($scope.addNew.screenshotURL);
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
					submitBothToCloud($scope.addNew.screenshots, $scope.addNew.screenshotURL);
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

		parkService.submitNewPark(payload);

	};


	// Submits urls OR local files to Cloudinary
	const submitToCloudAndDB = (data) => {

		const toSubmit = miscHelpFunctionsService.returnArray(data);
		const cloudPromise = addImageToCloud.uploadImages(toSubmit);

		cloudPromise.then((response) => {

			submitMetaToMongoDb($scope.addNew.skateparkName, $scope.addNew.skateparkDesc, $scope.clickedLocation, $scope.addNew.skateparkAdder, response);
			$scope.makeFieldsBlank();

		});

	}

	// Submits BOTH locals and urls to Cloudinary
	const submitBothToCloud = (locals, remotes) => {

		const remotesAsArr = miscHelpFunctionsService.returnArray(remotes);
		const localsAsArr = miscHelpFunctionsService.returnArray(locals);

		const remotesPromise = addImageToCloud.uploadImages(remotesAsArr);

		remotesPromise.then((response) => {

			const localsPromise = addImageToCloud.uploadImages(localsAsArr);

			localsPromise.then((secondResponse) => {

				const merged = response.concat(secondResponse);
				submitMetaToMongoDb($scope.addNew.skateparkName, $scope.addNew.skateparkDesc, $scope.clickedLocation, $scope.addNew.skateparkAdder, merged);
				$scope.makeFieldsBlank();


			});


		});

	}

});


app.controller("updateSkateparkImagesCtrl", ($scope, $http, $rootScope, parkService, miscHelpFunctionsService, addImageToCloud) => {

	$scope.updateSkateparkImages = (currentSkatepark) => {

		// if empty mandatory fields
		if (!$scope.addAmendment.screenshotURL)
		{
			miscHelpFunctionsService.displayErrorMessage("Please enter a URL :)");
			return;
		}
		else if ($scope.addAmendment.screenshotURL)
		{	
			// Need to make sure user just doesnt mash the keyboard
			if (miscHelpFunctionsService.testIsValidURL($scope.addAmendment.screenshotURL))
			{
				addImage($scope.addAmendment.screenshotURL, currentSkatepark);
			}
			else
			{
				miscHelpFunctionsService.displayErrorMessage("Please enter a correct URL :)");
				$scope.addAmendment.screenshotURL = "";
			}
		}
	}

	const addImage = (data, currentSkatepark) => {

		const toSubmit = miscHelpFunctionsService.returnArray(data);
		const cloudPromise = addImageToCloud.uploadImages(toSubmit);

		cloudPromise.then((response) => {

			currentSkatepark.skateparkImages.push(response[0]);
			$rootScope.$broadcast("activateSlideshow", currentSkatepark.skateparkImages);

			parkService.updateExistingPark(currentSkatepark._id, currentSkatepark);

			$scope.addAmendment.screenshotURL = "";
			$scope.showTools();

			
		});

	}



});
