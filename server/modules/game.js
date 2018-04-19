module.exports = function(world, rate, clients) {
	
	console.log( "rate = " + rate );
    setInterval(update, rate);
    console.log('game world has started');

    function update() {
        //do stuff
		console.log( "tick" );

        //update all clients
        clients.forEach(function(client) {
            try {
                client.conn.send(JSON.stringify('ping!'));
            } catch (e) {
				
				//console.log(e);
				
				// remove client
				console.log( "PING FAILED: Removing client: " + client.characterName );
				clients.splice( clients.indexOf( client ), 1 );
				
            }
        })
    }
}
