var request = require('request');
var parseLinks = require('parse-links');
var async = require('async');

var standardHeaders = {
	'Authorization': 'token 940eae6e80e02cb43c5051d070a4aa191ae3cdf4',
	'User-Agent': 'Data App'
};

var repos = [];

//main function execution
runReport();

function runReport(){
	async.series([
		getRepoData,
		getContributorData,
		printResults
		],
		function(err, results){
			console.log(results);
		}
	);
}


function getRepoData(callback){
	console.log("getting Repo Data");
	var url = 'https://api.github.com/orgs/sparcedge/repos';
	async.whilst(
		//test
		function(){
			console.log("url is: " + url);
			return url;
		},
		//fn
		function(callback){
			var options = {
				url: url,
				headers: standardHeaders,
				json: true
			};
			request(
				options, 
				function(error, response, body){
					//update the url to the next page if there is one
					url = parseLinks(response.headers.link).next;

					if (!error && response.statusCode == 200) {
						//add all the results to the repos array
						delete(body.meta);
						repos = repos.concat(body);	
					}	
					callback();
				}
			);
		},
		//callback
		callback
	);
}

function getContributorData(callback){
	console.log("getting Contributor Data");
	var index = 0;
	async.whilst(
		//test
		function(){
			return index < repos.length;
		},
		//fn
		function(callback){
			
			var repo = repos[index];
			console.log("Repo is: " + repo.name);
			var url = 'https://api.github.com/repos/sparcedge/' + repo.name + '/contributors';
			var options = {
				url: url,
				headers: standardHeaders,
				json: true
			};

			request(options, function(error, response, body){
				repo.contributors = [];
				for(var j=0; j<body.length; j++){
					repo.contributors.push({login: body[j].login, commitCount: body[j].contributions});
				}
				index++;
				callback();
			});
		},
		callback
	);
}

function printResults(callback){
	console.log(repos.length + ' total repositories');	
	
	for(var i=0; i<repos.length; i++){
		var repo = repos[i];
		console.log({
			name: repo.name, 
			description: repo.description, 
			url: repo.html_url, 
			created: repo.created_at,
			lastCommit: repo.pushed_at,
			contributors: repo.contributors});
	}

	callback(null, 'step 3');
}


