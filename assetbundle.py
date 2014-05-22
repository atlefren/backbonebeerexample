# -*- coding: utf-8 -*-
from flask.ext.assets import Bundle
from app import app



javascript = Bundle(
    'js/lib/jquery-1.11.0.min.js',
    'js/lib/underscore-min.js',
    'js/lib/backbone-min.js',
    'js/src/beerlist.js',
    output='gen/js/script.js'
)

css = Bundle(
    'css/bootstrap.min.css', 
    output='gen/css/common.css'
)