var async = require('async'),
    config = require('config'),
    log = require('lib/log')(module),
    mysql = require('mysql');

module.exports = function (currencyCode, callback){
    var lastData = {},
        connection = mysql.createConnection({
            host     : config.get('mysql:host'),
            user     : config.get('mysql:user'),
            password : config.get('mysql:password'),
            database : config.get('mysql:database')
        });

    //соединяемся к mysql
    var openConnection = function (callback){
        connection.connect();
        callback();
    };

    //выбираем значения валюты
    var selectData = function (callback){
        connection.query('SELECT * FROM ?? ORDER by date DESC LIMIT 1', currencyCode, function(err, results) {
            if (err) log.error(err);
            if (results.length){
                lastData.value = results[0].value;
                lastData.date = +results[0].date;
                lastData.nominal = results[0].nominal;
            }
            callback();
        });
    };

    //закрываем соединение с mysql
    var closeConnection = function (){
        connection.end();
    };

    async.series( //последовательно выполняем действия
        [
            openConnection,
            selectData
        ], function(err){
            closeConnection(); //по завершению закрываем соединение с mysql
            if (err) log.error(err);
            log.info("Last value selected for " + currencyCode + "!");
            callback(lastData);
        }
    );
};