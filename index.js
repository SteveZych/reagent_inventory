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
  console.log("Server started (http://localhost:3000/)");
});

//Connection to the reagent database
const db_name = path.join(__dirname, "data", "reagents.db");
const db = new sqlite3.Database(db_name, err => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful connection to the database 'reagents.db'");
});

//Createstable for reagents
const sql_create_reagents = `CREATE TABLE IF NOT EXISTS Reagent (
    Reagent_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    Department_Name VARCHAR(100) NOT NULL,
    Department_Bench VARCHAR(100) NOT NULL,
    Instrument VARCHAR(100) NOT NULL,
    Reagent_Name VARCHAR(100) NOT NULL,
    Receive_Date VARCHAR(100) NOT NULL,
    Lot_Number INTEGER(20) NOT NULL,
    Expiration_Date DATE NOT NULL,
    Quantity_Initial INTEGER(10) NOT NULL,
    Quantity_Current INTEGER(10) NOT NULL,
    QC_Status BINARY NOT NULL,
    Received_By VARCHAR(100) NOT NULL,
    Comments TEXT
  );`;
  
  db.run(sql_create_reagents, err => {
    if (err) {
      return console.error(err.message);
    }
  });

  // Creates table for reagents QC
const sql_create_QC = `CREATE TABLE IF NOT EXISTS Quality_Control (
    Reagent_ID INT PRIMARY KEY,
    Reagent_Name VARCHAR(100) NOT NULL,
    Lot_Number INTEGER(20) NOT NULL,
    Receive_Date VARCHAR(100) NOT NULL,
    QC_Date VARCHAR(100) NOT NULL,
    Performed_By VARCHAR(100) NOT NULL,
    Comments TEXT
    );`;
    
  db.run(sql_create_QC, err => {
    if (err) {
      return console.error(err.message);
    }
  });

// delete_sql_create_QC = `DROP TABLE Quality_Control;`
// db.run(delete_sql_create_QC,err => {
//   if (err) {
//     console.error(err.message);
//   } else {
//     console.log(`Dropped quality control table.`);
//   }
// });

//GET for home route
app.get("/", (req, res)=> {
  res.render("index");
});

//GET for departments route
app.get("/departments", (req, res) =>{
    let sqlHome = "SELECT DISTINCT Department_Bench FROM Reagent";
    db.all(sqlHome, [], (err, row) => {
        if (err) {
            console.log(err);
        } else {
          console.log(`Displaying department benches.`)
        }
        res.render("departments", {model: row});
    });
  });

// GET /add
app.get("/add", (req, res) => {
    console.log(`Rendering add page.`)
    res.render("add", { model: {} });
  });
  
// POST /add
app.post("/add", (req, res) => {
    let sqlAdd = `INSERT INTO Reagent (Department_Name, Department_Bench, Instrument, Reagent_Name, Receive_Date, 
        Lot_Number, Expiration_Date, Quantity_Initial, Quantity_Current, QC_Status, Received_By, Comments) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let reagentAdd = [req.body.Department_Name, req.body.Department_Bench, req.body.Instrument, 
        req.body.Reagent_Name, req.body.Receive_Date, req.body.Lot_Number, req.body.Expiration_Date, 
        req.body.Quantity, req.body.Quantity, "Not Complete", req.body.Received_By, req.body.Comments];
    db.run(sqlAdd, reagentAdd, err => {
        if (err) {
            console.log(err);
        }else{
            console.log("Successfully added reagent to 'Reagent' table.");
        };
        res.redirect("/add");
    });
  });

//GET for bench route
app.get("/bench/:bench", (req, res) =>{
    let bench = req.params.bench;
    let sqlBench = "SELECT DISTINCT Instrument FROM Reagent WHERE Department_Bench = ?";
    db.all(sqlBench, bench, (err, row) => {
        if (err) {
            console.log(err);
        } else {
          console.log(`Displaying ${req.params.bench} instruments.`)
        }
        res.render('bench', {model: row});
    })
  });

  //GET for instrument route
app.get("/instrument/:instrument", (req, res) =>{
    let instrument = req.params.instrument;
    let sqlInstrument = "SELECT DISTINCT Reagent_Name FROM Reagent WHERE Instrument = ?";
    db.all(sqlInstrument, instrument, (err, row) => {
        if (err) {
            console.log(err);
        } else {
          console.log(`Displaying ${req.params.instrument} reagents.`)
        }
        res.render('instrument', {model: row});
    })
  });

    //GET for reagent route
app.get("/reagent/:reagent", (req, res) =>{
    let reagent = req.params.reagent;
    let sqlReagent = "SELECT * FROM Reagent WHERE Reagent_Name = ?";
    db.all(sqlReagent, reagent, (err, row) => {
        if (err) {
            console.log(err);
        } else {
          console.log(`Displaying ${req.params.reagent} table.`)
        }
        res.render('reagent', {model: row});
    })
  });

// GET for editing reagent information
app.get("/edit/:id", (req, res) => {
    let editID = req.params.id;
    let sqlEditID = "SELECT * FROM Reagent WHERE Reagent_ID = ?";
    db.get(sqlEditID, editID, (err, row) => {
      if (err){
          console.log(err);
      } else {
        console.log(`Displaying ID# ${req.params.id} for editing information.`)
      }
      res.render("editor", { model: row });
    });
  });
  
