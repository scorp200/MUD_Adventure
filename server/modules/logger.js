const fs = require('fs');
var log = '';
fs.readFile('./server.log', 'utf8', function(err, data) {
    if (!err)
        log = data;
    else
        fs.writeFile("./server.log", log, 'utf8', function(err) {
            if (err) {
                throw err;
            }
        });
});
this.log = function(msg) {
    logger.log(msg);
    fs.appendFile("./server.log", Date.getDate() + ': ' + msg + '\n', 'utf8')
}
