"use strict";

// A factory to load A Google Map

angular.module("createMap", [])
	.factory("createMap", ($http) => {

		/*

			This initialises a Google Map

		*/

		// Set it somewhere in England
		const initialLat = 53.559124;
		const initialLong = -2.079675;

		// Global map obj to be refered back to
		let mapObj = null;

		// Object to be returned to Controller
		let map = {

			init: (lat, long) => {

				mapObj = new google.maps.Map(document.getElementById("map"), {

					zoom: 3,
					center: {
						lat: lat,
						lng: long
					}

				});

				map.createNewPanel();

			},

			createNewPanel: () => {

				google.maps.event.addListener(mapObj, "click", (event) => {

					// Create a Map marker
					let MapMarker = new google.maps.Marker({
						position: event.latLng,
						map: mapObj,
						title: "Add a new Skatepark."
					});

					// Create an InfoWindow
					let InfoWindow = new google.maps.InfoWindow({
						content: "<div class='add-skate-location tentative'>\
							<div class='add-skate-location-heading'><input type='text' placeholder='Add title...' id='skateparkName'></div>\
							<div class='add-skate-location-description'><textarea placeholder='Describe it...' id='skateparkDesc'></textarea></div>\
							<div class='row flexy'>\
								<div class='add-skate-location-adder column-6'><input type='text' placeholder='Your name' id='skateparkAdder'></div>\
								<div class='add-skate-location-submit column-2'><input type='button' value='Submit!' id='skateparkSubmit'></div>\
							</div>\
							<div class='information-panel'></div>\
						</div>"
					});

					// Execute the code
					InfoWindow.open(mapObj, MapMarker);

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

			addNewPoint: (pinMeta) => {

				const marker = map.createNewPinWithInfo(pinMeta);


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
					map: mapObj
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

			},


		};



		// Upon page load . Use our starting latLong.
		google.maps.event.addDomListener(window, "load", map.init(initialLat, initialLong));

		return map;

	});


