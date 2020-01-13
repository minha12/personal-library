/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var ObjectId = require("mongodb").ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function(app) {
  app
    .route("/api/books")
    //4.I can get /api/books to retrieve an aray of all books containing
    //title, _id, & commentcount
    .get(function(req, res) {
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
        if (err) console.log("Database error: " + err);
        else {
          console.log("Successfully connected to MongoDB");
          db.collection("BookLib")
            .find({})
            .toArray((err, docs) => {
              if (err) console.log("Error while finding books");
              else {
                console.log(docs);
                let result = {}
                result = docs.map(item => {
                  item.commentcount = item.comments ? item.comments.length : 0 
                })
                res.send(docs);
              }
            });
        }
      });
    })

    //I can post a title to /api/books to add a book and returned will be the object
    //with the title and a unique _id.
    .post(function(req, res) {
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      console.log("Title: " + title);
      if (!title) {
        console.log("Please enter a book title");
        res.send("Please enter a book title");
      } else {
        var book = { title: title };
        MongoClient.connect(MONGODB_CONNECTION_STRING, (err, db) => {
          if (err) console.log("Database error: " + err);
          else {
            console.log("Successfully connected to MongoDB");
            db.collection("BookLib").insertOne(book, (err, doc) => {
              if (err) console.log("Error while inserting new book: " + err);
              else {
                console.log(book);
                res.send(book);
              }
            });
          }
        });
      }
    })

    .delete(function(req, res) {
      //if successful response will be 'complete delete successful'
    });

  app
    .route("/api/books/:id")
    .get(function(req, res) {
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })

    .post(function(req, res) {
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    })

    .delete(function(req, res) {
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
};
