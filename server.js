const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();


app.use(cors());
app.use(express.json());


// 
const PORT=process.env.PORT || 5000
const DB_URI=process.env.DB_URI



app.use('/', require('./routes/router'));


const Main = async () => {
  try {
    await mongoose.connect(DB_URI);


    app.listen(PORT, async () => {

      console.log(`server started ON ${PORT}`)
    });
  } catch (error) {
    console.log(error);
  }
};

Main();

