const fs = require('fs');
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

//setup
var date = new Date();
var logger = {};

/**
 * Logs any message
 * @param {string} message
 */
logger.log = function(msg) {
	date.setTime(Date.now());
	console.log(msg);
	fs.appendFile("./server.log", date.toLocaleString() + ': ' + msg.toString() + '\n', 'utf8', function(err) {
		if (err) {
			console.log(err);
		}
	})
}

//logs uncaught exceptions
process.on('uncaughtException', function(err) {
	logger.log(err.stack);
	setTimeout(function() { process.exit(0); }, 500);
});

module.exports = logger;
