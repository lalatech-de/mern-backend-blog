require('dotenv').config();

const { MongoClient } = require("mongodb");

const articleInfo =require('./article-info.json');

// Connection URI with authentication
const config = {
  hostame : `localhost`,
  port    : '27017'    ,
  user    : process.env.MONGO_INITDB_ROOT_USERNAME,
  password: process.env.MONGO_INITDB_ROOT_PASSWORD,
  databaseName  : 'my-blog',
  collectionName: 'articles',
  data          : articleInfo
};

// Main ---------------------------------------------------------------
(async () => {
  await seedCollection(config).catch(console.dir);
})();
// END Main -----------------------------------------------------------

/**
 * @param {{hostname: string, port: string: string, databaseName: string, collectionName: string, data: object}} config 
 * @param hostame Mongodb connection string, example: 'localhost'
 * @param port Port to connect to, example '27017'
 * @param databaseName Name of the database to be written in
 * @param collectionName Collection name to write the data
 * @param data The data to write  
 */
async function seedCollection({hostame = 'localhost', port = '27017', user, password, databaseName, collectionName, data}) {
  const db = new MongoClient(`mongodb://${user}:${password}@${hostame}:${port}`, { useUnifiedTopology: true });
  
  try {
    await db.connect();
    await console.log("Connected successfully to server");

    const response = await db.db(databaseName).collection(collectionName).insertMany(data);
    console.log(`${response.insertedCount} records inserted`);

  } finally {
    // Ensures that the client will close when you finish/error
    console.log('Closing connection ...');
    await db.close();
  }
}

