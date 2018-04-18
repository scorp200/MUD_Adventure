module.exports = function(world, rate, clients) {
    setInterval(update, rate);
    console.log('game world has started');

    function update() {
        //do stuff

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
