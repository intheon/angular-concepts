"use strict";

// Requires
const express         = require('express');
const mongoose        = require('mongoose');
const app             = express();
const http 			  = require("http").Server(app);
const io 			  = require("socket.io")(http);
const port            = process.env.PORT || 1337;
const morgan          = require('morgan');
const bodyParser      = require('body-parser');
const methodOverride  = require('method-override');

// MongoDB config
const dbString 	      = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://127.0.0.1/angular-concepts";

// Mongo Connect
mongoose.connect(dbString, (err, res) => {
	if (err) console.log("error connecting to " + dbString + " with error -> " + err);
	else console.log ('Succeeded connected to: ' + dbString);
});

// Expose the 'frontend' and 'libraries' folder for all
app.use(express.static(__dirname + '/frontend'));
app.use('/libraries',  express.static(__dirname + '/libraries'));

// Allow headers / datatypes etc to be set
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.urlencoded({extended: true}));               // parse application/x-www-form-urlencoded
app.use(bodyParser.text());                                     // allows bodyParser to look at raw text
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));  // parse application/vnd.api+json as json
app.use(methodOverride());

// Routes
// ------------------------------------------------------
require('./backend/routes.js')(app);

// Socket.io config
//require('./backend/socket.js')(http);


io.on("connection", (socket) => {

	console.log("user connected");
	const connected = io.engine.clientsCount;

	socket.on("disconnect", (socket) => {

		console.log("user disconnected");
		io.emit("user disconnected", connected);

	});

	socket.on("user joined", (conCount) => {

		io.emit("user joined", connected);

	});

});


// Start
// -------------------------------------------------------
http.listen(port, () => {

	console.log("Server is alive on port " + port);

})