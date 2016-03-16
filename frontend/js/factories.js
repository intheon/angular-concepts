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

			createMarker: (mapInstance) => {

				google.maps.event.addListener(mapInstance, "click", (event) => {

					// Bind the event to a closure constant
					let meta = event;

					// Create a Map marker placed exactly where the user clicked
					let MapMarker = new google.maps.Marker({
						position: meta.latLng,
						map: mapInstance,
						title: "Add a new Skatepark."
					});

					// Create an InfoWindow to be bound to the marker. This will contain the forms to define a new skatepark
					let InfoWindow = new google.maps.InfoWindow({
						content: "<form class='add-skate-location' id='skateparkForm'>\
						<div class='input-field row'>\
							<input type='text' id='skateparkName' ng-model='name'>\
							<label for='skateparkName'>Skatepark Name</label>\
						</div>\
						<div class='input-field row'>\
							<input type='text' id='skateparkAdder' ng-model='name'>\
							<label for='skateparkAdder'>Your name</label>\
						</div>\
						<div class='input-field row'>\
							<textarea class='materialize-textarea' id='skateparkDesc'></textarea>\
							<label for='skateparkDesc'>A description - Optional.</label>\
						</div>\
						<div class='row'>\
							<input type='button' value='Submit!' id='skateparkSubmit' class='waves-effect waves-light btn col s12'>\
						</div>\
						</form>"
					});

					// Execute the code / add to DOM
					InfoWindow.open(mapInstance, MapMarker);

					// Listen for eventual form submit
					$("#skateparkSubmit").on("click", meta, () => {

						// Grab the data
						map.retrieveData(meta);

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

			retrieveData: (meta) => {

				// Grab the populated values from the dom
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
						meta.latLng.lat(),
						meta.latLng.lng(),
					],
					addedBy: adder,
					createdAt: new Date()
				}

				// Submit that to db
				map.submitNewPark(payload);

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




