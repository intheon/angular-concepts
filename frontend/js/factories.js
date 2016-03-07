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

					// Create an InfoWindow
					let InfoWindow = new google.maps.InfoWindow({
						content: "<form class='add-skate-location' id='skateparkForm'>\
							<div class='add-skate-location-heading'><input type='text' placeholder='Add the name' id='skateparkName' ng-model='name'></div>\
							<div class='add-skate-location-description'><input type='text' placeholder='Describe it... (Optional)' id='skateparkDesc' ng-model='desc'></div>\
							<div class='add-skate-location-adder'><input type='text' placeholder='Your name' id='skateparkAdder' ng-model='adder'></div>\
							<div class='add-skate-location-submit'><input type='button' value='Submit!' id='skateparkSubmit' ></div>\
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

			addNewPoint: (pinMeta, $scope) => {

				return map.createNewPinWithInfo(pinMeta, $scope);

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

			},

			createNewPinWithInfo: (pinMeta) => {

				// Create one single pin. Will be called many times!
				let pin = new google.maps.Marker({

					// latlng
					position: {
						lat: pinMeta.skateparkLocation[0],
						lng: pinMeta.skateparkLocation[1]
					},

					// bind to global map
					//map: mapObj
				});

				// Create one single infoWindow
				let info = new google.maps.InfoWindow({

					content: "<div class='info-window-popup'>\
						<div class='info-window-skatepark-name'>" + pinMeta.skateparkName + "</div>\
						<div class='info-window-skatepark-desc'>" + pinMeta.skateparkDesc + "</div>\
						<div class='info-window-skatepark-rating'>" + pinMeta.skateparkRating + "</div>\
						<div class='info-window-skatepark-adder'>" + pinMeta.addedBy + "</div>\
						<div class='info-window-skatepark-created'>" + pinMeta.createdAt + "</div>\
					</div>"

				});

				// When marker is clicked, show infoWindow
				pin.addListener("click", () => {

					info.open(mapObj, pin);

				});

				// Finally, add this to the scope for future filtering
				return pin;

			}

		};


		return map;

	});




