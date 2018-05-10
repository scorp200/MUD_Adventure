(function() {
	var creatures = function() {

	}

	creatures.getID = function(name) { return creatures.mapipng[name].creature_id };

	creatures.mapping = {
		"wolf": {
			creature_id: 1,
			hp: 20,
			damage: 2
		}
	};

	if (typeof module === "undefined")
		window["Creatures"] = creatures
	else
		module.exports = creatures;
})();
