var create = require('../middleware/createDB'),
    load = require('../middleware/load'),
    log = require('../lib/log'),
    period = 1000*60*60*24; //1 день

var start = function (){
    create(function(){ //создаем БД и таблицы continent и currency
        load(true); //создаем и загружаем данные в таблицы валют
    });
    setInterval(function(){
        load(false); //с периодом в день обновляем данные
    }, period);
};

if (module.parent) {
    module.exports = start;
} else start();

