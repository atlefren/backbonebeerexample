# -*- coding: utf-8 -*-

import os
from flask import Flask, render_template
from webassets.loaders import PythonLoader
from flask.ext.assets import Environment, Bundle

app = Flask(__name__)
app.debug=True
assets = Environment(app)
bundles = PythonLoader('assetbundle').load_bundles()
for name, bundle in bundles.iteritems():
    assets.register(name, bundle)

@app.route('/')
def hello():
    return render_template('index.html')

    