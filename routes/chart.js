exports.get = function (req, res, next){
    var async = require('async'),
        selectData = require('../middleware/selectData');
    require('../middleware/helpers');
    var list = req.query.list,
        dateBegin = new Date(+req.query.dateBegin),
        dateEnd = new Date(+req.query.dateEnd),
        data = [], num = 0;
    async.eachSeries(list, function(item, callback){
        var arguments = {
            currencyCode: item.code,
            dateBegin: dateBegin,
            dateEnd: dateEnd
        };
        num++;
        selectData(arguments, function(dt){
            var arr = [];
            for ( var i = 0, j = dt.list.length ; i < j ; i++ ){
                arr.push({
                    series: num,
                    x: dt.list[i].date,
                    y: dt.list[i].value
                });
            }
            data.push({
                key: dt.rusName,
                values: arr
            });
            callback();
        });

    }, function (err) {
        if (err) throw err;
        res.send(data);
    });
};