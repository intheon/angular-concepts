"use strict";


// To get the Json
angular.module("getJson", [])
	.factory("getJson", ($http) => {

		return $http.get("/skateparks");

	});

// A factory to load A Google Map
angular.module("mapService", [])
	.factory("mapService", ($http, $rootScope, Upload) => {

		// Object to be returned to Controller
		let map = {

			returnInfoWindow: () => {

				// Create an InfoWindow to be bound to the marker. This will contain the forms to define a new skatepark
					const InfoWindow = new google.maps.InfoWindow({
						content: "<form class='add-skate-location' id='skateparkForm' action='#' ng-controller='newSkateparkCtrl'>\
							<div class='input-field row'>\
								<i class='material-icons prefix'>room</i>\
								<input type='text' id='skateparkName' ng-model='name'>\
								<label for='skateparkName'>Skatepark Name</label>\
							</div>\
							<div class='input-field row'>\
								<i class='material-icons prefix'>perm_identity</i>\
								<input type='text' id='skateparkAdder' ng-model='name'>\
								<label for='skateparkAdder'>Your name</label>\
							</div>\
							<div class='input-field row'>\
								<i class='material-icons prefix'>mode_edit</i>\
								<textarea class='materialize-textarea' id='skateparkDesc'></textarea>\
								<label for='skateparkDesc'>A description - Optional.</label>\
							</div>\
							<div class='file-field input-field row'>\
								<div class='btn'>\
									<span>File</div>\
									<input type='file' ngf-select ng-model='screenshot' ngf-multiple='true' accept='image/*' ngf-max-size='4MB' id='screenshotUpload'>\
									<div class='file-path-wrapper'>\
										<input class='file-path validate' type='text' placeholder='upload some screenshots'>\
									</div>\
								</div>\
							</div>\
							<div class='row'>\
								<input type='button' value='Submit!' id='skateparkSubmit' class='waves-effect waves-light btn col s12' ng-click='submitNewSkateparkForm()'>\
							</div>\
						</form>"
					});

				return InfoWindow;

			},

			returnMarker: (mapInstance, event) => {

				const meta = event;

				// Create a Map marker placed exactly where the user clicked
				const MapMarker = new google.maps.Marker({
						position: meta.latLng,
						map: mapInstance,
						title: "Add a new Skatepark."
					});

				return MapMarker;

			},

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
						content: "<form class='add-skate-location' id='skateparkForm' action='#' ng-controller='newSkateparkCtrl'>\
							<div class='input-field row'>\
								<i class='material-icons prefix'>room</i>\
								<input type='text' id='skateparkName' ng-model='name'>\
								<label for='skateparkName'>Skatepark Name</label>\
							</div>\
							<div class='input-field row'>\
								<i class='material-icons prefix'>perm_identity</i>\
								<input type='text' id='skateparkAdder' ng-model='name'>\
								<label for='skateparkAdder'>Your name</label>\
							</div>\
							<div class='input-field row'>\
								<i class='material-icons prefix'>mode_edit</i>\
								<textarea class='materialize-textarea' id='skateparkDesc'></textarea>\
								<label for='skateparkDesc'>A description - Optional.</label>\
							</div>\
							<div class='file-field input-field row'>\
								<div class='btn'>\
									<span>File</div>\
									<input type='file' ngf-select ng-model='screenshot' ngf-multiple='true' accept='image/*' ngf-max-size='4MB' id='screenshotUpload'>\
									<div class='file-path-wrapper'>\
										<input class='file-path validate' type='text' placeholder='upload some screenshots'>\
									</div>\
								</div>\
							</div>\
							<div class='row'>\
								<input type='button' value='Submit!' id='skateparkSubmit' class='waves-effect waves-light btn col s12' ng-click='submitNewSkateparkForm()'>\
							</div>\
						</form>"
					});

					// Execute the code / add to DOM
					InfoWindow.open(mapInstance, MapMarker);

					// Listen for eventual form submit

					/*
					$("#skateparkSubmit").on("click", meta, () => {

						console.log("about to attempt");
						$("#screenshotUpload").fileupload({
							url: "files/",
							dataType: "json",
							done: function(e, data){
								console.log(e);
								console.log(data);
							}

						});

						console.log("never got here");

						/*
						ospry.up({
							form: $("#skateparkForm"),
							files: $("#screenshotUpload"),
							filename: "testing.jpg",
							imageReady: map.testCallback

						});


						// Grab the data
						map.retrieveData(meta);



						// Close the open 
						InfoWindow.close();

						// Remove the marker
						MapMarker.setMap(null);

					});

					*/

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
				const img = $("#screenshotUpload").val();

				// Laziest validation ever. Fix this.
				if (!name || !adder || !img) return;

				// Create a payload ready for DB
				const payload = {
					skateparkName: name,
					skateparkDesc: desc,
					skateparkRating: 1, 
					skateparkLocation: [
						meta.latLng.lat(),
						meta.latLng.lng(),
					],
					skateparkImages: [],
					addedBy: adder,
					createdAt: new Date()
				}

				// Submit that to db
				//map.submitNewPark(payload);

			},

			testCallback: (err, metadata, index) => {

				if (err != null) console.log(err);


				console.log(metadata);

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

	var isDefined = angular.isDefined,
	isUndefined = angular.isUndefined,
	isNumber = angular.isNumber,
	isObject = angular.isObject,
	isArray = angular.isArray,
	extend = angular.extend,
	toJson = angular.toJson;



angular.module('localStorageService', [])
	.provider('localStorageService', function() {
		// You should set a prefix to avoid overwriting any local storage variables from the rest of your app
		// e.g. localStorageServiceProvider.setPrefix('yourAppName');
		// With provider you can use config as this:
		// myApp.config(function (localStorageServiceProvider) {
		//    localStorageServiceProvider.prefix = 'yourAppName';
		// });
		this.prefix = 'ls';

		// You could change web storage type localstorage or sessionStorage
		this.storageType = 'localStorage';

		// Cookie options (usually in case of fallback)
		// expiry = Number of days before cookies expire // 0 = Does not expire
		// path = The web path the cookie represents
		this.cookie = {
			expiry: 30,
			path: '/'
		};

		// Send signals for each of the following actions?
		this.notify = {
			setItem: true,
			removeItem: false
		};

		// Setter for the prefix
		this.setPrefix = function(prefix) {
			this.prefix = prefix;
			return this;
		};

		// Setter for the storageType
		this.setStorageType = function(storageType) {
			this.storageType = storageType;
			return this;
		};

		// Setter for cookie config
		this.setStorageCookie = function(exp, path) {
			this.cookie.expiry = exp;
			this.cookie.path = path;
			return this;
		};

		// Setter for cookie domain
		this.setStorageCookieDomain = function(domain) {
			this.cookie.domain = domain;
			return this;
		};

		// Setter for notification config
		// itemSet & itemRemove should be booleans
		this.setNotify = function(itemSet, itemRemove) {
			this.notify = {
				setItem: itemSet,
				removeItem: itemRemove
			};
			return this;
		};

		this.$get = ['$rootScope', '$window', '$document', '$parse', function($rootScope, $window, $document, $parse) {
			var self = this;
			var prefix = self.prefix;
			var cookie = self.cookie;
			var notify = self.notify;
			var storageType = self.storageType;
			var webStorage;

			// When Angular's $document is not available
			if (!$document) {
				$document = document;
			} else if ($document[0]) {
				$document = $document[0];
			}

			// If there is a prefix set in the config lets use that with an appended period for readability
			if (prefix.substr(-1) !== '.') {
				prefix = !!prefix ? prefix + '.' : '';
			}
			var deriveQualifiedKey = function(key) {
				return prefix + key;
			};
			// Checks the browser to see if local storage is supported
			var browserSupportsLocalStorage = (function () {
				try {
					var supported = (storageType in $window && $window[storageType] !== null);

					// When Safari (OS X or iOS) is in private browsing mode, it appears as though localStorage
					// is available, but trying to call .setItem throws an exception.
					//
					// "QUOTA_EXCEEDED_ERR: DOM Exception 22: An attempt was made to add something to storage
					// that exceeded the quota."
					var key = deriveQualifiedKey('__' + Math.round(Math.random() * 1e7));
					if (supported) {
						webStorage = $window[storageType];
						webStorage.setItem(key, '');
						webStorage.removeItem(key);
					}

					return supported;
				} catch (e) {
					storageType = 'cookie';
					$rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
					return false;
				}
			}());

			// Directly adds a value to local storage
			// If local storage is not available in the browser use cookies
			// Example use: localStorageService.add('library','angular');
			var addToLocalStorage = function (key, value) {
				// Let's convert undefined values to null to get the value consistent
				if (isUndefined(value)) {
					value = null;
				} else {
					value = toJson(value);
				}

				// If this browser does not support local storage use cookies
				if (!browserSupportsLocalStorage || self.storageType === 'cookie') {
					if (!browserSupportsLocalStorage) {
						$rootScope.$broadcast('LocalStorageModule.notification.warning', 'LOCAL_STORAGE_NOT_SUPPORTED');
					}

					if (notify.setItem) {
						$rootScope.$broadcast('LocalStorageModule.notification.setitem', {key: key, newvalue: value, storageType: 'cookie'});
					}
					return addToCookies(key, value);
				}

				try {
					if (webStorage) {
						webStorage.setItem(deriveQualifiedKey(key), value);
					}
					if (notify.setItem) {
						$rootScope.$broadcast('LocalStorageModule.notification.setitem', {key: key, newvalue: value, storageType: self.storageType});
					}
				} catch (e) {
					$rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
					return addToCookies(key, value);
				}
				return true;
			};

			// Directly get a value from local storage
			// Example use: localStorageService.get('library'); // returns 'angular'
			var getFromLocalStorage = function (key) {

				if (!browserSupportsLocalStorage || self.storageType === 'cookie') {
					if (!browserSupportsLocalStorage) {
						$rootScope.$broadcast('LocalStorageModule.notification.warning', 'LOCAL_STORAGE_NOT_SUPPORTED');
					}

					return getFromCookies(key);
				}

				var item = webStorage ? webStorage.getItem(deriveQualifiedKey(key)) : null;
				// angular.toJson will convert null to 'null', so a proper conversion is needed
				// FIXME not a perfect solution, since a valid 'null' string can't be stored
				if (!item || item === 'null') {
					return null;
				}

				try {
					return JSON.parse(item);
				} catch (e) {
					return item;
				}
			};

			// Remove an item from local storage
			// Example use: localStorageService.remove('library'); // removes the key/value pair of library='angular'
			var removeFromLocalStorage = function () {
				var i, key;
				for (i=0; i<arguments.length; i++) {
					key = arguments[i];
					if (!browserSupportsLocalStorage || self.storageType === 'cookie') {
						if (!browserSupportsLocalStorage) {
							$rootScope.$broadcast('LocalStorageModule.notification.warning', 'LOCAL_STORAGE_NOT_SUPPORTED');
						}

						if (notify.removeItem) {
							$rootScope.$broadcast('LocalStorageModule.notification.removeitem', {key: key, storageType: 'cookie'});
						}
						removeFromCookies(key);
					}
					else {
						try {
							webStorage.removeItem(deriveQualifiedKey(key));
							if (notify.removeItem) {
								$rootScope.$broadcast('LocalStorageModule.notification.removeitem', {
									key: key,
									storageType: self.storageType
								});
							}
						} catch (e) {
							$rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
							removeFromCookies(key);
						}
					}
				}
			};

			// Return array of keys for local storage
			// Example use: var keys = localStorageService.keys()
			var getKeysForLocalStorage = function () {

				if (!browserSupportsLocalStorage) {
					$rootScope.$broadcast('LocalStorageModule.notification.warning', 'LOCAL_STORAGE_NOT_SUPPORTED');
					return [];
				}

				var prefixLength = prefix.length;
				var keys = [];
				for (var key in webStorage) {
					// Only return keys that are for this app
					if (key.substr(0, prefixLength) === prefix) {
						try {
							keys.push(key.substr(prefixLength));
						} catch (e) {
							$rootScope.$broadcast('LocalStorageModule.notification.error', e.Description);
							return [];
						}
					}
				}
				return keys;
			};

			// Remove all data for this app from local storage
			// Also optionally takes a regular expression string and removes the matching key-value pairs
			// Example use: localStorageService.clearAll();
			// Should be used mostly for development purposes
			var clearAllFromLocalStorage = function (regularExpression) {

				// Setting both regular expressions independently
				// Empty strings result in catchall RegExp
				var prefixRegex = !!prefix ? new RegExp('^' + prefix) : new RegExp();
				var testRegex = !!regularExpression ? new RegExp(regularExpression) : new RegExp();

				if (!browserSupportsLocalStorage || self.storageType === 'cookie') {
					if (!browserSupportsLocalStorage) {
						$rootScope.$broadcast('LocalStorageModule.notification.warning', 'LOCAL_STORAGE_NOT_SUPPORTED');
					}
					return clearAllFromCookies();
				}

				var prefixLength = prefix.length;

				for (var key in webStorage) {
					// Only remove items that are for this app and match the regular expression
					if (prefixRegex.test(key) && testRegex.test(key.substr(prefixLength))) {
						try {
							removeFromLocalStorage(key.substr(prefixLength));
						} catch (e) {
							$rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
							return clearAllFromCookies();
						}
					}
				}
				return true;
			};

			// Checks the browser to see if cookies are supported
			var browserSupportsCookies = (function() {
				try {
					return $window.navigator.cookieEnabled ||
					("cookie" in $document && ($document.cookie.length > 0 ||
						($document.cookie = "test").indexOf.call($document.cookie, "test") > -1));
					} catch (e) {
						$rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
						return false;
					}
				}());

				// Directly adds a value to cookies
				// Typically used as a fallback is local storage is not available in the browser
				// Example use: localStorageService.cookie.add('library','angular');
				var addToCookies = function (key, value, daysToExpiry) {

					if (isUndefined(value)) {
						return false;
					} else if(isArray(value) || isObject(value)) {
						value = toJson(value);
					}

					if (!browserSupportsCookies) {
						$rootScope.$broadcast('LocalStorageModule.notification.error', 'COOKIES_NOT_SUPPORTED');
						return false;
					}

					try {
						var expiry = '',
						expiryDate = new Date(),
						cookieDomain = '';

						if (value === null) {
							// Mark that the cookie has expired one day ago
							expiryDate.setTime(expiryDate.getTime() + (-1 * 24 * 60 * 60 * 1000));
							expiry = "; expires=" + expiryDate.toGMTString();
							value = '';
						} else if (isNumber(daysToExpiry) && daysToExpiry !== 0) {
							expiryDate.setTime(expiryDate.getTime() + (daysToExpiry * 24 * 60 * 60 * 1000));
							expiry = "; expires=" + expiryDate.toGMTString();
						} else if (cookie.expiry !== 0) {
							expiryDate.setTime(expiryDate.getTime() + (cookie.expiry * 24 * 60 * 60 * 1000));
							expiry = "; expires=" + expiryDate.toGMTString();
						}
						if (!!key) {
							var cookiePath = "; path=" + cookie.path;
							if(cookie.domain){
								cookieDomain = "; domain=" + cookie.domain;
							}
							$document.cookie = deriveQualifiedKey(key) + "=" + encodeURIComponent(value) + expiry + cookiePath + cookieDomain;
						}
					} catch (e) {
						$rootScope.$broadcast('LocalStorageModule.notification.error', e.message);
						return false;
					}
					return true;
				};

				// Directly get a value from a cookie
				// Example use: localStorageService.cookie.get('library'); // returns 'angular'
				var getFromCookies = function (key) {
					if (!browserSupportsCookies) {
						$rootScope.$broadcast('LocalStorageModule.notification.error', 'COOKIES_NOT_SUPPORTED');
						return false;
					}

					var cookies = $document.cookie && $document.cookie.split(';') || [];
					for(var i=0; i < cookies.length; i++) {
						var thisCookie = cookies[i];
						while (thisCookie.charAt(0) === ' ') {
							thisCookie = thisCookie.substring(1,thisCookie.length);
						}
						if (thisCookie.indexOf(deriveQualifiedKey(key) + '=') === 0) {
							var storedValues = decodeURIComponent(thisCookie.substring(prefix.length + key.length + 1, thisCookie.length));
							try {
								return JSON.parse(storedValues);
							} catch(e) {
								return storedValues;
							}
						}
					}
					return null;
				};

				var removeFromCookies = function (key) {
					addToCookies(key,null);
				};

				var clearAllFromCookies = function () {
					var thisCookie = null, thisKey = null;
					var prefixLength = prefix.length;
					var cookies = $document.cookie.split(';');
					for(var i = 0; i < cookies.length; i++) {
						thisCookie = cookies[i];

						while (thisCookie.charAt(0) === ' ') {
							thisCookie = thisCookie.substring(1, thisCookie.length);
						}

						var key = thisCookie.substring(prefixLength, thisCookie.indexOf('='));
						removeFromCookies(key);
					}
				};

				var getStorageType = function() {
					return storageType;
				};

				// Add a listener on scope variable to save its changes to local storage
				// Return a function which when called cancels binding
				var bindToScope = function(scope, key, def, lsKey) {
					lsKey = lsKey || key;
					var value = getFromLocalStorage(lsKey);

					if (value === null && isDefined(def)) {
						value = def;
					} else if (isObject(value) && isObject(def)) {
						value = extend(value, def);
					}

					$parse(key).assign(scope, value);

					return scope.$watch(key, function(newVal) {
						addToLocalStorage(lsKey, newVal);
					}, isObject(scope[key]));
				};

				// Return localStorageService.length
				// ignore keys that not owned
				var lengthOfLocalStorage = function() {
					var count = 0;
					var storage = $window[storageType];
					for(var i = 0; i < storage.length; i++) {
						if(storage.key(i).indexOf(prefix) === 0 ) {
							count++;
						}
					}
					return count;
				};

				return {
					isSupported: browserSupportsLocalStorage,
					getStorageType: getStorageType,
					set: addToLocalStorage,
					add: addToLocalStorage, //DEPRECATED
					get: getFromLocalStorage,
					keys: getKeysForLocalStorage,
					remove: removeFromLocalStorage,
					clearAll: clearAllFromLocalStorage,
					bind: bindToScope,
					deriveKey: deriveQualifiedKey,
					length: lengthOfLocalStorage,
					cookie: {
						isSupported: browserSupportsCookies,
						set: addToCookies,
						add: addToCookies, //DEPRECATED
						get: getFromCookies,
						remove: removeFromCookies,
						clearAll: clearAllFromCookies
					}
				};
			}];
	});