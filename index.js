require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongo = require('mongodb');
const shortId = require('shortid');
const validUrl = require("Valid-Url");
const bodyParser = require('body-parser');

try {
  mongoose = require("mongoose");
} catch (e) {
  console.log(e);
}
const uri = process.env.MONGO_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000//timeout after 5s 
});


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// definim modelul pe care o sa il ia in baza de date url-ul nostru
//url-uniform resource locator
const Schema = mongoose.Schema;//pentru a nu repeta mongoose.Schema l-am definit ca fiind Schema
const urlSchema = new Schema({  //definim un nou model de schema numita url Schema
  original_url: String,       //parametru 1 schema
  short_url: String          //parametru 2 schema 
})
const urlModel = mongoose.model("URL", urlSchema); //definim o baza de date dupa shema urlSchema avand numele "URL"
app.post("/api/shorturl/new", async (req, res) => {
  let url = req.body.url_input;
  let urlCode = shortId.generate();
  let truthy = 1;
  try {
    const { original_url } = await urlModel.findOne({ original_url: url });
    console.log(truthy)
  }
  catch (exception_var) {
    truthy = 0;
    console.log(truthy);
  }
  if (validUrl.isWebUri(url) && truthy == 0) {
    let url1 = new urlModel({ original_url: url, short_url: urlCode });
    url1.save();
    res.json({ urlCode, url });
  }
  else {
    if (truthy == 1) {
      res.json({ error: "aready in the DB" });
    }
    else {
      res.json({ error: "invalid url" });
    }

  }
});

app.get("/api/shorturl/:urlCode?", async (req, res) => {// se pune cand se foloseste await in body 
  let urlCode = req.params.urlCode;
  const { original_url } = await urlModel.findOne({ short_url: urlCode });//await asteapta raspuns de la baza de date
  res.redirect(original_url)

});