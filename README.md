## API Rest - node 0.12.0 - express 4.12.1 - sql server

Estos son los primeros pasos hacia **node**, intentando minimizar la complejidad que propone Microsoft (complejidad me refiero, al tamaño del visual studio, a la compilación de cada pequeño cambio que se realice en el proyecto). Probando código y leyendo, le fui encontrando la vuelta. Les muestro un pequeño ejemplo, consultando datos contra un SQL Server.

##### Para tener en cuenta:
* Multiplataforma.
* Instalación inmediata de node, express, mssql.
* No requiere complilación, con un simple editor de texto, es suficiente.
* Fácil de llevar de acá para allá, gracias a github, npm y package.json donde se definen las dependencias del proyecto.

##### Comencemos con el ejemplo:
Con require, solicitamos los módulos de node, que queremos utilizar.
* **_express_**: Para poder trabajar con el framework Express.
* **_body-parser_**: Es un middleware, nos permite parsear los POST (json o no), nos devuelve el resultado, vía variable req.body.
* **_mssql_**: Para conectarnos a SQL Server, este módulo, se debe bajar de: https://www.npmjs.com/package/mssql.

~~~
var express = require('express');
var bodyParser = require('body-parser');
var sql = require('mssql'); 
~~~
Declaramos en una variable, los datos de conexión a la base de datos.
~~~
var config = {user: 'roman', password: 'inter2000',
    server: 'azure-en-este-caso.cloudapp.net',
    database: 'dbclientes', stream: true,
    options: {encrypt: true} // Windows azure = true
}
~~~
Creamos un pool de conexión.
~~~
var cn = new sql.Connection(config);
~~~
Más arriba, ya fue explicado para que sirve el módulo bodyParser.
~~~
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
~~~
Declaramos variable para el ruteo.
~~~
var router = express.Router();
~~~
Este middleware, por ejemplo, nos sirve para que todas las solicitud que se realicen, pasen por este código, y luego con el next(); sigan su camino, para caer en el ruteo que corresponda.
~~~
router.use(function(req, res, next) {
    //  Muestra solicitud
    // continua
    next(); 
});
~~~
Vamos a explicar el siguiente ruteo. Cuando tipeamos en el browser: _http://localhost:3000/wells/300_, para este caso, uso el puerto 3000, Notar que el ruteo recibe un parámetro, llamado **top**, lo usamos, para que no nos devuelva la totalidad de los registros, así vamos testeando la velocidad, a medida que solicitamos mas cantidad de filas. Con el parámetro **top**, armo el query, solicitando tantas filas, al parámetro lo leo con **req.params.top**.

##### Para tener en cuenta:
Como en node, las llamadas son asyncrónico, estoy atento a 3 eventos:

* **_error_**: Puede entrar en cualquier momento que se produzca un error.
* **_row_**: Entra por cada fila que es enviada desde la base de datos.
* **_done_**: Entra una vez finalizada la última fila enviada desde la base de datos.

En el evento **_row_**, voy concatenando cada fila, mientras la voy recibiendo, una vez que  finaliza, es cuando entra al evento **_done_**, en donde envío el JSON final.
~~~
app.get('/wells/:top', function(req, res) {

    var resJson = "";
    var str_Query = "select top " + req.params.top + " Nombre, Apellido, Telefono from agenda order by Apellido";

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
~~~
Por último, defino en una variable, el puerto a utilizar. Si se conecta el pool de conexión, muestro mensaje, y comienzo a escuchar si hay solicitudes en el puerto definido.
~~~
var port = process.env.PORT || 3000;

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
~~~
Finalmente, voy a la consola, me ubico dentro de la carpeta en donde esta la aplicación, y la pongo a correr, tipeando lo siguiente: **_node server.js_**, obviamente, si la aplicación se llama, **_server.js_**.

Ahora pueden ir al browser y probar los resulados, tipeando lo siguiente: 
###### _http://localhost:3000/wells/300_
También pueden usar algún software, como por ejemplo: Postam, y van a poder ver los resultados, en formato JSON.
~~~
[
    {
        "Idwell": 15975,
        "WellName": "A-1002",
        "Area": "AT",
        "Operator": "Tecpetrol"
    },
    {
        "Idwell": 17775,
        "WellName": "A-1004",
        "Area": "AT",
        "Operator": "Tecpetrol"
    },
    {
        "Idwell": 17733,
        "WellName": "A-1006",
        "Area": "AT",
        "Operator": "Tecpetrol"
    },
    {
        "Idwell": 17740,
        "WellName": "A-11",
        "Area": "AT",
        "Operator": "Tecpetrol"
    },
]
~~~



