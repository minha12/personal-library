'use strict';

const { MongoClient, ObjectId, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.DB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB once
let connected = false;
async function connectDB() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
}

module.exports = function(app) {
  app.route("/api/books")
    .get(async function(req, res) {
      try {
        await connectDB();
        const collection = client.db("personal-library").collection("BookLib");
        const books = await collection.find({}).toArray();
        if (books.length === 0) {
          return res.json([]); // Return empty array if no books
        }
        const result = books.map(book => ({
          _id: book._id,
          title: book.title,
          comments: book.comments || [],
          commentcount: book.comments ? book.comments.length : 0
        }));
        res.json(result);
      } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Error accessing database' });
      }
    })

    .post(async function(req, res) {
      const title = req.body.title;
      if (!title) {
        return res.send("Please enter a book title");
      }
      
      try {
        await connectDB();
        const collection = client.db("personal-library").collection("BookLib");
        const book = { title, comments: [] };
        const result = await collection.insertOne(book);
        res.json(book);
      } catch (err) {
        console.error('Error inserting book:', err);
        res.status(500).json({ error: 'Could not insert book' });
      }
    })

    .delete(async function(req, res) {
      try {
        await connectDB();
        const collection = client.db("personal-library").collection("BookLib");
        await collection.deleteMany({});
        res.send('Complete delete successful');
      } catch (err) {
        console.error('Delete error:', err);
        res.send('Complete delete unsuccessful');
      }
    });

  app.route("/api/books/:id")
    .get(async function(req, res) {
      const bookid = req.params.id;
      if (!bookid) {
        return res.send('Input book ID to search');
      }

      try {
        await connectDB();
        const collection = client.db("personal-library").collection("BookLib");
        const book = await collection.findOne({ 
          _id: ObjectId.isValid(bookid) ? new ObjectId(bookid) : bookid 
        });
        
        if (!book) {
          return res.send('Book ID does not exist');
        }
        
        book.comments = book.comments || [];
        res.json(book);
      } catch (err) {
        console.error('Error finding book:', err);
        res.status(500).json({ error: 'Error accessing database' });
      }
    })

    .post(async function(req, res) {
      const bookid = req.params.id;
      const comment = req.body.comment;
      
      if (!bookid) {
        return res.send('Insert a book ID to add comments');
      }

      try {
        await connectDB();
        const collection = client.db("personal-library").collection("BookLib");
        const result = await collection.findOneAndUpdate(
          { _id: new ObjectId(bookid) },
          { $push: { comments: comment } },
          { returnDocument: 'after' }
        );
        
        if (!result) {
          return res.send('Adding comment unsuccessful');
        }
        res.json(result);
      } catch (err) {
        console.error('Error adding comment:', err);
        res.send('Adding comment unsuccessful');
      }
    })

    .delete(async function(req, res) {
      const bookid = req.params.id;
      
      try {
        await connectDB();
        const collection = client.db("personal-library").collection("BookLib");
        const result = await collection.deleteOne({ _id: new ObjectId(bookid) });
        
        if (result.deletedCount === 0) {
          return res.send('Delete unsuccessful');
        }
        res.send('Delete successful');
      } catch (err) {
        console.error('Delete error:', err);
        res.send('Delete unsuccessful');
      }
    });
};
