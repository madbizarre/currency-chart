var config = require('config'),
    selectLastData = require('middleware/selectLastData'),
    http = require('http');

require('middleware/helpers');

var run = function (currencyCode, dateBegin, callback){
//             http://www.cbr.ru/scripts/XML_dynamic.asp?date_req1=    14/03/2014   &date_req2=    22/03/2014 &VAL_NM_RQ=    R01239
    var dateEnd = '' + (new Date()).dateToString('/'),
        str = 'http://www.cbr.ru/scripts/XML_dynamic.asp?date_req1=' + dateBegin + '&date_req2=' + dateEnd + '&VAL_NM_RQ=' + currencyCode;

    http.get(str, function (res){
        var xml = '';
        res.on('data', function (chunk){
            xml += chunk; //помещаем данные в переменную xml
        });
        res.on('end', function (){
            callback(xml.replace(/\r\n/g,''));
        });
    }).on('error', function (err){
        if (err) throw err;
    });
};

module.exports = function(currencyCode, isFullUpdate, callback){
    var dateBegin = '01/01/1992';
    if (isFullUpdate) //point = true - полное скачивание, point = false - обновление
        run(currencyCode, dateBegin, callback);
    else {
        selectLastData(currencyCode, function(data){
           dateBegin = (new Date(+data.date)).dateToString('/');
            run(currencyCode, dateBegin, callback);
        });
    }
};