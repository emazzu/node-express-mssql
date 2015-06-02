//  server.js

//  BASE SETUP
// ==============================================

var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');

var app = express();

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//  DECLARE     número de puerto
var port = process.env.PORT || 3000;

var sql = require('mssql'); 

//  localhost\\instance' De este modo, si hubiera instancia
var config = {user: 'xxxx', password: 'xxxx',
    server: 'emazzu-sql-2012.cloudapp.net',
    database: 'xxxx', stream: true,
    options: {encrypt: true} // Windows azure = true
}

//  INSTANCE    connection pool
var cn = new sql.Connection(config);


//  INSTANCE módulo express
var app = express();

// CONFIG   middleware bodyParser()
//          me permite parsear los POST, sean json o no, 
//          devuelve el resultado accesible vía variable req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// INSTANCE router
var router = express.Router();


//  CONFIG  Middleware para que todas las solicitudes, pasan por aca,
//          luego continuan, para entrar en el Ruteo que corresponda
app.use(function(req, res, next) {

 	// WebSite, que permito, agrego los metodos, true si mi sitio requiere cookies
   	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:' + port);
   	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
   	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
   	res.setHeader('Access-Control-Allow-Credentials', true);

	console.log(req.method);

    // continua
    next(); 
});


// CONFIG WELLS     http://localhost:port/wells/500
app.get('/wells/:top', function(req, res) {

    var resJson = "";
    var str_Query = "select top " + req.params.top + " Idwell, [Well Name] WellName, Area, Operator from pozos_vw order by [Well Name]";

    var request = new sql.Request(cn); 
    request.stream = true;              // You can set streaming differently for each request
    request.query(str_Query);

    // Evento por errores
    request.on('error', function(err) {
        console.log(err);
    });

    // Evento por cada fila
    request.on('row', function(row) {
        
        //  ADD cada fila que trae desde la base de datos
        //      para luego, devolver todo junto, al finalizar
        resJson += JSON.stringify(row) + ",";
    
    });

    //  Evento al finalizar todas las filas
    request.on('done', function(returnValue) {

        //  BUILD   json final, agrego corchetes en principio y fin
        //  DELEET  última coma, que viene del evento row
        resJson = "[" + resJson.substring(0, resJson.length-1) + "]";
        res.send(resJson);
    
    });

});


// CONFIG TESTS     http://localhost:port/tests/AH-1002
app.get('/tests/:wellname', function(req, res) {

    var resJson = "";

    var str_Query = "select Id, [Well ID], Date, Tst_gross, Tst_cut ,Prod_neta from CO_OilRateTest_vw where [Well ID] = '" +  req.params.wellname + "' order by Date DESC";

    var request = new sql.Request(cn);
    request.stream = true;              // You can set streaming differently for each request
    request.query(str_Query);

    // Evento por errores
    request.on('error', function(err) {
        console.log(err);
    });

    // Evento por cada fila
    request.on('row', function(row) {

        //  ADD cada fila que trae desde la base de datos
        //      para luego, devolver todo junto, al finalizar
        resJson += JSON.stringify(row) + ",";

    });

    //  Evento al finalizar todas las filas
    request.on('done', function(returnValue) {

        //  BUILD   json final, agrego corchetes en principio y fin
        //  DELEET  última coma, que viene del evento row
        resJson = "[" + resJson.substring(0, resJson.length-1) + "]";
        res.send(resJson);
    
    });

});



// CONFIG FULL     http://localhost:port/full/"cañadon seco*"
app.get('/full/:condition', function(req, res) {

    var resJson = "";

    //  BUILD condición final
    var str_Query = "select ROW_NUMBER() OVER(ORDER BY Well_Name) Cant, Well_Name, Area, District, Category, Operator from bb where CONTAINS (Well_Name,'" +  req.params.condition + "') order by Cant DESC";

    console.log(str_Query);

    var request = new sql.Request(cn);
    request.stream = true;                  // You can set streaming differently for each request
    request.query(str_Query);


    // Evento por errores
    request.on('error', function(err) {
        console.log(err);
    });

    // Evento por cada fila
    request.on('row', function(row) {

        resJson += JSON.stringify(row) + ",";

    });

    //  Evento al finalizar todas las filas
    request.on('done', function(returnValue) {

        //  BUILD   json final, agrego corchetes en principio y fin
        //  DELEET  última coma, que viene del evento row
        resJson = "[" + resJson.substring(0, resJson.length-1) + "]";
        //console.log(resJson);
        res.send(resJson);
    
    });

});



// CONFIG FULL     http://localhost:port/full/"cañadon seco*"
app.get('/entity/:name', function(req, res) {

    var resJson = "";

    //  BUILD condición final
    var str_Query = 
    "select ROW_NUMBER() OVER(ORDER BY Well_Name) Cant, Well_Name, Area, District, Category, Operator from bb where CONTAINS (Well_Name,'" +  req.params.condicion + "') order by Cant DESC";

    console.log(str_Query);

    var request = new sql.Request(cn);
    request.stream = true;                  // You can set streaming differently for each request
    request.query(str_Query);


    // Evento por errores
    request.on('error', function(err) {
        console.log(err);
    });

    // Evento por cada fila
    request.on('row', function(row) {

        resJson += JSON.stringify(row) + ",";

    });

    //  Evento al finalizar todas las filas
    request.on('done', function(returnValue) {

        //  BUILD   json final, agrego corchetes en principio y fin
        //  DELEET  última coma, que viene del evento row
        resJson = "[" + resJson.substring(0, resJson.length-1) + "]";
        //console.log(resJson);
        res.send(resJson);
    
    });

});



//  CONNECT     connection pool y levanto server
cn.connect().then(function() {

  console.log('Connection pool OK');

  var server = app.listen(port, function () {

    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);

  });

}).catch(function(err) {
  console.error('Error creating connection pool', err);
});
