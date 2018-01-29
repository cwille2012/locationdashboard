var engine = require('engine.io');
var server = engine.listen(3001); //waiting for client socket to connect

var writeFile = require('write');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";

var NRP = require('node-redis-pubsub');

var config = {
    port: 6379,
    host: '35.225.154.211',
    auth: 'Rpts6CfxUpo9'
};

var nrp = new NRP(config);
var connection = null;

MongoClient.connect(url, function(err, db) {
    if (err) throw err;

    var dbo = db.db("aqidata");

    nrp.on('airData', function(data) {
        console.log(data);
        var myobj = [data];
        if (connection) {
            connection.send(JSON.stringify(myobj));
            //writeFile.sync('data/results.json', JSON.stringify(myobj));
        }
        if (data.pos.lon != null) {
            console.log('has position');
            dbo.collection("data").insertMany(myobj, function(err, res) {
                if (err) throw err;
                //db.close();
                console.log('Record inserted');
            });
        } else {
            console.log('Record ignored (no lat/lon)');
        }
    });

    var clientExists = false;
    server.on('connection', function(socket) {
        clientExists = true;
        console.log('client connected');
        dbo.collection("data").find({}).toArray(function(err, result) {
            if (err) throw err;
            socket.send(JSON.stringify(result));
            //console.log(result);
        });
        connection = socket;
        // nrp.on('airData', function(data) {
        //     console.log(data);
        //     var myobj = [data];
        //     document.getElementById('alertsdropdownmenu').innerHTML = JSON.stringify(data);
        //     socket.send(JSON.stringify(data));
        // });
    });
});