// Dependencies
const Mongoose 			= require('mongoose');
const Skateparks		= require('./model.js');

// Opens App Routes
module.exports = function(app) {

	// GET Routes
	// --------------------------------------------------------
	// Retreive all skateparks in db
	app.get('/skateparks', (req, res) => {

		// Uses Mongoose schema to run the search (empty conditions)
		const query = Skateparks.find({});
		query.exec((err, skateparks) => {
		
			// Test for errors
			if(err)	res.send(err);

			// If no errors are found, it responds with a JSON of all skateparks
			res.json(skateparks);
		});
	});

	// POST Routes
	// --------------------------------------------------------
	// Provides method for saving new skateparks to the db
	app.post('/skateparks', (req, res) => {

		// Creates a new skatepark based on the Mongoose Schema
		const newSkatepark = new Skateparks(req.body);

		// New skatepark is saved to the db
		newSkatepark.save((err) => {
			
			// Test for errors
			if(err) res.send(err);

			// If no errors are found, it responds with a JSON of the new skatepark
			res.json(req.body);
		});
	});

	// PUT Routes
	// --------------------------------------------------------
	// Method for updating a particular skatepark
	app.put("/skateparks/:id", (req, res) => {

		const q = { "_id": req.params.id};
		const b = req.body;

		Skateparks.findOneAndUpdate(q, b, (err, doc) => {

			if (err) return res.send(500, { error: err });

		});


	});
};  