"use strict";

const app = angular.module("ngSkateApp", ["getJson", "ngMap", "newParkService", "localStorageService", "cloudinary", "ngFileUpload"]);

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

			// Show a skateparks InfoWindow when clicked
			// Not using an arrow function as it messes up the reference to 'this'
			$scope.showSkateparkDetails = function(event, skatepark) {
				$scope.currentSkatepark = skatepark;
		    	inst.map.showInfoWindow('detailsWindow', skatepark._id);

		    	if (skatepark.skateparkImages.length > 0)
		    	{
		    		$rootScope.$broadcast("loadCloudinaryImages", $scope.currentSkatepark.skateparkImages);
		    	}
		    	else
		    	{
		    		$("#placeHolderImg").show();
		    	}

			};


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

			});

			// TODO - Have markers disappear when infoWindows are clicked
			/*
			google.maps.event.addListener(inst.map, "closeClick", (event) => {
				console.log("close button was clicked");
			});
			*/




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

	$rootScope.$on("loadCloudinaryImages", function(event, data){

		setTimeout(function(){

			console.log("wat");
			$("#placeHolderImg").remove();

		}, 1000)



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
app.controller("addNewSkateparkCtrl", ($scope, $http, $rootScope, $location, NgMap, newParkService, Upload) => {

	// Is called at some point in the future when the form on the InfoWindow is submitted
	$rootScope.$on("addNewSkatepark", () => {

		if (!$scope.addNew.skateparkName || !$scope.addNew.skateparkAdder )
		{
			Materialize.toast('Please enter the first two fields! :)', 2000) // 4000 is the duration of the toast
			return;
		}
		else
		{
			if (!$scope.addNew.screenshots && !$scope.addNew.screenshotURL)
			{
				console.log("no screenshots (url or local)... proceed as normal");
				/*
				submitMetaToMongoDb($scope.addNew.skateparkName, $scope.addNew.skateparkDesc, $scope.clickedLocation, $scope.addNew.skateparkAdder, null);
				$("#uploadScrollbar div").width("100%");
				$scope.makeFieldsBlank();
				*/
			}
			else if ($scope.addNew.screenshots || $scope.addNew.screenshotURL)
			{	
				// Handle JUST local screenshots
				if ($scope.addNew.screenshots && !$scope.addNew.screenshotURL)
				{
					// TODO - virus checking etc!!
					submitLocalFiles($scope.addNew.screenshots);
				}
				// Handle JUST remote screenshots
				else if (!$scope.addNew.screenshots && $scope.addNew.screenshotURL)
				{
					if (testIsValidURL($scope.addNew.screenshotURL))
					{
						submitRemoteFiles($scope.addNew.screenshotURL);
					}
					else
					{
						Materialize.toast('Please enter a correct URL :)', 2000) // 4000 is the duration of the toast
						$scope.addNew.screenshotURL = "";
					}
				}
				// Handle BOTH local screenshots AND remotes
				else if ($scope.addNew.screenshots && $scope.addNew.screenshotURL)
				{
					// TODO - Look into performance of this
					submitLocalFiles($scope.addNew.screenshots);
					submitRemoteFiles($scope.addNew.screenshotURL);
				}

				/*
				let cloudinaryImageMeta = [];

				$.each($scope.addNew.screenshots, (pointer, file) => {

					Upload.upload({

						url: "https://api.cloudinary.com/v1_1/lgycbktyo/upload/",
						data: {
							upload_preset: "p0cxg2v9",
							tags: 'skateparkimages',
							context: 'photo=skateLocate',
							file: file
						}

					}).progress((event) => {
						// TODO - fix this.... it's well screwed!!!
						let progress = Math.round((event.loaded * 100.0) / event.total);
						$("#uploadScrollbar div").width(progress + "%");

					}).success((data, status, headers, config) => {

						$("#uploadScrollbar div").width("100%");

						// place it on the array
						if (status === 200) 
						{
							cloudinaryImageMeta.push(data)
						}

						// Because it's async, check if the number of items returned on the array match what was sent
						if (cloudinaryImageMeta.length === $scope.addNew.screenshots.length)
						{
							submitMetaToMongoDb($scope.addNew.skateparkName, $scope.addNew.skateparkDesc, $scope.clickedLocation, $scope.addNew.skateparkAdder, cloudinaryImageMeta);
							$scope.makeFieldsBlank();

						}

					});

				}); // End all file uploads

				*/

			}
		}

	});

	$scope.makeFieldsBlank = () => {

		$scope.addNew = {}

	}

	// Internal functions

	// Submits metadata to internal database - The final stage
	const submitMetaToMongoDb = (skateparkName, skateparkDesc, skateparkLocation, skateparkAdder, cloudinaryImageMeta) => {

		const skateparkImages = [];

		if (cloudinaryImageMeta)
		{
			$.each(cloudinaryImageMeta, (pointer, image) => {

				skateparkImages.push(image.secure_url);

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

	// Submits LOCAL files to cloudinary
	const submitLocalFiles = (localFiles) => {
		ajaxHelper(localFiles);
	};

	// Submits REMOTE URLS to cloudinary
	const submitRemoteFiles = (remoteURLS) => {
		ajaxHelper([remoteURLS]);
	};

	// Helper function to handle the ajaxy stuff
	const ajaxHelper = (file) => {

		let cloudinaryImageMeta = [];

		$.each(file, (pointer, thisFile) => {

			Upload.upload({
				url: "https://api.cloudinary.com/v1_1/lgycbktyo/upload/",
					data: {
						upload_preset: "p0cxg2v9",
						tags: 'skateparkimages',
						context: 'photo=skateLocate',
						file: thisFile
					}
				}).progress((event) => {
					// TODO - fix this.... it's well screwed!!!
					let progress = Math.round((event.loaded * 100.0) / event.total);
					$("#uploadScrollbar div").width(progress + "%");
					//console.log(progress);
				}).success((data, status, headers, config) => {

					//console.log(data);
					//console.log(status);

					$("#uploadScrollbar div").width("100%");

					// place it on the array
					if (status === 200) 
					{
						cloudinaryImageMeta.push(data.secure_url)
					}

					// Because it's async, check if the number of items returned on the array match what was sent
					if (cloudinaryImageMeta.length === file.length)
					{
						submitMetaToMongoDb($scope.addNew.skateparkName, $scope.addNew.skateparkDesc, $scope.clickedLocation, $scope.addNew.skateparkAdder, cloudinaryImageMeta);
						$scope.makeFieldsBlank();
					}

				});

		}); // End .each

	};

	const testIsValidURL = (string) => {
		// This regex probably sucks and will probably break
		const testRegEx = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
		const isIt = string.match(testRegEx);
		return isIt;
	}

});
