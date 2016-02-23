const app = angular.module("testAngular", []);

// Controller for getting data from server

app.controller("appController", ($scope, $http) => {

	$scope.allData = [

		{
			"_id": "56cc612281e2d9457cc4682a",
			"picture": "http://placehold.it/32x32",
			"name": "Cosmetex",
			"rating": 8,
			"addedBy": "Barrett Mcclain",
			"desc": "Ea minim proident ipsum reprehenderit ad dolor laborum incididunt deserunt anim labore velit Lorem nisi. Aute reprehenderit et tempor veniam amet sit. Fugiat laborum quis voluptate et et incididunt voluptate commodo elit incididunt occaecat sunt magna. Consequat duis aliquip mollit occaecat ex mollit irure non exercitation fugiat est occaecat occaecat. Ex ipsum non officia esse in sint Lorem cillum sit fugiat. Occaecat laboris mollit ea labore occaecat excepteur pariatur fugiat proident culpa deserunt pariatur reprehenderit. Do tempor aliquip nisi officia.\r\n",
			"latitude": -9.397403,
			"longitude": 25.435873
		},
		{
			"_id": "56cc61220367194cfc74687b",
			"picture": "http://placehold.it/32x32",
			"name": "Puria",
			"rating": 0,
			"addedBy": "Dejesus Anderson",
			"desc": "Excepteur mollit ullamco aute duis exercitation incididunt. Do est excepteur tempor adipisicing officia dolor id. Nostrud et elit consectetur aliquip nisi. Id commodo duis esse ullamco dolore cillum labore id incididunt occaecat commodo veniam magna pariatur. Nisi velit eiusmod nostrud excepteur nostrud sit nisi est nostrud occaecat ad reprehenderit deserunt.\r\n",
			"latitude": 16.016918,
			"longitude": -4.359025
		},
		{
			"_id": "56cc612281365cf43bfc12d6",
			"picture": "http://placehold.it/32x32",
			"name": "Macronaut",
			"rating": 3,
			"addedBy": "Kelli Buchanan",
			"desc": "Ex est ex reprehenderit laborum velit aute nisi consectetur adipisicing excepteur minim. Aliqua incididunt commodo do do anim qui excepteur aute. Aute sit incididunt aliqua esse ipsum ipsum sint aute excepteur tempor nulla mollit velit. Lorem excepteur tempor anim occaecat. Sunt ea laborum dolor aliqua elit tempor minim nisi deserunt eu adipisicing ea excepteur. Commodo deserunt et quis ea.\r\n",
			"latitude": 19.557404,
			"longitude": -131.526436
		},
		{
			"_id": "56cc6122f557bb79fcd4c232",
			"picture": "http://placehold.it/32x32",
			"name": "Uberlux",
			"rating": 9,
			"addedBy": "Kate Dudley",
			"desc": "Velit sit nisi esse occaecat elit tempor velit consequat. Duis enim eiusmod amet tempor ea. Ullamco culpa occaecat veniam velit qui magna cupidatat mollit. Amet incididunt veniam eu occaecat. Ipsum adipisicing cupidatat reprehenderit adipisicing tempor cupidatat id officia.\r\n",
			"latitude": -44.410438,
			"longitude": -161.443936
		},
		{
			"_id": "56cc61225582992021bc9608",
			"picture": "http://placehold.it/32x32",
			"name": "Gallaxia",
			"rating": 7,
			"addedBy": "Herring Curry",
			"desc": "Magna ad do labore reprehenderit eu aliquip aliquip ullamco exercitation incididunt. Esse laboris culpa consequat amet mollit amet aliqua et deserunt cupidatat do labore commodo veniam. Pariatur commodo cillum ut magna duis occaecat laborum sit et sint magna.\r\n",
			"latitude": -43.500355,
			"longitude": -101.292454
		},
		{
			"_id": "56cc612244a88fffa5ff32b7",
			"picture": "http://placehold.it/32x32",
			"name": "Pulze",
			"rating": 2,
			"addedBy": "Lenora Blake",
			"desc": "Fugiat eiusmod tempor culpa occaecat nulla non deserunt aliquip eu in ullamco. Lorem ipsum esse aute sint tempor quis do cillum pariatur aliquip ullamco. Fugiat ut elit do ut cupidatat. Aute Lorem elit veniam laborum nostrud ullamco.\r\n",
			"latitude": -26.190701,
			"longitude": -107.150548
		},
		{
			"_id": "56cc6122e0476f3eb01cf967",
			"picture": "http://placehold.it/32x32",
			"name": "Kineticut",
			"rating": 1,
			"addedBy": "Leola Beasley",
			"desc": "Enim esse minim nulla nulla amet. Fugiat pariatur ex labore aute. Laborum ut ullamco laborum aute aliquip proident nostrud qui Lorem dolore quis.\r\n",
			"latitude": -74.651905,
			"longitude": -2.356772
		},
		{
			"_id": "56cc6122d8ab44a9e6fb42b4",
			"picture": "http://placehold.it/32x32",
			"name": "Halap",
			"rating": 4,
			"addedBy": "Sheppard Duran",
			"desc": "Ullamco excepteur duis non esse deserunt enim sint irure velit ut. Exercitation fugiat duis nulla tempor dolor magna et reprehenderit deserunt voluptate ut duis eiusmod dolore. Labore labore incididunt consequat magna sunt mollit occaecat. Lorem incididunt voluptate occaecat ipsum aliqua.\r\n",
			"latitude": -34.718767,
			"longitude": 122.029365
		},
		{
			"_id": "56cc6122427f0748a8793336",
			"picture": "http://placehold.it/32x32",
			"name": "Netagy",
			"rating": 3,
			"addedBy": "Diann Preston",
			"desc": "Id mollit labore anim sunt laborum commodo ullamco dolor laboris. Excepteur incididunt veniam ipsum id. Nostrud pariatur nostrud deserunt sint cupidatat amet proident Lorem. Fugiat eu dolor velit minim elit est proident est magna laboris proident est duis. Labore qui elit aliquip commodo dolor cillum est do esse est veniam sunt occaecat.\r\n",
			"latitude": -80.566328,
			"longitude": 163.579016
		},
		{
			"_id": "56cc612271d4d1fcdac187fc",
			"picture": "http://placehold.it/32x32",
			"name": "Skyplex",
			"rating": 9,
			"addedBy": "Rodgers Carey",
			"desc": "Cupidatat pariatur cillum amet ex aliqua laborum labore labore excepteur. Ullamco do aliquip est tempor officia cupidatat officia ut non adipisicing anim mollit officia. Id reprehenderit dolore anim minim duis pariatur aute veniam. Cillum nulla sint nulla occaecat. Ea sit dolore ea aliqua duis minim aliqua esse ad consequat.\r\n",
			"latitude": 49.618079,
			"longitude": 30.195947
		},
		{
			"_id": "56cc61227b624523f9f4a92d",
			"picture": "http://placehold.it/32x32",
			"name": "Oatfarm",
			"rating": 3,
			"addedBy": "Margery Shaffer",
			"desc": "Quis pariatur anim ex tempor ea eu commodo voluptate exercitation in. Quis minim adipisicing ex labore duis anim do ut amet amet est. Reprehenderit non aute Lorem nisi aliquip id et ea id sit magna duis amet. Cupidatat non qui exercitation in et.\r\n",
			"latitude": 35.491692,
			"longitude": -13.697486
		},
		{
			"_id": "56cc6122dd5a2995a5860f6e",
			"picture": "http://placehold.it/32x32",
			"name": "Fortean",
			"rating": 6,
			"addedBy": "Thornton Hill",
			"desc": "Esse cupidatat consequat eiusmod laboris. Incididunt velit duis consequat pariatur esse sint. Eiusmod magna ea et labore sit proident incididunt tempor. Ut in deserunt nulla occaecat laboris sint do elit. Adipisicing consectetur consectetur eiusmod consequat pariatur culpa ut eu eiusmod mollit. Ex eiusmod est aute aliquip tempor eiusmod esse ea irure duis cupidatat laborum velit consectetur.\r\n",
			"latitude": -66.772073,
			"longitude": 149.55215
		},
		{
			"_id": "56cc6122dbf7cc28eb4940b5",
			"picture": "http://placehold.it/32x32",
			"name": "Rodeomad",
			"rating": 8,
			"addedBy": "Stewart Yang",
			"desc": "Est fugiat anim et aliqua. Laboris ipsum proident cillum velit consequat. Do nostrud commodo labore esse commodo. Non labore eu exercitation amet consequat cillum Lorem pariatur. Aliquip consequat pariatur irure Lorem laboris commodo officia velit eu eiusmod cillum in aliqua irure.\r\n",
			"latitude": 26.640542,
			"longitude": 90.497972
		},
		{
			"_id": "56cc6122fd991749f08175f2",
			"picture": "http://placehold.it/32x32",
			"name": "Indexia",
			"rating": 8,
			"addedBy": "Winters Miller",
			"desc": "Nisi quis magna nulla culpa irure sunt nulla. Qui ex magna ipsum veniam ullamco aute dolor occaecat voluptate. Eu officia eiusmod eu sit ut pariatur veniam nisi ipsum qui nulla ullamco. Ipsum sit ex tempor veniam dolor elit Lorem Lorem sint do ipsum. Nulla dolor esse reprehenderit sit minim.\r\n",
			"latitude": 32.782523,
			"longitude": 169.931801
		},
		{
			"_id": "56cc6122a181f01a0d6acb63",
			"picture": "http://placehold.it/32x32",
			"name": "Inquala",
			"rating": 6,
			"addedBy": "Graham Gregory",
			"desc": "Do ullamco ex labore nulla cupidatat aliqua excepteur non ullamco eu. Officia sit eiusmod enim consequat amet laboris ullamco ut eiusmod excepteur anim. Ad ullamco nostrud officia nulla in incididunt amet nulla duis pariatur ad laboris excepteur consequat. Velit esse sunt culpa commodo commodo sunt dolore excepteur dolor voluptate dolor pariatur quis officia. Irure qui quis eiusmod consectetur labore labore incididunt minim amet enim velit adipisicing.\r\n",
			"latitude": -0.813239,
			"longitude": -31.971862
		}

	];

	// our search function
	$scope.searchParks = "";

	$scope.incrementRating = (item) => {

		item.rating += 1;

	};








});

