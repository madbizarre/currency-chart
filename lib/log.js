var winston = require('winston'),
//ENV = 'development';
    ENV = process.env.NODE_ENV;
require('../middleware/helpers');

var timestamp = function() {
    var date = new Date(),
        arr = date.toLocaleString().split(' ');
    return arr[2] + ' ' + arr[1] + ' ' + arr[3] + ' ' + arr[4] + '.' + ('000'+date.getMilliseconds()).slice(-4);
};

module.exports = function(mdl){
    var path = mdl.filename;
    return new (winston.Logger)({
        transports: [
            new winston.transports.Console({ //Console
                level: (ENV == 'development') ? 'debug' : 'error',
                colorize: true,
                timestamp: timestamp,
                label: path

            }),
            new winston.transports.File({ //in file
                level: (ENV == 'development') ? 'debug' : 'error',
                name: 'info-log',
                filename: 'console.log',
                eol: ', \n',
                timestamp: timestamp
            }),
            new (winston.transports.File)({ //in error file
                level: 'error',
                name: 'error-log',
                filename: 'error.log',
                eol: ', \n',
                timestamp: timestamp
            })
        ]
    });
};