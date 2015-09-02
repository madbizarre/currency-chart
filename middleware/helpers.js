(function(){

    Date.prototype.copy = function (){
        return new Date(this.getTime());
    };
    Date.prototype.addDay = function (){
        return this.setDate(this.getDate() + 1);
    };

    //преобразование даты в строку
    Date.prototype.dateToString = function (separator){
        var d = [];
        d = ['0' + this.getDate(), '0' + (this.getMonth() + 1), '' + this.getFullYear()];
        for (var i = 0, j = d.length - 1; i < j; i++){
            d[i] = d[i].slice(-2);
        }
        switch (separator){
            case '/': //дата -> dd/mm/yyyy
                return d.slice(0, 3).join('/');
                break;
            case '.': //дата -> dd.mm.yyyy
                return d.slice(0, 3).join('.');
                break;
            case '-': //дата -> yyyy-mm-dd
                return d[2] + separator + d[1] + separator + d[0];
                break;
            case 'none': //дата -> yyyymmdd
                return d[2] + d[1] + d[0];
                break;
        }
    };

    //трансформирование строк
    String.prototype.formatDate = function(separator){
        var d = [],
            sp = '',
            str = this;
        if (str.length == 8) {
            d = [str.substring(4,8), ('0' + str.substring(0,2)).slice(-2), ('0' + str.substring(2,4)).slice(-2)];
        } else {
            if (~str.indexOf('/')){
                sp = '/';
            } else if (~str.indexOf('-')){
                sp = '-';
            } else if (~str.indexOf('.')){
                sp = '.';
            }
            d = str.split(sp);
        }
        if (separator == '-') {
                d = [d[2], d[1], d[0]];
        } else if (separator == 'none'){
            separator = '';
        }

        str = d.slice(0,3).join(separator);
        return str;
    };

    //подсчет сколько дней между датами
    Date.prototype.countDays = function (date){
        var dt = this.copy();
        if (dt > date){
            return -Math.floor((date - dt)/(1000*60*60*24));
        } else {
            return -Math.floor((dt - date)/(1000*60*60*24));
        }
    };

    //преобразуем строку в дату
    String.prototype.stringToDate = function (){
        var dateStr = this;
        if (dateStr.length == 10) {
            if ((~dateStr.indexOf('/')) || (~dateStr.indexOf('.'))) { // DD/MM/YYYY DD.MM.YYYY => javascript Date()
                return new Date(dateStr.substring(6, dateStr.length), +dateStr.substring(3, 5) - 1, dateStr.substring(0, 2), 12,12);
            } else { // YYYY-MM-DD => javascript Date()
                return new Date(dateStr.substring(0, 4), +dateStr.substring(5, 7) - 1, dateStr.substring(8, dateStr.length),12,12);
            }
        } else { // YYYYMMDD => javascript Date()
            return new Date(dateStr.substring(0, 4), +dateStr.substring(4, 6) - 1, dateStr.substring(6, 8),12,12);
        }
    };

    //получение массива дат между dateBegin и dateEnd
    String.prototype.getDateArray = function (dateEnd, separator){
        var dateBegin = this, dateArr = [], date1 = dateBegin.stringToDate(), date2 = date1.copy(), k = 0;
        date2.setDate(date2.getDate() - 1);
        k = date2.countDays(date1);
        for (var i = 0, j =  k + 2 ; i < j ; i++){
            dateArr[i] = date1.dateToString(separator);
            date1.addDay();
            date2.addDay();
            if (date1.getDate() == date2.getDate()) { //проверка на изменение даты,
                date1.addDay();   //т.к. при переходе на летнее/зимнее время
                date2.addDay();   //может получиться одна дата с разными часами
            }
        }
        return dateArr;
    };
})();