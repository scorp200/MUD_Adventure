module.exports = function(world, rate, clients) {
    setInterval(update, rate);
    console.log('game world has started');

    function update() {
        console.log(clients.length);
        clients.forEach(function(client) {
            try {
                client.conn.send("ping!");
                console.log('Pinging ' + client.characterName);
            } catch (e) {
                console.log(e);
            }
        })
    }
}
