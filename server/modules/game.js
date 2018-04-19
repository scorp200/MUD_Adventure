module.exports = function(world, rate, clients) {

    console.log("rate = " + rate);
    setInterval(update, rate);
    console.log('game world has started');
    commands = [];
    this.push = function(client, cmd) {
        commands.push(cmd);
    }

    function update() {
        //do stuff

        while (commands.length > 0) {
            var command = commands.shift();
            //execute the commands
        }
        //update all clients
        clients.forEach(function(client) {
            try {
                client.conn.send(JSON.stringify('ping!'));
            } catch (e) {
				console.log(e);
			}
        })
    }
}
