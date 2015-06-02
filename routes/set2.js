
// sample route with a route the way we're used to seeing it
app.get('/set2', function(req, res) {

  res.send('Estamos en ruteo: http://localhost:3000/sample');  

    var str_Query = 'select top 500 Id, Nombre, Comentario from pozos order by Id';

    // or: var request = connection.request(); 
    var request = new sql.Request(cn); 
    request.stream = true; // You can set streaming differently for each request
    request.query(str_Query); // or request.execute(procedure);

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


});
