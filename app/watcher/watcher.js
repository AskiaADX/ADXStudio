var Gaze = require('gaze').Gaze;

exports.create = function create(pattern) {
    return new Gaze(pattern);
};