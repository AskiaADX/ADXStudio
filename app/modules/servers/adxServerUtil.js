
/**
 * Create a new server
 * @param {Object} options Options to create the server
 * @param {Object} options.factory Factory to create the server (http or ws object)
 * @param {Function} options.reply Reply function to pass to the factory
 * @param {Number} [options.port=0] Port to listen (0 to search a free one)
 * @constructor
 */
function Server(options) {
    var factory  = options.factory;
    var reply    = options.reply;
    this.options = options;
    this.port    = this.options.port || 0;

    this.innerServer = factory.createServer(reply);
    this.isStart     = false;
}

/**
 * Listen
 * @param {Function} callback Callback when the listening has started
 * @param {Number} callback.port Port when the server is listening into
 */
Server.prototype.listen = function listen(callback) {
    var self        = this,
        innerServer = self.innerServer;

    // Already started
    if (self.isStart) {
        if (typeof callback === 'function') {
            callback(self.port);
        }
        return;
    }

    if (!self.port) {
        self.port = 3500; // TODO::Make stuff to search a free port
    }

    // Listen the port
    innerServer.listen(self.port, function () {
        self.isStart = true;
        if (typeof  callback === 'function') {
            callback(self.port);
        }
    });

    // Listen close event
    innerServer.on('close', function () {
        self.isStart = false;
    });
};

/**
 * Close the connection
 * @param {Function} callback Callback when the listening has started
 */
Server.prototype.close = function close(callback) {
    var self = this;
    if (self.innerServer) {
        var innerServer = self.innerServer;
        if (typeof innerServer.close !== 'function' && innerServer.socket) {
            innerServer = innerServer.socket;
        }

        innerServer.close(function () {
            self.isStart = false;
            if (typeof  callback === 'function') {
                callback();
            }
        });
        return;
    }
    if (typeof  callback === 'function') {
        callback();
    }
};


/**
 * Return the ADC fixtures definition
 * @param {Function} callback
 * @param {Object} callback.fixtures Result
 * @param {String[]} callback.fixtures.list List of fixtures
 * @param {String} callback.fixtures.defaultFixture Default fixture
 */
function getFixtures(callback) {
    var adc = global.project.adc;

    adc.getFixtureList(function (err, fixtures) {
        var result = {
            list : fixtures  || []
        };
        // Search the first allowed question type
        var defaultFixture = '';
        var constraints = adc.configurator.info.constraints(),
            i, l;
        if (constraints.questions) {
            for (var constraint in constraints.questions) {
                if (constraints.questions.hasOwnProperty(constraint)) {
                    for (i  = 0, l = result.list.length; i < l; i += 1) {
                        if (result.list[i].toLocaleLowerCase() === constraint.toLocaleLowerCase() + '.xml') {
                            defaultFixture = result.list[i];
                            break;
                        }
                    }
                    if (defaultFixture) {
                        break;
                    }
                }
            }
        }

        result.defaultFixture = defaultFixture;
        if (!result.defaultFixture && result.list.length) {
            result.defaultFixture = result.list[0];
        }
        callback(result);
    });
}


exports.Server = Server;
exports.getFixtures = getFixtures;

