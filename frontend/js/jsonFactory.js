"use strict";

angular.module("getJson", [])
	.factory("getJson", ($http) => {

		return $http.get("/skateparks");

	});

	/*

angular.module("sendJson", [])
	.factory("sendJson", ($http) => {

		return $http.get("/js/data.json");

	});
	*/