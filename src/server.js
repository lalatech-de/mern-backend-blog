require('dotenv').config();

import express         from 'express';
import { MongoClient } from 'mongodb';

// Mongodb authentication
const mongoUser     = process.env.MONGO_INITDB_ROOT_USERNAME;
const mongoPassword = process.env.MONGO_INITDB_ROOT_PASSWORD;

const app = express();
app.use(express.json());

const withDB = async (operations, res) => {
  const client = await MongoClient.connect(`mongodb://${mongoUser}:${mongoPassword}@localhost:27017`, { useUnifiedTopology: true });
  try {
    const db = client.db('my-blog');
    await operations(db);
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to db', error });
  } finally {
    client.close();
  }
}

app.get('/api/articles/:name', async (req, res) => {
  withDB(async (db) => {
    const articleName = req.params.name;  
    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    res.status(200).json(articleInfo); 
  }, res);
});

app.post('/api/articles/:name/upvote', async (req, res) => {
  withDB(async (db) => {
    const articleName = req.params.name;
    const articles = await db.collection('articles');
  
    const articleInfo        = await articles.findOne({ name: articleName });
    await articles.updateOne({ name: articleName }, { '$set': { upvotes: articleInfo.upvotes +1 } });
    const updatedArticleInfo = await articles.findOne({ name: articleName });

    res.status(200).json(updatedArticleInfo);
  }, res);
});

app.post('/api/articles/:name/add-comment', (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;
  withDB(async (db) => {
    const articles = await db.collection('articles');
    const articleInfo = await articles.findOne({ name: articleName});
    await articles.updateOne({ name: articleName }, { '$set': { comments: articleInfo.comments.concat({ username, text}) } });
    const updatedArticleInfo = await articles.findOne({ name: articleName });
    res.status(200).json(updatedArticleInfo);
  }, res);
});

app.listen('8000', console.log('Listening on port 8000'));