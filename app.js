import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import webpack from 'webpack';
import config from './webpack.config.js';

import api from './server/api/api';

import GraphHTTP from 'express-graphql';
import SalesSchema from './server/salesschema';

let app = express();

var isProduction = process.env.NODE_ENV === 'production';

const compiler = webpack(config);

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(express.static(path.join(__dirname, 'client', 'public')));

if (!isProduction) {
  var httpProxy = require('http-proxy');

  var proxy = httpProxy.createProxyServer(
    {
      changeOrigin: true  // when will proxy outside localhost
    });

  // We require the bundler inside the if block because
  // it is only needed in a development environment. Later
  // you will see why this is a good idea
  var bundle = require('./server/bundle.js');
  bundle();

  // Any requests to localhost:***/build is proxied
  // to webpack-dev-server
  app.all('/build/*', function (req, res) {
    proxy.web(req, res, {
      target: 'http://localhost:8081'
    });
  });
  
  // It is important to catch any errors from the proxy or the
  // server will crash. An example of this is connecting to the
  // server when webpack is bundling
  proxy.on('error', function (e) {
    console.log('Could not connect to proxy, please try again...');
  });
}


app.post('/checkEmail', api.checkEmail);
app.post('/userLogin', api.userLogin);
app.post('/createUser', api.createUser);
app.post('/getProfile', api.getProfile);
app.post('/updateContact', api.updateContact);
app.post('/getProfile', api.getProfile);
app.post('/updateProfile', api.updateProfile);
app.post('/getUser', api.getUserInfo);

app.use('/graphql', GraphHTTP({
        schema: SalesSchema,
        pretty: true,
        graphiql: true
    }));


app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, 'client/public', 'index.html'))
})

app.listen(8080, () => console.log("Server started. Ready go."));