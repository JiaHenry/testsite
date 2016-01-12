import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

import api from './server/api/api';

let app = express();

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(express.static(path.join(__dirname, 'client', 'public')));

app.post('/userLogin', api.userLogin);
app.post('/createUser', api.createUser);
app.post('/getProfile', api.getProfile);
app.post('/updateProfile', api.updateProfile);
app.post('/getUser', api.getUserInfo);

app.get('*', function (request, response){
  response.sendFile(path.resolve(__dirname, 'client/public', 'index.html'))
})

app.listen(9000, () => console.log("Server started. Ready go."));