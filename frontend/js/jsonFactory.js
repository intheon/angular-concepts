"use strict";

angular.module("getJson", [])
	.factory("getJson", ($http) => {

		return $http.get("/js/data.json");

	});