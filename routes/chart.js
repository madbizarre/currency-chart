exports.get = function (req, res, next){
    var async = require('async'),
        selectData = require('../middleware/selectData');
    require('../middleware/helpers');
    var list = req.query.list,
        dateBegin, dateEnd,
        data = [];
    if (+req.query.dateBegin > +req.query.dateEnd) {
        dateBegin = new Date(+req.query.dateEnd);
        dateEnd = new Date(+req.query.dateBegin);
    } else {
        dateBegin = new Date(+req.query.dateBegin);
        dateEnd = new Date(+req.query.dateEnd);
    }
    async.eachSeries(list, function(item, callback){
        var arguments = {
            currencyCode: item.code,
            dateBegin: dateBegin,
            dateEnd: dateEnd
        };
        selectData(arguments, function(dt){
            data.push({
                key: dt.rusName,
                values: dt.list
            });
            callback();
        });
    }, function (err) {
        if (err) throw err;
        res.send(data);
    });
};