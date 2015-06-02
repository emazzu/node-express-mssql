var sql     = require('mssql');

module.exports = function(cn) {
  
  var me = {
    get: function(req, res, next) {
      var request = new sql.Request(cn); 
      res.status(200).json([{a: "OK"}]);
      request.query('select top 100 id, nombre from pozos', function(err, recordset) {
        if (err) {
          console.error(err);
          res.status(500).send(err.message);
          return;
        }
        res.status(200).json([{a: 123}]);
      });
    };
  };
  return me;
};
