var express = require("express");
var mongojs = require("mongojs");
var bodyParser = require("body-parser");
var logger = require("morgan");
var cheerio = require("cheerio");
var request = require("request");

var app = express();

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

app.get("/", function(req, res){
    db.articles.find().sort({
        "_id": -1
    }, function (err, docs) {
        res.json(docs);
    });
})

app.get("/scrape", function (req, res) {
    request("https://pitchfork.com/latest/", function (error, response, html) {

        var $ = cheerio.load(html);

        var results = [];

        $("div.article-details").each(function (i, element) {

            var link = "https://pitchfork.com" + $(element).find(".title-link").attr("href");
            var title = $(element).find(".title").text();
            var byline = $(element).find(".display-name").text();
            var time = $(element).find(".pub-date").attr("title");
            var img = $(element).parent().find("img").attr("src");
            
            var article = {
                title: title,
                byline: byline,
                time: time,
                link: link,
                img: img,
                saved: false,
                comments: []
            };

            db.articles.find({
                "link": link
            }, function (err, doc) {
                if (doc.length === 0) {
                    db.articles.insert(article)
                }
            });
        });

        db.articles.find().sort({
            "_id": -1
        }, function (err, docs) {
            res.json(docs);
        });
    });
});

app.get("/save/:artID/:saved", function (req, res) {
    var ObjectId = mongojs.ObjectId;
    var articleID = req.params.artID;
    var saved = req.params.saved;

    if (saved == "false") {
        saved = true;
    } else {
        saved = false;
    }

    db.articles.findAndModify({
            query: {
                "_id": ObjectId(articleID)
            },
            update: {
                $set: {
                    "saved": saved,
                }
            }
        },
        function (err, doc, lastErrorObject) {
            res.json(doc);
        }
    );
});

app.get("/saved", function (req, res) {
    db.articles.find({
        "saved": true
    }).sort({
        "_id": -1
    }, function (err, docs) {
        res.json(docs);
    });
});

app.post("/comment", function (req, res) {
    var ObjectId = mongojs.ObjectId;
    var articleID = req.body.id;
    var comment = req.body.comment;

    db.articles.findAndModify({
            query: {
                "_id": ObjectId(articleID)
            },
            update: {
                $push: {
                    "comments": comment,
                }
            }
        },
        function (err, doc, lastErrorObject) {
            db.articles.find().sort({
                "_id": -1
            }, function (err, docs) {
                res.json(docs);
            });
        }
    );
});

app.post("/delcom", function (req, res) {
    var ObjectId = mongojs.ObjectId;
    var articleID = req.body.id;
    var comment = req.body.comment;

    db.articles.findAndModify({
            query: {
                "_id": ObjectId(articleID)
            },
            update: {
                $pull: {
                    "comments": comment,
                }
            },
            new: false
        },
        function (err, doc, lastErrorObject) {
            db.articles.find().sort({
                "_id": -1
            }, function (err, docs) {
                res.json(docs);
            });
        });
});

var port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log("App running on port 3000!");
});