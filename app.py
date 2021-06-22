from flask import Flask, render_template, redirect, request
from flask_pymongo import PyMongo

#Create an instance of Flask
app = Flask(__name__)

#Establish mongo connection
app.config["MONGO_URI"] = "mongodb://localhost:27017/reagent_inventory"
mongo = PyMongo(app)

# Class to initalize new inventory
class Reagent():
    def __init__(self, section, reagent, lot, expiration, receive, quantity):
        self.section = section
        self.reagent = reagent
        self.lot = lot
        self.expiration = expiration
        self.receive = receive
        self.quantity = quantity

    


#Route to render index.html
@app.route("/", methods=['GET','POST'])
def home():
    return render_template('index.html')

@app.route("/add", methods=['GET','POST'])
def add():
    if request.method == 'POST':
        section = request.form['section']
        reagent = request.form['reagent']
        lot = request.form['lot']
        expiration = request.form['expiration']
        receive = request.form['receive']
        quantity = request.form['quantity']

        print(section, reagent, lot, expiration, receive, quantity)
        return redirect('/')
    else:
        return render_template('add.html')

    #     add = {
    #         'section': section,
    #         'reagent': reagent,
    #         'lot': lot,
    #         'expiration': expiration,
    #         'received': receive,
    #         'quantity': quantity
    #     }

    #     try:
    #         mongo.db.reagents.insert_one(add, upsert=True)
    #         return redirect('/index', code=302)
    #     except:
    #         return "There Was a problem adding."
    
    # else:
    #     return render_template("index.html")

    
if __name__ == "__main__":
    app.run(debug=True)

