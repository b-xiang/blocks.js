/**
 * Manage the blocks
 */
Blocks = function()
{
    var self = this;

    // Mouse
    this.mouseX = 0;
    this.mouseY = 0;

    // Linking ?
    this.linking = null;

    // BLocks division
    this.div = null;

    // Context for drawingc
    this.context = null;

    // Blocks types
    this.blockTypes = [];

    // Instances
    this.blocks = [];

    // Edges
    this.edges = [];

    /**
     * Next block id
     */
    this.id = 1;
    
    /**
     * Errors
     */
    this.error = function(message)
    {
        throw 'Blocks: ' + message;
    };

    /**
     * Runs the blocks editor
     */
    this.run = function(selector)
    {
        $(document).ready(function() {
            self.div = $(selector);

            if (!self.div.size()) {
                this.error('Unable to find ' + selector);
            }

            // Inject the initial editor
            self.div.html(
                  '<div class="blocks_js_editor">'
                + '<canvas></canvas>'
                + '<div class="menubar">'
                + '<div class="add">'
                + '<span>Add a block</span>'
                + '<div class="types"></div>'
                + '</div>'
                + '</div>'
                + '<div class="blocks"></div>'
                + '</div>'
            );

            self.div.find('canvas').attr('width',(self.div.width()));
            self.div.find('canvas').attr('height',(self.div.height()));
            self.context = self.div.find('canvas')[0].getContext('2d');

            // Add a block
            self.div.find('.add').hover(function() {
                html = '';
                for (k in self.blockTypes) {
                    var type = self.blockTypes[k];
                    html += '<div class="type" rel="'+type.name+'">'+type.name+'</div>';
                }

                $(this).find('.types').html(html);
                $(this).find('.types').show();
                $(this).find('.type').click(function() {
                    self.addBlock($(this).attr('rel'));
                });
            }, function() {
                $(this).find('.types').hide();
            });

            // Listen for mouse position
            self.div[0].addEventListener('mousemove', function(evt) {
                self.mouseX = evt.pageX - self.div.offset().left;
                self.mouseY = evt.pageY - self.div.offset().top;
                self.move(evt);
            });

            $('html').mouseup(function() {
                self.release();
            });
            
            self.context.clearRect(0, 0, self.div.width(), self.div.height());
            self.context.strokeStyle = 'rgb(0, 0, 0)';
            self.context.beginPath();
            self.context.stroke();
        });
    };

    /**
     * Adds a block
     */
    this.addBlock = function(name)
    {
        for (k in self.blockTypes) {
            var type = self.blockTypes[k];

            if (type.name == name) {
                var block = new Block(self, self.blockTypes[k], this.id);
                block.create(self.div.find('.blocks'));
                this.blocks.push(block);
                this.id++;
            }
        }
    };

    /**
     * Registers a new block type
     */
    this.register = function(type)
    {
        self.blockTypes.push(new BlockType(type));
    };

    /**
     * Begin to draw an edge
     */
    this.beginLink = function(block, io)
    {
        this.linking = [block, io];
    };

    /**
     * The mouse has moved
     */
    this.move = function(evt)
    {
        if (self.linking) {
            var position = this.linking[0].linkPositionFor(this.linking[1]);
            self.redraw();
            self.context.lineWidth = 3;
            self.context.strokeStyle = 'rgb(0, 0, 0)';
            self.context.beginPath();
            self.context.moveTo(position.x, position.y);
            self.context.lineTo(self.mouseX, self.mouseY);
            self.context.stroke();
        }
    };

    this.redraw = function()
    {
        self.context.clearRect(0, 0, self.div.width(), self.div.height());
    };

    /**
     * Release the mouse
     */
    this.release = function()
    {
        self.linking = null;
        self.redraw();
    };

    /**
     * End drawing an edge
     */
    this.endLink = function(block, io)
    {
        if (this.linking) {
            this.linking = null;
        }
    };
};
