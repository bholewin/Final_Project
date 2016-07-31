/*
Bryce Holewinski
CS290, Section 400
This file handles the client side javascript
*/
//var bodyParser = require('body-parser');
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(bodyParser.json());

//build a table using the DOM
//resource: https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces
function newTable(data){
  //general setup
  var tbl = document.createElement('table');
  var table_body = document.createElement('tbody');
  var header_row = document.createElement('tr');
  tbl.appendChild(header_row);
  tbl.id = "workoutTable";
  //set up the actual headers via an array
  headers = ["Name", "Reps", "Weight", "Date", "Measurement"];
  for (var i = 0; i < headers.length; i++) {
    var header = document.createElement('th');
    header.textContent = headers[i];
    header.style.border = "2px solid black";
    header_row.appendChild(header);
  }
  //now it's time to create the table rows and their cells
  for (var i = 0; i < data.length; i++) {
    var row = document.createElement('tr');
    var id = data[i]["id"];
    sections = ["name", "reps", "weight", "date", "measurement"];
    for (var j = 0; j < sections.length; j++) {
      var cell = document.createElement('td');
      cell.textContent = data[i][sections[j]];
      cell.style.border = "1px solid black";
      cell.style.textAlign = "center";
      row.appendChild(cell);
    }
    //now time to include the post section for the buttons that'll be on the end of the row
    //reference: http://stackoverflow.com/questions/133925/javascript-post-request-like-a-form-submit
    var fPost = document.createElement('form');
    fPost.setAttribute('method', "post");
    //create the buttons to alter the table
    //reference: http://stackoverflow.com/questions/7707074/creating-dynamic-button-with-click-event-in-javascript
    // also: http://stackoverflow.com/questions/3919291/when-to-use-setattribute-vs-attribute-in-javascript
    //also apparently "delete" is a keyword (pretty obvious in vim but not in atom)
    var dlte = document.createElement('input');
    dlte.setAttribute('type', "button");
    dlte.setAttribute('name', "Delete");
    dlte.setAttribute('value', "Delete");
    dlte.setAttribute('onclick', 'deleteRow(this)');
    fPost.appendChild(dlte);
    //edit button
    var edit = document.createElement('input');
    edit.setAttribute('type', "button");
    edit.setAttribute('name', "Edit");
    edit.setAttribute('value', "Edit");
    edit.setAttribute('onclick', 'editRow(this)');
    fPost.appendChild(edit);
    //creating a hidden attribute as suggested in lecture
    var hidden = document.createElement('input');
    hidden.setAttribute('type', "hidden");
    hidden.setAttribute('name', "id");
    hidden.setAttribute('value', id);
    fPost.appendChild(hidden);
    //add the row to our table
    row.style.border = "1px solid black";
    row.appendChild(fPost);
    tbl.appendChild(row);
  }
  tbl.setAttribute("border", "2");
  return table;
}

//the next few funcitons are based on the code provided in the asynchronous lecture
//this function adds new rows
function bindButtons(){
  document.getElementById('addedWorkout').addEventListener('click', function(event){
      var req = new XMLHttpRequest();
      var payload = {};
      payload.name = document.getElementById('workoutName').value;
      //check to make sure they are not inputting an empty name
      if (payload.name == "") {
        alert("Name is a required field, please try again.")
        return;
      }
      payload.reps = document.getElementById('reps').value;
      payload.weight = document.getElementById('weight').value;
      payload.date = document.getElementById('date').value;
      var buttons = document.getElementsByName('measure');
	    for (var i = 0; i < buttons.length; i++){
	       if (buttons[i].checked){
		      payload.measure = Number(buttons[i].value);
		      break;
		      }
	    }
      /*unsure of the below
      var unit = document.getElementById('measure');
      if (unit.checked == true) {
        payload.measurement = "Lbs";
      }
      else {
        payload.measurement = "KGs";
      }
      */
      req.open('POST', "https://50.112.199.218:3001/insert", true);
      req.setRequestHeader('Content-Type', 'application/json');
      req.addEventListener('load',function(){
        if(req.status >= 200 && req.status < 400){
          var data = JSON.parse(req.responseText);
          var tbl = document.body.appendChild(newTable(data));
          document.body.removeChild(document.getElementById("workoutTable"));
        } else {
          console.log("Error in network request: " + request.statusText);
        }});
      req.send(JSON.stringify(payload));
      event.preventDefault();
    });
}

document.addEventListener('DOMContentLoaded', bindButtons);

/*
//delete row function, modified from project example
function deleteRow(tableID, id) {
  //first handle the deletion on the client side
  var table = document.getElementById(tableID);
  var rowCount = table.rows.length;
  var deleteString = "delete"+id;
  //loop through the rows, except the header, to find the matching id
  for (var i = 1; i < rowCount; i++) {
      var row = table.rows[i];
      var cell = row.getElementByTagName("td");
      var deletedCell = cell[cell.length-1];
      if (deletedCell.children[1].id ===deleteString) {
        table.deleteRow(i);
      }
  }
  //now handle the delete request on the server side
  var req = XMLHttpRequest();
  var qString = "/delete";
  req.open("GET", qString+"?id="+id, true);
  req.addEventListener("load", function(){
    if (req.status>= 200 && req.status < 400) {
      console.log('Deletion successful');
    }
    else{
      console.log('Check for error');
    }
  });
  req.send(qString+"?id="+id);
}

*/
//this function will route the user to a new page to edit their field
