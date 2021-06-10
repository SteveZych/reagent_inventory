from flask import Flask, render_template, redirect, request
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
        section = request.form['section']
        reagent = request.form['reagent']
        lot = request.form['lot']
        expiration = request.form['expiration']
        receive = request.form['receive']
        quantity = request.form['quantity']

        
    return render_template('app.html')



