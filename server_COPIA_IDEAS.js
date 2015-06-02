// server.js

// BASE SETUP
// ==============================================

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');

var app = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var port = process.env.PORT || 8080;


//----------------------------------------------------------------------------------------
 
var sql = require('mssql'); 

var config = {
    user: 'dsinfo',
    password: 'dsinfo12345',	// 'localhost\\instance' to connect to named instance 
    
    server: 'emazzu-sql-2012.cloudapp.net',
    database: 'dataOxy',	// You can enable streaming globally
    stream: true,
    
    options: {
        encrypt: true	// Use this if you're on Windows Azure 
    }
}

connection = new sql.Connection(config, function(err) {

	if (err != null) {
		console.log(err);
	}
    
    // Query 
    
});

//connection.close();

//----------------------------------------------------------------------------------------


// ROUTES
// ==============================================

// sample route with a route the way we're used to seeing it
app.get('/sample', function(req, res) {

	res.send('this is a sample!');	

    var str_Query = 'select top 10000 Id, Nombre, Comentario from pozos order by Id';

    // or: var request = connection.request(); 
    var request = new sql.Request(connection); 
    //request.stream = true; // You can set streaming differently for each request
  	request.query(str_Query);    		
    //});  // or request.execute(procedure);

    request.on('error', function(err) {
        console.log(err);
    });
    
    request.on('row', function(row) {
        // Always emitted as the last one 
       console.log(row);
    });
	
    request.on('done', function(returnValue) {
        // Always emitted as the last one 
       console.log('done');
    });


  //   , function(err, recordset) {

		// if (err != null) {
		// 	console.log(err);
		// }
        
  //       //console.log(recordset);
  //       //res.send(recordset);
  //       recordset.render;
  //   });

});

// we'll create our routes here

// get an instance of router
var router = express.Router();


/****************** Request stack ******************
 *
 * Express handles routing by a defining a rule based stack that all requests passes through.
 * Each layer in the stack is defined by a function. The request is passed down the chain and until it
 * matches a route. If that function matching the route returns a response the chain is exited.
 * Otherwise the request passes down to the next layer in the stack.
 */


// -- Middleware --
// Middleware is stuff that filters all requests. Middleware ends by passing the request
// to the next function in line by calling next();
// BTW: writing the function below like app.use("/*", function(req, res, next) { .. }) would
// have given the same result.
router.use(function(req, res, next) {

	// log each request to the console
	console.log(req.method, req.url);

	// continue doing what we were doing and go to the route
	next();	
});

// home page route (http://localhost:8080)
router.get('/', function(req, res) {
	res.send('im the home page!');	
});

// about page route (http://localhost:8080/about)
router.get('/about', function(req, res) {
	res.send('im the about page!');	
});

// Respond with a HTML string
// html page route (http://localhost:8080/html)
app.get("/html", function(req, res) {
  res.send("<!DOCTYPE html><html><title>String</title><body><h1>HTLM String</h1></body><html>");
});

app.getAuthorAsJson = function () {
  return {username : "patricjansson", name : "Patric Jansson", twitter : "@patricjansson"};
}

// Respond with json
// html page route (http://localhost:8080/json)
app.get("/json", function(req, res) {
  res.json(app.getAuthorAsJson());
});


// -- Pre-method url parsing
// Express has a nice feature that, much like middleware,
// can extract data from the url before the actual method handle function
// is invoked. For example it would be nice to read the correct user from
// a database before invoking the routing.
// NOTE: This example will match all ":name" in any request
router.param('name', function(req, res, next, name) {
	// do validation on name here
	// blah blah validation
	// log something so we know its working
	console.log('doing name validations on ' + name);

	// once validation is done save the new item in the req
	req.name = name;
	// go to the next thing
	next();	
});

// route with parameters (http://localhost:8080/hello/:name)
router.get('/hello/:name', function(req, res) {
	res.send('hello ' + req.name + '!');
});


// apply the routes to our application
app.use('/', router);

// login routes
app.route('/login')

	// show the form (GET http://localhost:8080/login)
	.get(function(req, res) {
		res.send('this is the login form');
	})

	// process the form (POST http://localhost:8080/login)
	.post(function(req, res) {
		console.log('processing');
		res.send('processing the login form!');
	});




// START THE SERVER
// ==============================================
http.createServer(app).listen(port);
//app.listen(port);
console.log('Magic happens on port ' + port);
