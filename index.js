const express = require("express");
const app = express();
const sqlite3 = require("sqlite3").verbose();

//Run engine
app.set("view engine", "ejs");
const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
//Middleware for the Requests.body to retrieve posted values
app.use(express.urlencoded({ extended: false })); // <--- middleware configuration 

app.listen(3000, () => {
  console.log("Server started (http://localhost:3000/) !");
});

//Connection to the database
const db_name = path.join(__dirname, "data", "reagents.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'reagents.db'");
});

//Table needed for reagents, QC, and log of transactions

//Creating table
const sql_create_reagents = `CREATE TABLE IF NOT EXISTS Reagent (
    Reagent_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Department_Name VARCHAR(100) NOT NULL,
    Department_Area VARCHAR(100) NOT NULL,
    Reagent_Name VARCHAR(100) NOT NULL,
    Receive_Date VARCHAR(100) NOT NULL,
    Lot_Number INTEGER(20) NOT NULL,
    Expiration_Date DATE NOT NULL,
    Quantity INTEGER(10) NOT NULL,
    QC_Status BINARY NOT NULL,
    Comments TEXT
  );`;
  
  db.run(sql_create_reagents, err => {
    if (err) {
      return console.error(err.message);
    }else{
    console.log("Successful creation of the 'Reagents' table")};
  });

//GET for home route
app.get("/", (req, res) =>{
    res.render("index");
  });

// GET /add
app.get("/add", (req, res) => {
    res.render("add", { model: {} });
  });
  
// POST /add
app.post("/add", (req, res) => {
    let sql = `INSERT INTO Reagent (Department_Name, Department_Area, Reagent_Name, Receive_Date, Lot_Number, 
        Expiration_Date, Quantity, QC_Status, Comments) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let reagent = [req.body.Department_Name, req.body.Department_Area, req.body.Reagent_Name, req.body.Receive_Date, req.body.Lot_Number, req.body.Expiration_Date, req.body.Quantity, 0, req.body.Comments];
    db.run(sql, reagent, err => {
        if (err) {
            console.log("Reagent was not added to database");
        }
        res.redirect("/add");
    });
  });
