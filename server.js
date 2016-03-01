"use strict";

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
mongoose.connect("mongodb://127.0.0.1/angular-concepts");

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

});


// Start
// -------------------------------------------------------
http.listen(1337, () => {

	console.log("Server is alive on port 1337");

})