//require variables
var dateformat = require("dateformat");
var keys = require("./keys.js");
var twitterPackage = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");
var fs = require("fs");
var arg1 = process.argv[2];
var arg2 = process.argv[3];

getarg1(arg1, arg2);

function getarg1(arg1, arg2){
	switch (arg1){
		case "my-tweets":
			myTweets(arg2);
			break;
		case "spotify-this-song":
			spotifyThisSong(arg2);
			break;
		case "movie-this":
			movieThis(arg2);
			break;
		case "do-what-it-says":
			doWhatItSays();
			break;
		default:
			log("Enter one of these commands: <my-tweets> <spotify-this-song> <movie-this> <do-what-it-says>");
	}	
}

function myTweets(arg2){
	//if 2nd argument is blank, just use my test account
	if(arg2 === undefined){
		arg2 = "mrztest";
	}
	var secret = {
	  consumer_key: keys.twitterKeys.consumer_key,
	  consumer_secret: keys.twitterKeys.consumer_secret,
	  access_token_key: keys.twitterKeys.access_token_key,
	  access_token_secret: keys.twitterKeys.access_token_secret
	}
	var twitter = new twitterPackage(secret);
	//parameters
	var params = {screen_name: arg2, count: 10};
	//get last 10 tweets from twitter account
	twitter.get('statuses/user_timeline', params,  function(error, tweets, response){
	  if(error){
	    log(error);
	  }
	  //get tweets from response
	  log("---------------Tweets------------------------")
	  for (var i = 0; i < tweets.length; i++) {	  	
	  	log(dateformat(tweets[i].created_at, "mm/dd/yy h:MM:ss TT Z") + " - " + tweets[i].text);

	  }
	});
}

function spotifyThisSong(arg2){
	//if no song is provided in the command prompt
	if(arg2 === undefined){
		arg2 = "The Sign";
	}
	var secret = {
		id: keys.spotifyKeys.client_id,
		secret: keys.spotifyKeys.client_secret
	}
	var spotify = new Spotify(secret);

	spotify.search({type: "track", query: arg2, limit: 10}, function(err, data){
		if(err){
			return log(err);
		}
		if(data.tracks.total === 0){
			spotify.search({type: "track", query: "The Sign", limit: 10}, function(err, data){
				if(err){
					return log(err);
				}
				consoleTrackData(data);
			});
		}else{
			consoleTrackData(data);
		}
	});
}

function consoleTrackData(data){
	var trackurl = "https://open.spotify.com/embed?uri=spotify:track:";
	var songInfo = data.tracks.items;
	log("-------------------Spotify Info------------------------------")
	for (var i = 0; i < songInfo.length; i++) {
		//album name
		log("Album name: " + JSON.stringify(songInfo[i].album.name, null, 2));
		//artist name
		log("Artist name: " + JSON.stringify(songInfo[i].artists[0].name, null, 2));
		//url
		log("Song URL name: " + JSON.stringify(trackurl+songInfo[i].id, null, 2));
		//song name
		log("Song name: " + JSON.stringify(songInfo[i].name, null, 2));
		log("-------------------------------------------")
	 }
}

function doWhatItSays(){
	fs.readFile('./random.txt', 'utf8', function(err, data) {
	  if (err){
	  	log(err);
	  }
	  var randArray = data.split(",");	  
	  arg2 = randArray[1];
	  getarg1(randArray[0], randArray[1]);
	});
}

function movieThis(arg2){
	//if arg2 is blank, Mr Nobody
	if(arg2 === undefined){
		arg2 = "Mr. Nobody";
	}
	//get key from file
	var omdbKey = keys.omdbKeys.api_key;
	var movieName = arg2;
	var queryUrl = "http://www.omdbapi.com/?t=" + movieName + "&y=&plot=short&apikey="+omdbKey;
	request(queryUrl, function(error, response, body) {
	  if (!error && response.statusCode === 200) {
	    // Parse the body
	    // console.log(JSON.parse(body));
	    log("--------------------Movie this-----------------")
	    log("Title: " + JSON.parse(body).Title);
	    log("Year: " + JSON.parse(body).Year);
	    log("IMDB Rating: " + JSON.parse(body).Ratings.find((element) => element.Source === "Internet Movie Database").Value);
	    log("Rotten Tomatoes Rating: " + JSON.parse(body).Ratings.find((element) => element.Source === "Rotten Tomatoes").Value);
	    log("Country: " + JSON.parse(body).Country);
		log("Language: " + JSON.parse(body).Language);
		log("Plot: " + JSON.parse(body).Plot);
		log("Actors: " + JSON.parse(body).Actors);
	  }
	});
}

function log(message){
	console.log(message);
	fs.appendFile('log.txt', message + '\r\n', (err) => {
	  if (err) throw err;
	});
}