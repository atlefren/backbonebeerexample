var BL = {};
(function (ns) {
  'use strict';
  
  var Beer = Backbone.Model.extend({

    defaults: {
        name: '',
        brewery: '',
        abv: '',
        score: '',
        amount: 1
    },

    url: function () {
        var url = '/api/beers/';
        if (!this.isNew()) {
            url += this.get('id');
        }
        return url;
    }

  });

  ns.Beers = Backbone.Collection.extend({
    model: Beer
  });

  var BeerEditView = Backbone.View.extend({
    
    tagName: 'tr',

    template: $('#beer_edit_template').html(),

    events: {
        'click #save': 'save'
    },

    initialize: function () {
        this.model.on('sync', this.saved, this);
    },

    render: function () {
        this.$el.html(_.template(this.template, this.model.toJSON()));    
        return this;
    },

    save: function () {
        console.log("SAVE!")
        this.model.set({
            name: this.$('[name="name"]').val(),
            brewery: this.$('[name="brewery"]').val(),
            abv: this.$('[name="abv"]').val(),
            score: this.$('[name="score"]').val(),
            amount: this.$('[name="amount"]').val()
        });

        this.model.save();
    },

    saved: function () {
        console.log('saved!');
        if (this.collection) {
            this.collection.add(this.model);
        }
        this.remove();
    }

  });

  var BeerView = Backbone.View.extend({
    
    tagName: 'tr',

    template: $('#beer_row_template').html(),

    events: {
        'click #delete': 'destroy',
        'click #edit': 'edit'
    },

    initialize: function () {
        this.model.on('destroy', this.remove, this);
        this.model.on('sync', this.render, this);
    },

    render: function () {
        this.$el.show();
        this.$el.html(_.template(this.template, this.model.toJSON()));
        return this;
    },

    destroy: function () {
        this.model.destroy({'wait': true});
    },

    edit: function () {
        this.$el.hide();
        this.$el.after(
            new BeerEditView({
                collection: this.collection,
                model: this.model
            }).render().$el
        );
    }

  });

  ns.BeerTableView = Backbone.View.extend({

    tagName: 'table',

    className: 'table table-striped',

    template: $('#beer_table_template').html(),

    events: {
        'click #add': 'addBeer'
    },

    initialize: function () {
        this.collection.on('add', this.beerAdded, this);
    },

    render: function () {
        this.$el.html(_.template(this.template));
        this.$('tbody').append(this.collection.map(function (beer) {
            return new BeerView({model: beer}).render().$el;
        }));
        return this;
    },

    addBeer: function () {
        this.$('tbody').append(new BeerEditView({
            collection: this.collection,
            model: new Beer()
        }).render().$el);
    },

    beerAdded: function (model) {
        this.$('tbody').append(new BeerView({model: model}).render().$el);
    }

  });

}(BL));