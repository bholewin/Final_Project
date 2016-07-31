/*
Bryce Holewinski
CS290, Section 400
Much of the below code is utilized from professor Wolford's public github page for the class
*/
//general set up
var express = require('express');
var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'localhost',
  user            : 'student',
  password        : 'default',
  database        : 'student'
});
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public'));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 3001);

//home page
app.get('/', function(req, res){
  res.render('home');
})


//page for selecting the currently available data
app.get('/selection',function(req,res,next){
  var context = {};
  pool.query('SELECT * FROM workouts', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    //need to stringify the rows and send them back
    //res.type('text/plain');
    var tableData = JSON.stringify(rows);
    res.send(rows);
  });
});


//changed to a post per piazza post @142
app.post('/insert',function(req,res,next){
  var context = {};
  pool.query("INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `measure`) VALUES (?, ?, ?, ?, ?)",
  [req.body.name, req.body.reps, req.body.weight, req.body.date, req.body.measure], function(err, result){
    if(err){
      next(err);
      return;
    }
    //reference: https://davidwalsh.name/format-date-mysql-date_format
    pool.query("SELECT * FROM workouts", function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      //res.type('text/plain');
      var tableData = JSON.stringify(rows);
      res.send(rows);
    });
  });
});


app.post('/delete',function(req,res,next){
  var context = {};
  pool.query("DELETE FROM workouts WHERE id=(?)", [req.body.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    pool.query("SELECT * FROM workouts", function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
      res.type('text/plain');
      res.send(rows);
    });
  });
});



app.get('/update',function(req,res,next){
  var context = {};
  pool.query("SELECT * FROM workouts WHERE id = (?)",
  [req.query.name, req.query.reps, req.query.weight, req.query.date, req.query.measure], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date =?, measure=? WHERE id=? ",
        [req.query.name || curVals.name, req.query.reps || curVals.reps, req.query.weight || curVals.weight, req.query.date||curVals.date, req.query.measure||curVals.measure, req.query.id],
        function(err, result){
        if(err){
          next(err);
          return;
        }
        context.results = "Updated " + result.changedRows + " rows.";
        res.render('home',context);
      });
    }
  });
});

//from the assignment requirements
app.get('/reset-table',function(req,res,next){
  var context = {};
  pool.query("DROP TABLE IF EXISTS workouts", function(err){
    //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE workouts("+
    "id INT PRIMARY KEY AUTO_INCREMENT,"+
    "name VARCHAR(255) NOT NULL,"+
    "reps INT,"+
    "weight INT,"+
    "date DATE,"+
    "lbs BOOLEAN)";
    pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});
