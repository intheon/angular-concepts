"use strict";


// To get the Json
angular.module("getJson", [])
	.factory("getJson", ($http) => {

		return $http.get("/skateparks");

	});

// A factory to load A Google Map
angular.module("mapService", [])
	.factory("mapService", ($http, $rootScope) => {

		// Object to be returned to Controller
		let map = {

			listenForMarkers: (mapInstance) => {

				google.maps.event.addListener(mapInstance, "click", (event) => {

					// Create a Map marker
					let MapMarker = new google.maps.Marker({
						position: event.latLng,
						map: mapInstance,
						title: "Add a new Skatepark."
					});

					// Create an InfoWindow which will contain a form
					let InfoWindow = new google.maps.InfoWindow({
						content: "<form class='add-skate-location' id='skateparkForm'>\
							<div class='question'>\
								<header>What's the skatepark name?</header>\
								<input type='text' placeholder='' />\
							</div>\
							<div class='question'>\
								<header>What's your name?</header>\
								<input type='text' placeholder='' />\
							</div>\
							<div class='question'>\
								<header>A summary of the place? (Optional) </header>\
								<input type='text' placeholder='' />\
							</div>\
							<div class='question'>\
								<header>Any images? (Drag/drop or add a link!)</header>\
								<input type='text' placeholder='' />\
							</div>\
						</form>"
					});

					// Execute the code / add to DOM
					InfoWindow.open(mapInstance, MapMarker);

					// Listen for form submit

					$("#skateparkSubmit").click(() => {

						const name = $("#skateparkName").val();
						const adder = $("#skateparkAdder").val();
						const desc = $("#skateparkDesc").val();

						// Laziest validation ever. Fix this.
						if (!name || !adder) return;

						// Create a payload ready for DB
						const payload = {
							skateparkName: name,
							skateparkDesc: desc,
							skateparkRating: 1, 
							skateparkLocation: [
								event.latLng.lat(),
								event.latLng.lng(),
							],
							addedBy: adder,
							createdAt: new Date()
						}

						// Submit that to db
						map.submitNewPark(payload);

						// Close the open 
						InfoWindow.close();

						// Remove the marker
						MapMarker.setMap(null);

					});

					// Housekeeping to dismiss both current InfoWindow and to discard unused marker
					google.maps.event.addListener(mapInstance, "click", (event) => {
						InfoWindow.close();
						MapMarker.setMap(null);
					});

					// Remove Marker if 'x' is clicked
					google.maps.event.addListener(InfoWindow, "closeclick", (event) => {
						MapMarker.setMap(null);
					});

				});


			},

			submitNewPark: (payload) => {

				// Saves the skatepark data to the db

				$http.post("/skateparks", payload)
					.success((data) => {

						// the _id will be returned
						$http.get("/skateparks/" + data)
							.success((response) => {

								// Emit the success to the controller
								$rootScope.$emit("pushLastToScope", response);

							})

					})
					.error((data) => {
						console.log('Error: ' + data);
					});

			}

		};

		return map;

	});




