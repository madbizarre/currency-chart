var async = require('async'),
    download = require('../../middleware/load/downloadXML'),
    load = require('../../middleware/load/loadData'),
    log = require('../../lib/log')(module),
    pars = require('../../middleware/load/parsXML'),
    selectCurrencyCode = require('../../middleware/selectCurrencyList').selectCurrencyList;
//true - полное скачивание, false - обновление
var run = function (isFullUpdate){
    selectCurrencyCode(function(currencyList){ //выбираем список валют из бд
        async.eachSeries(currencyList, function(currency, callback){ //для каждой валюты выполняем
            download(currency.code, isFullUpdate, function(xml){ //скачиваем xml файл с сайта цбр
                pars(currency.code, xml, function(data){ //разбираем xml в txt
                    if (!data.length) callback(); //pnt = true - значит нечего обновлять
                    else
                        load(currency.code, isFullUpdate, data, function(){ //добавляем данные в бд
                            log.info("Data for " + currency.code + " updated");
                            callback();
                        });
                });
            });
        }, function(err){
            if (err) throw err;
            log.info("Data updated");
        });
    });
};

if (module.parent) {
    module.exports = run;
} else run(true);