"use strict";


// To get the Json
angular.module("getJson", [])
	.factory("getJson", ($http) => {

		return $http.get("/skateparks");

	});


// A factory to load A Google Map
angular.module("createMap", [])
	.factory("createMap", ($http, $rootScope) => {

		// Set it somewhere in England
		const initialLat = 53.559124;
		const initialLong = -2.079675;

		// Global map obj to be refered back to
		let mapObj = null;

		// Object to be returned to Controller
		let map = {

			init: () => {

				mapObj = new google.maps.Map(document.getElementById("map"), {

					zoom: 3,
					center: {
						lat: initialLat,
						lng: initialLong
					}

				});

				//map.createNewPanel();

			},

			createNewMarker: () => {

				google.maps.event.addListener(mapObj, "click", (event) => {

					// Create a Map marker
					let MapMarker = new google.maps.Marker({
						position: event.latLng,
						map: mapObj,
						title: "Add a new Skatepark."
					});

					// Create an InfoWindow
					let InfoWindow = new google.maps.InfoWindow({
						content: "<form class='add-skate-location' id='skateparkForm'>\
							<div class='add-skate-location-heading'><input type='text' placeholder='Add title...' id='skateparkName' ng-model='name'></div>\
							<div class='add-skate-location-adder'><input type='text' placeholder='Your name' id='skateparkAdder' ng-model='adder'></div>\
							<div class='add-skate-location-description'><input type='text' placeholder='Describe it... (Optional)' id='skateparkDesc' ng-model='desc'></div>\
							<div class='add-skate-location-submit'><input type='button' value='Submit!' id='skateparkSubmit' ></div>\
						</form>"
					});

					// Execute the code / add to DOM
					InfoWindow.open(mapObj, MapMarker);

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

					});

					// Housekeeping to dismiss both current InfoWindow and to discard unused marker
					google.maps.event.addListener(mapObj, "click", (event) => {
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

				const marker = map.createNewPinWithInfo(pinMeta, $scope);

			},

			submitNewPark: (payload) => {

				// Saves the skatepark data to the db

				$http.post("/skateparks", payload)
					.success((data) => {

						// Emit the success to the controller
						$rootScope.$emit("postSuccess", data);

					})
					.error((data) => {
						console.log('Error: ' + data);
					});

			},

			createNewPinWithInfo: (pinMeta, $scope) => {

				console.log($scope.allData);

				// Create one single pin. Will be called many times!
				let pin = new google.maps.Marker({

					// latlng
					position: {
						lat: pinMeta.skateparkLocation[0],
						lng: pinMeta.skateparkLocation[1]
					},

					// bind to global map
					map: mapObj
				});

				// Create one single infoWindow
				let info = new google.maps.InfoWindow({

					content: "<div class='info-window-popup'>\
						<div class='info-window-skatepark-name'>" + pinMeta.skateparkName + "</div>\
						<div class='info-window-skatepark-desc'>" + pinMeta.skateparkDesc + "</div>\
						<div class='info-window-skatepark-rating'>" + $scope.skateparkRating + "</div>\
						<div class='info-window-skatepark-adder'>" + pinMeta.addedBy + "</div>\
						<div class='info-window-skatepark-created'>" + pinMeta.createdAt + "</div>\
					</div>"

				});

				// When marker is clicked, show infoWindow
				pin.addListener("click", () => {

					info.open(mapObj, pin);

				});

			}

		};


		return map;

	});




