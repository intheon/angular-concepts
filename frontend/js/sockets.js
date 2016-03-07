const socket = io();

$(document).ready(() => {

	socket.emit("user joined");

});

socket.on("user joined", (conCount) => {

	$(".number-connected-users").html(conCount);

});

socket.on("user disconnected", (conCount) => {
	console.log(conCount);

	$(".number-connected-users").html(conCount);

});