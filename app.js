var request = require('request');
var parseLinks = require('parse-links');

var standardHeaders = {
	'Authorization': 'token 940eae6e80e02cb43c5051d070a4aa191ae3cdf4',
	'User-Agent': 'Data App'
};


var callback = function(error, response, body){
	if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        console.log(info);
    }
}

var repos = [];


function getData(url){
	url = url || 'https://api.github.com/orgs/sparcedge/repos';
	var options = {
		url: url,
		headers: standardHeaders,
		json: true
	};

	request(
		options, 
		function(error, response, body){
			if (!error && response.statusCode == 200) {
				var next = parseLinks(response.headers.link).next;
				//add all the results to the repos array
				delete(body.meta);
				repos = repos.concat(body);	

				if(next){
					getData(next);
				} else {
					getContributorData(0, report);
				}
			}	
		}
	);
}

function getContributorData(index, callback){
	console.log('index=' + index);
	if (index < repos.length){
		var repo = repos[index];
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
				// repo.contributors.push(body[j]);
			}
			getContributorData(index+1, callback);
		});
	} else {
		callback();
	}			
}

function report(){
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
}


getData();