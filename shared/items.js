(function() {
    var items = function() {

    }

    items.mapping = {
        "wood": {
            id: 1,
            dropAmount: 2,
            dropRate: 1
        },
        "rock": {
            id: 2,
            dropAmount: 2,
            dropRate: 1
        }
    }


    // export
    if (typeof module === "undefined")
        window["Items"] = items
    else
        module.exports = items;
})();
