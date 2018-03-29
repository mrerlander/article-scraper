var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require("body-parser");
var logger = require("morgan");
var exphbs = require("express-handlebars");

var app = module.exports = express();

var hbs = exphbs.create({
    helpers: {
        if_eq: function(a, b, opts) {
            if (a == b) {
                return opts.fn(this);
            } else {
                return opts.inverse(this);
            }
        }
    },
    defaultLayout: "main"
});

app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

app.use(logger("dev"));
app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

app.use(express.static("public"));

var databaseUrl = process.env.MONGODB_URI || "mongodb://localhost/articlescraper";
var collections = ["articles"];

var db = mongojs(databaseUrl, collections);

db.on("error", function (error) {
    console.log("Database Error:", error);
});

var routes = require("./routes/routes.js");
app.use("/", routes);

var port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log("App running on port 3000!");
});