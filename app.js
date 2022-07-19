//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//CREATE MONGOOSE DB
//mongoose.connect("mongodb://localhost:27017/todolistDB");
mongoose.connect("mongodb+srv://admin:pa55word@cluster0.uaddg.mongodb.net/todolistDB");

//CREATE Schema
const itemSchema = new mongoose.Schema({
  name: String
});

//NEW MONGOOSE MODEL BASED ON Schema
const Item = mongoose.model("Item", itemSchema);

//CREATE NEW items
const item1 = new Item({
  name: "Welcome to your To Do List."
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<--- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);


//DELETE FROM THE DATABASE
// Item.deleteOne({ id: "62d5e168b00e66ac9ef7791a"}, function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("succesfully deleted document entry")
//   }
// });

//const items = ["Buy Food", "Cook Food", "Eat Food"];
//const workItems = [];

app.get("/", function(req, res) {
  //FIND IN THE DATABASE
  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("successfully added the items");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      });
    }
  });
});


//DYNAMIC ROUTE
app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName); //using lodash to capitalize first letter always

  if (req.params.customList === "Robots.txt" || req.params.customListe === "Favicon.ico") {
    next();
  }

  //console.log(customListName); //to log what user enters after forward slash in URL
  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {
        console.log(customListName + " doesn't exist in the list!");

        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);

      } else {
        console.log(customListName + " exists in the list!")

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

});


app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save(); //to save item
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});


//DELETE FROM CHECKBOX POST ACTION
app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err) {
        console.log("successfully deleted checked item: " + checkedItemId);
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedItemId}}}, function(err, results){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }


});

// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });



app.get("/about", function(req, res) {
  res.render("about");
});


app.listen(process.env.PORT || 3000, function () {
console.log("Server started.");
 });
