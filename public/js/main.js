;(function(){
    window.App = {
        Models: {},
        Views: {},
        Collections: {}
    };

    App.Models.Currency = Backbone.Model.extend({
        defaults: {
            code: '',
            name: {
                en: '',
                ru: ''
            }
        },
        urlRoot: '/list'
    });

    App.Collections.Currency = Backbone.Collection.extend({
        model: App.Models.Currency,
        url: '/list'
    });

    App.Views.CurrencyList = Backbone.View.extend({
        tagName: 'div',
        className: 'row',
        render: function (){
            this.collection.each(this.addOne, this);
            return this;
        },

        addOne: function (currency){
            var currency = new App.Views.CurrencyItem({ model: currency });
            this.$el.append( currency.render().el );
        }
    });

    App.Views.CurrencyItem = Backbone.View.extend({
        tagName: 'div',
        className: 'col s6 m6 l4',

        template: _.template('<input type="checkbox" class="filled-in" id="<%= id%>"/><label for="<%= id%>"> <%=name.ru%></label>'),

        initialize: function(){
            this.render();
        },

        render: function(){
            this.$el.html( this.template( this.model.toJSON() ) );
            return this;
        }
    });

    App.Views.SubmitForm = Backbone.View.extend({
        el: '#list',

        events: {
            'submit': 'submit'
        },

        submit: function (e){
            e.preventDefault();

            var tmp = $(e.currentTarget).find('input[type=checkbox]:checked');
            //var picker = $(e.currentTarget).find('.datepicker');
            var dataList = {list:[], dateBegin: 0, dateEnd: 0};
            var dateBeginPicker = $dateBegin.pickadate('picker');
            var dateEndPicker = $dateEnd.pickadate('picker');
            dataList.dateBegin = dateBeginPicker.get('select').pick;
            dataList.dateEnd = dateEndPicker.get('select').pick;
            for (var i = 0, j = tmp.length ; i < j ; i++){
                dataList.list.push(this.collection.get(tmp[i].id).attributes);
            }
            refresh(dataList);

        }

    });
    var $dateBegin, $dateEnd;
    var list = new App.Collections.Currency();
    list.fetch()
        .success(function(){
            var views = new App.Views.CurrencyList({collection:list});
            var currencyList = $('#list');
            currencyList.append(views.render().el);
            currencyList.append('<div class="row"><div class="input-field col s6 m3 l3"><input class="datepicker" type="date" name="dateBegin" id="dateBegin"><label for="dateBegin">Начальная дата</label></div><div class="input-field col s6 m4 l3"><input class="datepicker" type="date" name="dateEnd" id="dateEnd"><label for="dateEnd">Конечная дата</label></div></div>');
            currencyList.append('<div class="row"><div class="input-field col s6 m3 l3"><button class="btn waves-effect waves-teal" type="submit">Подтвердить</button></div><div class="input-field col s6 m4 l3"><button class="btn waves-effect waves-red red" type="reset">Отменить</button></div></div>');
            var submitForm = new App.Views.SubmitForm({collection:list});
            var pickdateOptions = {
                selectMonths: true, // Creates a dropdown to control month
                selectYears: Math.round((new Date() - new Date(1992,1,1))/(1000*60*60*24*356)), // Creates a dropdown of 15 years to control year
                min: new Date(1992,1,1),
                max: new Date(),
                labelMonthNext: 'Следующий месяц',
                labelMonthPrev: 'Предыдущий месяц',
                labelMonthSelect: 'Выберите месяц',
                labelYearSelect: 'Выберите год',
                monthsFull: [ 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сантябрь', 'Октябрь', 'Ноябрь', 'Декабрь' ],
                monthsShort: [ 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек' ],
                weekdaysFull: [ 'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота' ],
                weekdaysShort: [ 'Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб' ],
                weekdaysLetter: [ 'В', 'П', 'В', 'С', 'Ч', 'П', 'С' ],
                today: 'Сегодня',
                clear: false,
                close: 'Закрыть'
            };
            $dateBegin = $('#dateBegin').pickadate(pickdateOptions);
            $dateEnd = $('#dateEnd').pickadate(pickdateOptions);
        });



    var chart,
        data = [];

    nv.addGraph(function() {
        chart = nv.models.lineWithFocusChart()
            .useInteractiveGuideline(true)
        ;

        //chart.focusHeight(100);
        //chart.focusMargin({ "top": 20 });

        var RU = d3.locale({
            'decimal': ',',
            'thousands': '\xa0',
            'grouping': [3],
            'currency': ['', ' руб.'],
            'dateTime': '%A, %e %B %Y г. %X',
            'date': '%d.%m.%Y',
            'time': '%H:%M:%S',
            'periods': ['AM', 'PM'],
            'days': [ 'Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота' ],
            'months': [ 'Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря' ],
            'shortDays': [ 'Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб' ],
            'shortMonths': [ 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек' ]
        });
        chart.xAxis
            .tickFormat(function(d) {
                //return RU.timeFormat('%d %b %Y')(new Date(d))
                if (d == undefined){
                    console.log('this is undefined');
                }
                return d3.time.format('%d %b %Y')(new Date(d))
            });
        chart.x2Axis
            .tickFormat(function(d) {
                //return RU.timeFormat('%x')(new Date(d))
                return d3.time.format('%x')(new Date(d))
            });

        chart.yAxis
            //.tickFormat(d3.format(',.4f'));
            .tickFormat(function(d) {
                if (d == undefined){
                    console.log('this is undefined');
                }
                if (d == null) {
                    return 'N/A';
                }
                return d3.format(',.4f')(d);
            });

        chart.y2Axis
            .tickFormat(d3.format(',.2f'));


        d3.select('#chart svg')
            .datum(data)
            .transition()
            .duration(0)
            .call(chart)
        ;

        nv.utils.windowResize(chart.update);

        return chart;
    });


    function refresh(dataList) {
        $.ajax({
            type: 'GET',
            url: 'chart',
            data: {
                list: dataList.list,
                dateBegin: dataList.dateBegin,
                dateEnd: dataList.dateEnd
            },
            success: function(values){
                data.length = 0;
                for (var i = 0, j = values.length ; i < j ; i++ ){
                    data.push(values[i]);
                }
                chart.update();
            }
        });
    }

})();