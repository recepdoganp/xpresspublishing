const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const errorHandler = require('errorhandler');
const app = express();
const PORT = process.env.PORT || 4000;

const apiRouter = require('./api/api');
app.use(bodyParser.json());
app.use(errorHandler());
app.use(cors())
app.use(morgan('tiny'));
app.use('/api',apiRouter);
app.use(errorHandler());


app.listen(PORT,()=>{
  console.log(`Listenin on PORT: ${PORT}`);
})

module.exports = app;