var BL = {};
(function (ns) {
  'use strict';
  
  var Beer = Backbone.Model.extend({
    defaults: {
        amount: 1
    }
  });

  ns.Beers = Backbone.Collection.extend({
    model: Beer
  });

  var BeerView = Backbone.View.extend({
    
    tagName: 'tr',

    template: $('#beer_row_template').html(),

    render: function () {
        this.$el.html(_.template(this.template, this.model.toJSON()));
        return this;
    }

  });

  ns.BeerTableView = Backbone.View.extend({

    tagName: 'table',

    className: 'table table-striped',

    template: $('#beer_table_template').html(),

    render: function () {
        this.$el.html(_.template(this.template));
        this.$('tbody').append(this.collection.map(function (beer) {
            return new BeerView({model: beer}).render().$el;
        }));
        return this;
    }

  });

}(BL));