const fs = require('fs');
var date = new Date(Date.now());
var log = date.toLocaleString() + ' Logging has started';
process.on('uncaughtException', function(err) {
    Debug.log(err);
    process.exit(0);
});
fs.readFile('./server.log', 'utf8', function(err, data) {
    if (!err) {
        //log = data;
    } else
        fs.writeFile("./server.log", log, 'utf8', function(err) {
            if (err) {
                throw err;
            }
        });
});

var Debug = {};
Debug.log = function(msg) {
    date.setTime(Date.now());
    console.log(msg);
    fs.appendFile("./server.log", date.toLocaleString() + ': ' + msg + '\n', 'utf8', function(err) {
        if (err) {
            console.log(err);
        }
    })
}
