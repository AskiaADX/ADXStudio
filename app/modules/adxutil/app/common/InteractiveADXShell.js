"use strict";

const childProcess = require('child_process');
const path         = require('path');
const common       = require('./common.js');

/**
 * Create an interactive spawn process with the ADXShell.
 *
 * Manage the ADXShell process in interactive mode.
 *
 * It allow a single instance creation of the ADXShell
 * and a bi-directional communication using the stdio of the spawn process
 *
 * @class InteractiveADXShell
 * @param {String} dir Path of the ADX directory
 * @param {Object} [options] Options
 * @param {"interactive"|"interview"} [options.mode='interactive'] Interactive mode
 */
function InteractiveADXShell(dir, options) {
    /**
     * Path of the ADX directory
     *
     * @name InteractiveADXShell#path
     * @type {String}
     */
    this.path = dir;

    /**
     * Mode of interaction.
     *
     * - interactive (arbitrary command)
     * - interview (interact with interview)
     *
     * @name InteractiveADXShell#mode
     * @type {String}
     */
    this.mode = 'interactive';

    if (options) {
        if (options.mode) {
            if (options.mode !== 'interactive' && options.mode !== 'interview') {
                throw new Error("Expected the interactive ADX shell mode to be `interactive` or `interview`");
            }
            this.mode = options.mode;
        }
    }
}

/**
 * Create an interactive spawn process with the ADXShell
 * @ignore
 */
InteractiveADXShell.prototype.constructor = InteractiveADXShell;


/**
 * Send the specified command in the ADXShell process
 *
 * @param {String} command ADXShell command to execute
 * @param {Function} callback Callback
 * @param {Error} callback.err Error
 * @param {String} callback.result Result message of the ADXShell process
 */
InteractiveADXShell.prototype.exec = function exec(command, callback) {
    const self = this;
    const message = [];
    const errorMessage = [];
    let errTimeout;
    let commandAsString = command;

    if (Array.isArray(command)) {
        commandAsString = commandAsString.join(' ');
    }


    if (!self._process) {
        const root =  path.resolve(__dirname, "../../");
        let args = [];
        switch (self.mode) {
            case 'interactive':
                args.push('interactive', self.path);
                break;
            case 'interview':
                args.push('startInterview');
                if (Array.isArray(command)) {
                    args = args.concat(command);
                } else {
                    args.push(command);
                }
                args.push(self.path);
                break;
        }

        self._process = childProcess.spawn('.\\' + common.ADX_UNIT_PROCESS_NAME, args, {
            cwd   : path.join(root, common.ADX_UNIT_DIR_PATH),
            env   : common.getChildProcessEnv()
        });

        self._process._firstData = true;
    }

    function onOutput(data) {
        if (self._process._firstData) {
            self._process._firstData = false;
            if (self.mode === 'interactive') {
                self._process.stdin.write(commandAsString + '\n');
                return;
            }
        }
        let str = data.toString();
        if (!/^\[ADXShell:End\]/m.test(str)) {
            message.push(str);
        } else {
            // Remove the end of the message
            str = str.replace(/(\r?\n\[ADXShell:End\].*)/m, '');
            message.push(str);

            // Remove the listener at the end of the process
            self._process.stdout.removeListener('data', onOutput);
            self._process.stderr.removeListener('data', onError);

            if (typeof callback === 'function') {
                callback(null, message.join('').replace(/(\[ADXShell:End\].*)/m, ''));
            }
        }
    }

    function onError(data) {
        let str = data.toString();
        if (!/^\[ADXShell:End\]/m.test(str)) {
            errorMessage.push(str);
            // If an hard error the message end is never throw,
            // wait half a sec and send the message anyway
            clearTimeout(errTimeout);
            errTimeout = setTimeout(function () {
                onError('[ADXShell:End]');
            }, 500);
        } else {
            // Remove the end of the message
            str = str.replace(/(\r?\n\[ADXShell:End\].*)/m, '');
            errorMessage.push(str);

            // Remove the listener at the end of the process
            self._process.stdout.removeListener('data', onOutput);
            self._process.stderr.removeListener('data', onError);

            if (typeof callback === 'function') {
                callback(new Error(errorMessage.join('').replace(/(\[ADXShell:End\].*)/m, '')), null);
            }
        }
    }

    self._process.stdout.on('data', onOutput);
    self._process.stderr.on('data', onError);

    if (!self._process._firstData) {
        self._process.stdin.write(commandAsString  + '\n');
    }
};

/**
 * Destroy the internal reference of current object
 */
InteractiveADXShell.prototype.destroy = function destroy() {
    if (!this._process) {
        return;
    }
    this._process.kill();
    delete this._process;
};

exports.InteractiveADXShell = InteractiveADXShell;