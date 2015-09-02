exports.get = function (req, res, next){
    var selectCurrencyList = require('../middleware/selectCurrencyList').selectCurrencyList;
    var selectCurrencyItem = require('../middleware/selectCurrencyList').selectCurrencyItem;
    if (req.params.id){
        selectCurrencyItem(req.params.id, function(item){
            res.send(JSON.parse(JSON.stringify(item)));
        });
    } else {
        selectCurrencyList(function(list){
            res.send(JSON.parse(JSON.stringify(list)));
        });
    }
};