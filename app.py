from flask import Flask, render_template, redirect
from flask_pymongo import PyMongo

#Create an instance of Flask
app = Flask(__name__)

#Establish mongo connection
mongo = PyMongo(app, url="mongodb://localhost:27017/reagent_inventory")

#Route to render index.html


