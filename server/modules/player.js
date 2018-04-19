module.exports = function(cid, conn, name, opts = {}) {
    this.hp = 100;
    this.inventory = {};
    this.name = name;
    this.cid = cid;
    this.conn = conn;
    this.pos = opts.pos || {
        x: 0,
        y: 0
    };
    this.chunkPos = opts.chunkPos || {
        x: 0,
        y: 0
    };
    this.getWorldPos = function() {
        return {
            x: (this.chunkPos.x * this.pos.y),
            y: (this.chunkPos.y * this.pos.y)
        };
    }
}