// POST for editing reagents information
app.post("/edit/:id", (req, res) => {
    let sqlReagentUpdate = `UPDATE Reagent SET Department_Name = ?, Department_Bench = ?, Instrument = ?, Reagent_Name = ?, 
        Receive_Date = ?, Lot_Number = ?, Expiration_Date = ?, Quantity_Initial = ?, Quantity_Current = ?, 
        QC_Status = ?, Received_By = ?, Comments = ? WHERE Reagent_ID = ?`;
    let reagentUpdate = [req.body.Department_Name, req.body.Department_Bench, req.body.Instrument, 
        req.body.Reagent_Name, req.body.Receive_Date, req.body.Lot_Number, req.body.Expiration_Date, 
        req.body.Quantity_Initial, req.body.Quantity_Current, req.body.QC_Status, req.body.Received_By, 
        req.body.Comments, req.params.id];
    db.run(sqlReagentUpdate, reagentUpdate, err => {
      if (err){
          console.log(err);
      }else{
        console.log(`Successfully edited ${req.body.Reagent_ID}, ${req.body.Reagent_Name}`);
      }
    res.redirect(`/reagent/${req.body.Reagent_Name}`);
    });
  });


// GET for removing reagent quantity 
app.get("/remove/:id", (req, res) => {
    let removeID = req.params.id;
    let sqlRemove = "SELECT * FROM Reagent WHERE Reagent_ID = ?";
    db.get(sqlRemove, removeID, (err, row) => {
      if (err){
          console.log(err);
      } else {
        console.log(`Displaying ID# ${req.params.id} for updating quantity.`)
      }
      res.render("remove", { model: row });
    });
  });
  
// POST for removing reagent quantity
app.post("/remove/:id", (req, res) => {
    let sqlRemoveQuant = `UPDATE Reagent SET Quantity_Current = ? WHERE Reagent_ID = ?`;
    let quantity_id = [req.body.Quantity_Current, req.params.id];
    db.run(sqlRemoveQuant, quantity_id, err => {
      if (err){
          console.log(err);
      }else{
        console.log(`Successfully updated quantity of ${req.body.Reagent_Name}`);
      }
      res.redirect(`/reagent/${req.body.Reagent_Name}`);
    });
  });

// GET route for pending QC
app.get("/pendingQC", (req, res) => {
    let sqlQC = `SELECT Reagent_ID, Reagent_Name, Lot_Number, Receive_Date, QC_Status FROM Reagent 
                WHERE QC_Status = "Not Complete"`;
    let sqlQC_variables = [];
    db.all(sqlQC, sqlQC_variables, (err, row)=> {
        if (err) {
            console.log(err);
        }else {
          console.log(`Displaying pending QC`);
        }
        res.render('pendingQC', {model: row });
    })
});

// GET for QC form autopopulates with reagent info
app.get("/qcForm/:id", (req, res) => {
    let sqlQCForm = `SELECT Reagent_ID, Reagent_Name, Lot_Number, Receive_Date FROM Reagent WHERE Reagent_ID = ?`;
    let qcForm = [req.params.id];
    db.get(sqlQCForm, qcForm, (err, row) =>{
        if (err){
            console.log(err);
        }else{
          console.log(`Displaying ${req.body.Reagent_ID}, ${req.body.Reagent_Name} for updating QC`);
        }
        res.render("qcForm", { model: row });
    });
  });

// POST for qcForm adds QC info into Quality Control table and Updates Reagent table
app.post("/qcForm/:id", (req, res) => {
    let sqlQC = `INSERT INTO Quality_Control (Reagent_ID, Reagent_Name, Lot_Number, Receive_Date, 
        QC_Date, Performed_By, Comments) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    let qcAdd = [req.body.Reagent_ID, req.body.Reagent_Name, req.body.Lot_Number, req.body.Receive_Date, 
        req.body.QC_Date, req.body.Performed_By, req.body.Comments];
    db.run(sqlQC, qcAdd, err => {
        if (err) {
            console.log(err);
        }else{
            console.log(`Successfully added ${req.body.Reagent_ID}, ${req.body.Reagent_Name} QC to 'Quality Control' table.`);
        };
    });

    let sqlUpdateQC = `UPDATE Reagent SET QC_Status = ? WHERE Reagent_ID = ?`;
    let completeQC = ["Complete", req.params.id];
    db.run(sqlUpdateQC, completeQC , err => {
        if (err) {
            console.log(err);
        }else{
            console.log(`Successfully updated ${req.body.Reagent_ID}, ${req.body.Reagent_Name} QC`);
        };
    });

    res.redirect(`/reagent/${req.body.Reagent_Name}`);
  });

//GET route for Completed QC
app.get("/completedQC", (req, res) => {
  let sqlCompleteQC = `SELECT * FROM Quality_Control`;
  db.all(sqlCompleteQC, [], (err, row) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Displaying completed Quality Control.`);
    }
    res.render("completedQC", {model: row});
  })
});





  //Table needed for reagents, QC, and log of transactions

// Shorten table in reagent view by adding bread crumb

