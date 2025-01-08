import mongoose from 'mongoose';

mongoose
  .connect('mongodb://127.0.0.1:27017/auto-god')
  .then(() => console.log('Connected to the database'))
  .catch((error) =>
    console.log(`Error while connecting to the database ${error}`)
  );
