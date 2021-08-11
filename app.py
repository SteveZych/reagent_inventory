from flask import Flask, render_template, request, redirect
import sqlite3 as sql
import pandas as pd

app = Flask(__name__)

@app.route('/', methods = ['POST', 'GET'])
def home():
    return render_template('index.html')

@app.route('/add', methods = ['POST', 'GET'])
def add():
    if request.method == 'POST':
        try:
            # HTML add form 
            section = request.form['section']
            reagent = request.form['reagent']
            lot = request.form['lot']
            expiration = request.form['expiration']
            receive = request.form['receive']
            quantity = request.form['quantity']

            # Connect to sqlite database and commit form data
            with sql.connect("data/reagents.sqlite") as con:
                cur = con.cursor()
                cur.execute("INSERT INTO reagents (section, reagent_name, lot_number, expiration_date, received_date, quantity) VALUES (?,?,?,?,?,?)",(section, reagent, lot, expiration, receive, quantity))
                
            con.commit()
            print("Inventory added to sqlite database.")
           
        
        except:
            con.rollback()
            print("Something went wrong! Inventory was not added to sqlite database.")

        finally:
            return redirect("/add")
            con.close()

    return render_template('add.html')

@app.route('/remove', methods = ['POST', 'GET'])
def remove():
    return render_template('remove.html')
    
@app.route('/cultures')
def cultures():
    con = sql.connect('data/reagents.sqlite')
    cur = con.cursor()
    cur.execute("SELECT reagent_name, quantity, action FROM reagents WHERE section = 'cultures'")
    culture_reagents = cur.fetchall()
    con.close()

    reagent_and_total = []
    for reagent in culture_reagents:
        total = 0
        if reagent[2] == 'add':
            total += reagent[1]
        else:
            total -= reagent[1]
        reagent_and_total.append(reagent, total)


if __name__ == '__main__':
   app.run(debug = True)

   


