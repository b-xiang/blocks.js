/**
 * A connector
 */
Connector = function(name, type, index)
{
    this.name = name;
    this.index = index;
    this.type = type;
};

Connector.prototype.id = function()
{
    var id = this.name + '_' + this.type;

    if (this.index != null) {
        id += '_' + this.index;
    }

    return id;
};

Connector.prototype.isInput = function()
{
    return this.type == 'input';
};

Connector.prototype.isOutput = function()
{
    return this.type == 'output';
};

Connector.prototype.same = function(other)
{
    return (this.name == other.name && this.index == other.index && this.type == other.type);
};

Connector.prototype.exportData = function()
{
    var data = [this.name, this.type];

    if (this.index !== null) {
        data.push(this.index);
    }

    return data;
}

function ConnectorImport(data)
{
    if (!(data instanceof Array) || data.length<2 || data.length>3) {
        throw 'Unable to import a connector';
    }

    if (data.length == 2) {
        data.push(null);
    }

    return new Connector(data[0], data[1], data[2]);
}

function IdToConnector(connectorId)
{
    var parts = connectorId.split('_');

    var name = parts[0];
    var type = parts[1];
    var index = null;
    if (parts.length == 3) {
        index = parts[2];
    }

    return new Connector(name, type, index);
}