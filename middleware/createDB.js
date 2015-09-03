var async = require('async'),
    config = require('config'),
    log = require('lib/log')(module),
    mysql = require('mysql'),
    path = require('path'),
    ROOT = config.get('root');

var createDatabase = function (cb){
    var connection = mysql.createConnection({
        host     : config.get('mysql:host'),
        user     : config.get('mysql:user'),
        password : config.get('mysql:password')
    });

    //соединяемся к mysql
    var openConnection = function  (callback){
        connection.connect();
        callback();
    };

    //удаляем БД, если есть
    var dropDatabase = function (callback){
        connection.query('DROP DATABASE IF EXISTS currency', function(err, results){
            if (err) throw err;
            callback();
        });
    };

    //создаем БД
    var createDatabase = function (callback){
        connection.query('CREATE DATABASE IF NOT EXISTS currency DEFAULT CHARACTER SET utf8', function(err, results){
            if (err) throw err;
            connection.changeUser({database : 'currency'}, function(err){ //добавляем подключение к бд
                if (err) throw err;
            });
            callback();
        });
    };

    //удаляем таблицы currency и continent, если есть
    var dropTables = function (callback){
        connection.query('DROP TABLE IF EXISTS currency, continent', function(err, results){
            if (err) throw err;
            callback();
        });
    };

    //создаем таблицу continent
    var createTableContinent = function (callback){
        connection.query('CREATE TABLE continent (id TINYINT UNSIGNED NOT NULL AUTO_INCREMENT, name VARCHAR(25) UNIQUE NOT NULL, rusname VARCHAR(40) UNIQUE NOT NULL, PRIMARY KEY (id), UNIQUE INDEX name_UNIQUE (name ASC), UNIQUE INDEX rusname_UNIQUE (rusname ASC), UNIQUE INDEX id_UNIQUE (id ASC))', function(err, results){
            if (err) throw err;
            callback();
        });
    };

    //загружаем данные в таблицу continent из файла db/dumbContinent.csv
    var loadDataContinent = function (callback){
        var folder = path.join(path.join(ROOT, 'db'), 'dumpContinent.csv'),
            fields = ',', enclosed = '"', lines = '\r\n';
        connection.query('LOAD DATA INFILE ? INTO TABLE continent FIELDS TERMINATED BY ? ENCLOSED BY ? LINES TERMINATED BY ? IGNORE 1 LINES', [folder, fields, enclosed, lines], function(err, results){
            if (err) throw err;
            callback();
        });
    };

    //создаем таблицу currency
    var createTableCurrency = function (callback){
        connection.query('CREATE TABLE currency (id TINYINT UNSIGNED UNIQUE NOT NULL AUTO_INCREMENT, code VARCHAR(7) UNIQUE NOT NULL, name VARCHAR(25) UNIQUE NOT NULL, rusname VARCHAR(40) UNIQUE NOT NULL, continentid TINYINT UNSIGNED DEFAULT NULL, PRIMARY KEY (id), FOREIGN KEY (continentid) REFERENCES continent(id) ON DELETE NO ACTION ON UPDATE NO ACTION, UNIQUE INDEX rusname_UNIQUE (rusname ASC), UNIQUE INDEX code_UNIQUE (code ASC), UNIQUE INDEX name_UNIQUE (name ASC))', function(err, results){
            if (err) throw err;
            callback();
        });
    };

    //загружаем данные в таблицу currency из файла db/dumbCurrency.csv
    var loadDataCurrency = function (callback){
        var folder = path.join(path.join(ROOT, 'db'), 'dumpCurrency.csv'),
            fields = ',', enclosed = '"', lines = '\r\n';
        connection.query('LOAD DATA INFILE ? INTO TABLE currency FIELDS TERMINATED BY ? ENCLOSED BY ? LINES TERMINATED BY ? IGNORE 1 LINES', [folder, fields, enclosed, lines], function(err, results){
            if (err) throw err;
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
            dropDatabase,
            createDatabase,
            dropTables,
            createTableContinent,
            loadDataContinent,
            createTableCurrency,
            loadDataCurrency
        ], function(err) {
            closeConnection(); //по завершению закрываем соединение с mysql
            if (err) throw err;
            log.info("Database created");
            cb();
        }
    );
};

if (module.parent) {
    module.exports = function(cb){
        createDatabase(cb);
    };
} else {
    createDatabase(function (){});
}