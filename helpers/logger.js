const LoggerType = {
    'ALL': 'all',
    'ERROR_ONLY': 'err',
    'NONE': 'none',
};

const Logger = function(type = LoggerType.ALL) {
    this.infoColorPrefix = '\033[1m';
    this.errorColorPrefix = '\x1b[1m\x1b[31m';
    this.warningColorPrefix = '\x1b[1m\x1b[33m';

    this.previousType = type;
    this.type = type;
}

Logger.prototype.Pause = function() {
    if (this.type !== LoggerType.NONE) {
        this.previousType = this.type;
        this.type = LoggerType.NONE;
    }
}

Logger.prototype.Resume = function() {
    if (this.type === LoggerType.NONE) {
        this.type = this.previousType;
    }
}

Logger.prototype.Info = function(title, ...data) {
    if (this.type === LoggerType.ALL) {
        console.log(this.infoColorPrefix + title, ...data);
    }
}

Logger.prototype.Error = function(title, ...data) {
    if (this.type !== LoggerType.NONE) {
        console.error(this.errorColorPrefix + title, ...data);
    }
}

Logger.prototype.Warn = function(title, ...data) {
    if (this.type !== LoggerType.NONE) {
        console.warn(this.warningColorPrefix + title, ...data);
    }
}

module.exports = {
    Logger,
    LoggerType,
};
