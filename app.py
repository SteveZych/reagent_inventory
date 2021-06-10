from flask import Flask, render_template, redirect
from flask_pymongo import PyMongo

#Create an instance of Flask
app = Flask(__name__)

#Establish mongo connection
app.config["MONGO_URI"] = "mongodb://localhost:27017/reagent_inventory"
mongo = PyMongo(app)


#Route to render index.html
@app.route("/")
def home():
    return render_template('index.html')

@app.route("/add")
def add():
    if request.method == "POST":
        
    return render_template('app.html')



