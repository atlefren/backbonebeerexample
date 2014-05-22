# -*- coding: utf-8 -*-

import sys
reload(sys)
sys.setdefaultencoding('utf-8')

import os
import json

from flask import Flask, render_template, request
from webassets.loaders import PythonLoader
from flask.ext.assets import Environment, Bundle
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.restful import reqparse, abort, Api, Resource, marshal_with, fields
from flask.ext.restful.representations.json import output_json
output_json.func_globals['settings'] = {'ensure_ascii': False, 'encoding': 'utf8'}

app = Flask(__name__)
app.debug=True
assets = Environment(app)
bundles = PythonLoader('assetbundle').load_bundles()
for name, bundle in bundles.iteritems():
    assets.register(name, bundle)

app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:////tmp/test.db')
db = SQLAlchemy(app)
db.create_all()

api = Api(app)

class Beer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    brewery= db.Column(db.String)
    name = db.Column(db.String)
    score = db.Column(db.Float)
    abv = db.Column(db.Float)
    amount = db.Column(db.Integer)

    def __init__(self, brewery, name, score, abv):
        self.brewery = brewery
        self.name = name
        self.score = score
        self.abv = abv
        self.amount = 1

    def __repr__(self):
        return '<Beer %r (%r)>' % (self.name, self.brewery)
    
    def as_dict(self):
       return {c.name: getattr(self, c.name) for c in self.__table__.columns}        

parser = reqparse.RequestParser()
parser.add_argument('name', type=str)
parser.add_argument('brewery', type=str)
parser.add_argument('abv', type=float)
parser.add_argument('score', type=float)
parser.add_argument('amount', type=int)

beer_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'brewery': fields.String,
    'abv' : fields.Float,
    'score' : fields.Float,
    'amount': fields.Integer
}

class BeerResource(Resource):
    
    def delete(self, beer_id):        
        beer = Beer.query.get(beer_id)
        if not beer:
            abort(404)

        db.session.delete(beer)
        db.session.commit()
        return '', 204
    
    @marshal_with(beer_fields)
    def put(self, beer_id):
        beer = Beer.query.get(beer_id)
        if not beer:
            abort(404)

        args = parser.parse_args()        
        for key, value in args.iteritems():
            setattr(beer, key, value)

        db.session.add(beer)
        db.session.commit()
        db.session.refresh(beer)

        return beer, 200

class BeerListResource(Resource):
    
    @marshal_with(beer_fields)
    def post(self):
        args = parser.parse_args()        
        beer = Beer(            
            args['brewery'],
            args['name'],
            args['abv'],
            args['score']
        )
        if args.get('amount', None):
            beer.amount = args['amount'] 
        db.session.add(beer)
        db.session.commit()
        db.session.refresh(beer)
        
        return beer, 201
        
api.add_resource(BeerListResource, '/api/beers/')
api.add_resource(BeerResource, '/api/beers/<string:beer_id>')

@app.route('/')
def index():   
    beers = [beer.as_dict() for beer in Beer.query.all()]
    return render_template('index.html', beers=json.dumps(beers))

