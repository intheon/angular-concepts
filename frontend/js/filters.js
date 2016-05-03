// Controller for getting data from server and presenting to view
app.filter("deepFilter", () => {

	return function(allTags, clickedTags){

		if (!allTags || !clickedTags) return;
		else
		{
			let toReturn = [];

			// first, cycle through each skatepark
			angular.forEach(allTags, (value, key) => {

				// second, cycle through each tag in that skatepark
				angular.forEach(value.skateparkTags, (value2, key2) => {

					// third, cycle through the supplied tags and try find a match
					angular.forEach(clickedTags, (value3, key3) => {

						if (value2 == value3)
						{
							toReturn.push(value);
						}

					});

				});

			});

			return toReturn;

		}

	}


});