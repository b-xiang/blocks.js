/**
 * An edge linking two blocks
 */
function Edge(id, block1, io1, block2, io2, blocks)
{
    this.blocks = blocks;
    this.label = null;
    this.id = parseInt(id);
    this.block1 = block1;
    this.io1 = io1;
    this.block2 = block2;
    this.io2 = io2;

    this.defaultSize = 3;
    this.defaultFontSize = 10;
    this.position1 = block1.linkPositionFor(io1);
    this.position2 = block2.linkPositionFor(io2);
    this.segment = new Segment(
        this.position1.x, this.position1.y, 
        this.position2.x-this.position1.x, this.position2.y-this.position1.y
    );
};

/**
 * Should this edge be ignored in loop analysis ?
 */
Edge.prototype.isLoopable = function()
{
    return (this.block1.isLoopable() || this.block2.isLoopable());
}

/**
 * Returns an array with the blocks ordered
 */
Edge.prototype.fromTo = function()
{
    return [this.block1, this.block2];
};

/**
 * Sets the label of the edge
 */
Edge.prototype.setLabel = function(label)
{
    this.label = label;
};

/**
 * Draws the edge
 */
Edge.prototype.draw = function(svg, selected)
{
    this.position1 = this.block1.linkPositionFor(this.io1);
    this.position2 = this.block2.linkPositionFor(this.io2);
    
    this.segment = new Segment(
        this.position1.x, this.position1.y, 
        this.position2.x-this.position1.x, this.position2.y-this.position1.y
    );

    var lineWidth = this.defaultSize*this.blocks.scale;

    if (selected) {
        var strokeStyle = 'rgba(0, 200, 0, 1)';
    } else {
        var strokeStyle = 'rgba(255, 200, 0, 1)';
    }
    svg.line(this.position1.x, this.position1.y, this.position2.x, this.position2.y, {
        stroke: strokeStyle, strokeWidth: lineWidth
    });
    
    var xM = ((this.position1.x+this.position2.x)/2.0);
    var yM = ((this.position1.y+this.position2.y)/2.0);
    var norm = Math.sqrt(Math.pow(this.position1.x-this.position2.x,2)+Math.pow(this.position1.y-this.position2.y,2));
    var alpha = 30;
    alpha = (alpha*Math.PI/180.0);
    var cos = Math.cos(alpha);
    var sin = Math.sin(alpha);
    var cosB = Math.cos(-alpha);
    var sinB = Math.sin(-alpha);

    // Drawing the arrow
    if (this.blocks.getOption('orientation', true)) {
        var xA = (this.position1.x-xM)*this.blocks.scale*10/(norm/2);
        var yA = (this.position1.y-yM)*this.blocks.scale*10/(norm/2);
        var lineWidth = this.defaultSize*this.blocks.scale/3.0;
        svg.line(xM, yM, xM+(xA*cos-yA*sin), yM+(yA*cos+xA*sin), {
            stroke: strokeStyle, strokeWidth: lineWidth
        });
        svg.line(xM, yM, xM+(xA*cosB-yA*sinB), yM+(yA*cosB+xA*sinB), {
            stroke: strokeStyle, strokeWidth: lineWidth
        });
    }

    if (this.label != null) {
        var fontSize = Math.round(this.defaultFontSize*this.blocks.scale);

        svg.text(xM-2*fontSize, yM+fontSize/3, this.label, {
            fontSize: fontSize+'px',
            fill: '#3a3b01',
            stroke: '#fff',
            strokeWidth: 2
        });
        svg.text(xM-2*fontSize, yM+fontSize/3, this.label, {
            fontSize: fontSize+'px',
            fill: '#3a3b01',
        });
    }
    };

/**
 * Does the position collide the line ?
 */
Edge.prototype.collide = function(x, y)
{
    var dp = this.segment.distanceP({x: x, y: y});

    if (dp[0] >= 0 && dp[0] <= 1) {
        if (dp[1] < (this.defaultSize*blocks.scale)*2) {
            return dp[0];
        }
    }

    return false;
};

/**
 * Initializes the edge and do some tests
 */ 
Edge.prototype.create = function()
{
    // You can't link a block to itself
    if (this.block1 == this.block2) {
        throw 'You can\'t link a block to itself';
    }

    // You have to link an input with an output
    if (!this.blocks.getOption('canLinkInputs', false) && this.io1[0] == this.io2[0]) {
        throw 'You have to link an input with an output';
    }

    // The cards have to be okay
    if ((!this.block1.canLink(this.io1)) || (!this.block2.canLink(this.io2))) {
        throw 'Can\'t create such an edge because of the cardinalities';
    }

    this.block1.addEdge(this.io1, this);
    this.block2.addEdge(this.io2, this);
};

/**
 * Erase an edge
 */
Edge.prototype.erase = function()
{
    this.block1.eraseEdge(this.io1, this);
    this.block2.eraseEdge(this.io2, this);
};

/**
 * Test if this edge is the same than another
 */
Edge.prototype.same = function(other)
{
    if (this.block1 == other.block1 && this.block2 == other.block2 
            && this.io1 == other.io1 && this.io2 == other.io2) {
        return true;
    }
    
    if (this.block1 == other.block2 && this.block2 == other.block1
            && this.io1 == other.io2 && this.io2 == other.io1) {
        return true;
    }

    return false;
};

/**
 * Exports the edge to JSON
 */
Edge.prototype.exportData = function()
{
    return {
        id: this.id,
        block1: this.block1.id,
        io1: this.io1,
        block2: this.block2.id,
        io2: this.io2
    };
};

/**
 * Imports JSON data into an edge
 */
function EdgeImport(blocks, data)
{
    if (!'id' in data) {
        throw "An edge does not have id";
    }

    var block1 = blocks.getBlockById(data.block1);
    var block2 = blocks.getBlockById(data.block2);

    if (!block1 || !block2) {
	throw "Error while importing an edge, a block did not exists";
    }

    return new Edge(data.id, block1, data.io1, block2, data.io2, blocks);
};
