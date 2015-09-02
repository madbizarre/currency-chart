var async = require('async'),
    config = require('../../config'),
    log = require('../../lib/log')(module),
    mysql = require('mysql');
require('../../middleware/helpers');

module.exports = function(currencyCode, point, data, callback){
    var dateBegin = '1992-01-01',
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

    var dropTable = function (callback){
        if (point) { //point=true - полное обновление, поэтому удаляем таблицу, если есть
            connection.query('DROP TABLE IF EXISTS ??', currencyCode, function(err, results){
                if (err) throw err;
                callback();
            });
        } else callback(); //point=false - ничего не делаем
    };

    var createTable = function (callback){ //создаем таблицу валюты, если ее нет
        connection.query('CREATE TABLE IF NOT EXISTS ?? (date DATE UNIQUE NOT NULL, value DECIMAL (11,4), nominal MEDIUMINT UNSIGNED NOT NULL,PRIMARY KEY (date))', currencyCode, function(err, results){
            if (err) throw err;
            callback();
        });
    };

    var selectDateBegin = function (callback){ //выбираем послетнюю дату
        connection.query('SELECT date FROM ?? ORDER BY date DESC LIMIT 1;', [currencyCode] , function(err, results){
            if (err) throw err;
            if (results.length) dateBegin = results[0].date.dateToString('-');
            callback();
        });
    };

    var deleteData = function (callback){
        if (!data.length){
            callback();
        } else //удаляем значения в промежутке между начальной датой загрузки и сегоднешней
            connection.query('DELETE FROM ?? WHERE date >= ? and date <= CURDATE()', [currencyCode, dateBegin], function(err, results){
                if (err) throw err;
                callback();
            });
    };

    var loadData = function (callback){
        if (!data.length){
            callback()
        } else {
            connection.query('INSERT INTO ?? (date, value, nominal) VALUES ' + data, currencyCode, function(err, results){
                if (err) log.error(currencyCode, err);
                callback();
            });
        }
    };

//-------------------------------database--------------------------------------------//

    //закрываем соединение с mysql
    function closeConnection(){
        connection.end();
    }

    async.series( //последовательно выполняем действия
        [
            openConnection,
            dropTable,
            createTable,
            selectDateBegin,
            deleteData,
            loadData
        ], function(err) {
            closeConnection(); //по завершению закрываем соединение с mysql
            if (err) throw err;
            log.info("Data updated to table " + currencyCode);
            callback();
        }
    );
};