/**
 * Manage one block type
 */
BlockType = function(type)
{
    var self = this;

    this.name = type.name;

    // Checking for parameters, inputs and outputs
    var keys = ['parameters', 'inputs', 'outputs'];

    for (k in keys) {
        var key = keys[k];
        if (type[key] != undefined) {
            this[key] = type[key];
        } else {
            this[key] = [];
        }
    }

    // Checking the family
    if (type.family == undefined) {
        this.family = ''; // Root family
    } else {
        this.family = type.family;
    }
}

