var parser = require('node-xml-lite');

require('../../middleware/helpers');

module.exports = function(currencyId, xml, callback){
    var data = parser.parseString(xml),
        str = '';
    if (data.childs){   //если есть данные
            for (var i = 0, j = data.childs.length ; i < j ; i++){
                var currentDate = '\"' + data.childs[i].attrib.Date.formatDate('-')+'\"',
                    currentValue = data.childs[i].childs[1].childs[0].toString().replace(/пїЅ/g,'').replace(/,/g,'.'),
                    currentNominal = data.childs[i].childs[0].childs[0];
                str += '(' + currentDate + ',' + currentValue + ',' + currentNominal + ')'; //формируем строку с данными
                if (i-j+1){
                    str += ',';
                }
            }
    }
    callback(str);
};