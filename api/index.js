const express= require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 3000;
const submitRouter = require('./routes/submit');
const client = require('./queue/redisClient');
const statusRoute = require('./routes/status');


app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json())

app.use('/submit', submitRouter);



client.ping().then(console.log);  


app.listen(port)
