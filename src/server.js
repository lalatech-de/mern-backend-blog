require('dotenv').config();

import express         from 'express';
import { MongoClient } from 'mongodb';

// Mongodb authentication
const mongoUser     = process.env.MONGO_INITDB_ROOT_USERNAME;
const mongoPassword = process.env.MONGO_INITDB_ROOT_PASSWORD;

const app = express();
app.use(express.json());

app.get('/api/articles/:name', async (req, res) => {
  const client = await MongoClient.connect(`mongodb://${mongoUser}:${mongoPassword}@localhost:27017`, { useUnifiedTopology: true });
  try {
    const articleName = req.params.name;

    const db = client.db('my-blog');
  
    const articleInfo = await db.collection('articles').findOne({ name: articleName });
    res.status(200).json(articleInfo); 
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to db', error });
  } finally {
    client.close();
  }
});

app.post('/api/articles/:name/upvote', async (req, res) => {
  const client = await MongoClient.connect(`mongodb://${mongoUser}:${mongoPassword}@localhost:27017`, { useUnifiedTopology: true });
  try {
    const articleName = req.params.name;
    const articles = client.db('my-blog').collection('articles');
  
    const articleInfo        = await articles.findOne({ name: articleName });
    await articles.updateOne({ name: articleName }, { '$set': { upvotes: articleInfo.upvotes +1 } });
    const updatedArticleInfo = await articles.findOne({ name: articleName });

    res.status(200).json(updatedArticleInfo);
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to db', error });
  } finally {
    client.close();
  }
});

app.post('/api/articles/:name/add-comment', (req, res) => {
  const { username, text } = req.body;
  const articleName = req.params.name;
  articleInfo[articleName].comments.push({ username, text });
  res.status(200).send(articleInfo[articleName]);
});

app.listen('8000', console.log('Listening on port 8000'));