var async = require('async'),
    config = require('config'),
    log = require('lib/log')(module),
    mysql = require('mysql');

exports.selectCurrencyList = function (callback){
    var list= [],
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
        connection.query('SELECT * FROM currency GROUP BY rusname', function(err, results) {
            if (err) log.error(err);

            for ( var i = 0, j = results.length ; i < j ; i++){
                list.push({
                    id: results[i].id,
                    code: results[i].code,
                    name: {
                        en: results[i].name,
                        ru: results[i].rusname
                    }
                });
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
            log.info("Currency List selected!");
            callback(list);
        }
    );
};

exports.selectCurrencyItem = function (id, callback){
    console.log(id);
    var item = {},
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
        connection.query('SELECT * FROM currency where id=?', id, function(err, results) {
            if (err) log.error(err);
            if (results.length){
                item = {
                    id: results[0].id,
                    code: results[0].code,
                    name: {
                        en: results[0].name,
                        ru: results[0].rusname
                    }
                };
            } else {
                var err = new Error();
                err.statusCode = 404;
                err.statusText = 'Валюта не найдена';
                callback(err);
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
            if (err) {
                if (err.statusCode == 404){
                    callback(err);
                } else {
                    log.error(err);
                }
            }
            log.info("Currency Item selected!");
            callback(item);
        }
    );
};