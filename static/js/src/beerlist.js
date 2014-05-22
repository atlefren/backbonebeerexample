//lag oss et namespace der vi putter det vi trenger utenfor denne fila
var BL = BL || {};
(function (ns) {
    'use strict';

    //brukes kun internt
    var Beer = Backbone.Model.extend({

        //default-funksjoner
        defaults: {
            name: '',
            brewery: '',
            abv: '',
            score: '',
            amount: 1
        },

        //henter ut urlen
        url: function () {
            var url = '/api/beers/';
            //isNew() returnerer false hvis id ikke satt
            if (!this.isNew()) { 
                url += this.get('id');
            }
            return url;
        }

    });

    //putt denne i namespacet: vi bruker den eksternt
    ns.Beers = Backbone.Collection.extend({
        //sett hvilken type models denne skal ha
        model: Beer
    });

    //brukes kun internt
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

            //sett en hel rekke attributter samtidig
            //her ser vi at vi ikke har two-way binding
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
            if (this.collection) {
                this.collection.add(this.model);
            }
            //fjerner elementet fra DOMen    
            this.remove();
        }

    });

    //brukes kun internt
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
            //wait for å ikke få event før server svarer
            this.model.destroy({'wait': true});
        },

        edit: function () {

            //dette er vel egentlig et hack
            this.$el.hide();
            this.$el.after(
                new BeerEditView({
                    collection: this.collection,
                    model: this.model
                }).render().$el
            );
        }

    });

    //putt denne i namespacet: vi bruker den eksternt
    ns.BeerTableView = Backbone.View.extend({

        tagName: 'table', //type tag (default div)

        className: 'table table-striped', //klasser

        template: $('#beer_table_template').html(), //convenience for å hente template

        //DOM-eventer vi lytter på
        events: {
            'click #add': 'addBeer'
        },

        //dette er "constructoren"
        initialize: function (options) {
            //collection settes automagisk

            //lytt på en event fra collection
            this.collection.on('add', this.beerAdded, this);
        },

        //render ut viewet
        render: function () {

            // this.$el er shorthand for jQuery-DOM-noden
            //kjør templating
            this.$el.html(_.template(this.template));
            
            //map over collectionen og lag nye views for hver model
            var elements = this.collection.map(function (beer) {
                return new BeerView({model: beer}).render().$el;
            });

            //this.$('noe') == this.$el.find('noe')
            this.$('tbody').append(elements);

            //returner this for chaining
            return this;
        },

        //denne kalles pga event på DOM
        addBeer: function () {
            //legg til et edit view
            this.$('tbody').append(new BeerEditView({
                collection: this.collection,
                model: new Beer()
            }).render().$el);
        },

        //calles pga event på collection
        beerAdded: function (model) {
            //legg til nytt wiew
            this.$('tbody').append(new BeerView({model: model}).render().$el);
        }

    });

}(BL));