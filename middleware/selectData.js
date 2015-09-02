var async = require('async'),
    config = require('../config'),
    log = require('../lib/log')(module),
    mysql = require('mysql');
require('../middleware/helpers');

var selectData = function(arguments, callback){
    var connection = mysql.createConnection({
            host     : config.get('mysql:host'),
            user     : config.get('mysql:user'),
            password : config.get('mysql:password'),
            database : config.get('mysql:database')
        }),
        data = {list:[]},
        point = false,
        currencyCode = arguments.currencyCode,
        dateBegin = arguments.dateBegin.dateToString('-'), //Date -> yyyy-mm-dd
        dateEnd = arguments.dateEnd.dateToString('-');

    //соединяемся к mysql
    var openConnection = function (callback){
        connection.connect();
        callback();
    };

    //проверяем есть ли валюта с таким кодом
    var checkCurrencyCode = function (callback){
        connection.query('SELECT * FROM currency WHERE code = ? ', currencyCode, function(err, results){
            if (err) throw err;
            if (results.length){
                data.name = results[0].name;
                data.rusName = results[0].rusname;
                callback();
            } else {
                var err = new Error();
                err.statusText = "Currency Code is incorrect!";
                err.statusCode = 404;
                callback(err);
            }
        });
    };

    //выбираем последнее значение валюты перед dateBegin
    var selectFirstValue = function (callback){
        connection.query('SELECT * FROM ?? where date <= ? ORDER by date DESC LIMIT 1', [currencyCode, dateBegin], function(err, results){
            if (err) throw err;
            if (results.length) {
                data.list.push({
                    date: +dateBegin.stringToDate(),
                    value: results[0].value,
                    nominal: results[0].nominal
                });
            } else {
                point = true;
                data.list.push({
                    date: +dateBegin.stringToDate(),
                    value: null,
                    nominal: null
                });
            }
            callback();
        });
    };

    //выбираем значения на заданный промежуток времени
    var selectData = function (callback){
        connection.query('SELECT * FROM ?? WHERE date > ? and date <= ? ', [currencyCode, dateBegin, dateEnd], function(err, results){
            if (err) throw err;
            if (results.length) { //если есть данные
                if (point){
                    data.list.push({
                        date: +results[0].date - 1,
                        value: null,
                        nominal: null
                    });
                }
                for (var i = 0, j = results.length; i < j; i++){
                    data.list.push({
                        date: +results[i].date,
                        value: results[i].value,
                        nominal: results[i].nominal
                    });
                }
                var n = data.list.length-1;
                if (data.list[n].date != arguments.dateEnd){
                    data.list.push({
                        date: +dateEnd.stringToDate(),
                        value: data.list[n].value,
                        nominal: data.list[n].nominal
                    });
                }
            }
            callback();
        });
    };

//закрываем соединение с mysql
    var closeConnection = function (){
        connection.end();
    };

    async.series([ //последовательно выполняем действия
            openConnection,
            checkCurrencyCode,
            selectFirstValue,
            selectData
        ], function(err){
            closeConnection(); //по завершению закрываем соединение с mysql
            if (err) {
                if ((err.statusCode == 404) && (err.statusText = "Currency Id is uncorrect!")) {
                    log.info("Currency code = " + currencyCode + " not found!");
                    callback(err);
                } else if (err) throw err;
            } else log.info("Data selected for " + currencyCode + "!");
            callback(data);
        }
    );
};


module.exports = selectData;