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

@app.route("/add", methods=['POST'])
def add():
    if request.method == "POST":
        section = request.form['section']
        reagent = request.form['reagent']
        lot = request.form['lot']
        expiration = request.form['expiration']
        receive = request.form['receive']
        quantity = request.form['quantity']

        add = {
            'section': section,
            'reagent': reagent,
            'lot': lot,
            'expiration': expiration,
            'received': receive,
            'quantity': quantity
        }

        try:
            mongo.db.reagents.insert_one(add, upsert=True)
            return redirect('/index', code=302)
        except:
            return "There Was a problem adding."
    
    else:
        return render_template("index0.html")

    
if __name__ == "__main__":
    app.run(debug=True)

