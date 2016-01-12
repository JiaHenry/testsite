import {
GraphQLObjectType,
GraphQLInt,
GraphQLString,
GraphQLSchema,
graphql
} from 'graphql';

import data from './data.json';
import users from './user.json';

import fs from 'fs';

const profileType = new GraphQLObjectType({
  name: 'Profile',
  fields: {
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString }
  }
});

const userType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLInt },
    email: { type: GraphQLString },
    passwordHash: { type: GraphQLString },
    profile: { type: profileType }
  }
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      user: {
        type: userType,
        args: {
          email: { type: GraphQLString }
        },
        resolve: function (_, args) {
          console.log(users);
          //return users.find(u => u.email === args.email);
          
          let email = args.email;
          
          for(var key in users) {
            let user = users[key];
            if (user.email === email) {
              return user;
            }
          }
          
          return null;
        }
      },
      profile: {
        type: profileType,
        args: {
          id: { type: GraphQLInt }
        },
        resolve: function(_, args) {
          let user = users[args.id];
          
          return user && (user.profile || {}); 
        }
      }
    }
  })
});

let api = {};

function updateUser() {
  fs.writeFile('./server/api/user.json', JSON.stringify(users, null, 2), (err) => {
    if (err) {
      console.log('save user w/ error', err);
    } else {
      console.log('Save user success');
    }
  });
}

api.getUser = function (req, res, cb) {
  var query = `
        query user($id: String)
        {
            user(id: $id) {
                name
                id
            }
        }
    `;

  graphql(schema, query, null, { id: req.params.id }).then(function (result) {
    cb(null, result);
  });
};

api.getUserInfo = function (req, res) {
  let data = req.body,
    query = '{ user(id: "' + data.id + '") {' + data.fields.join(', ') + '}}';

  graphql(schema, query).then(function (result) {
    res.json(result.data.user);
  })

};

api.userLogin = function (req, res) {
  let data = req.body,
    query = '{ user(email: "' + data.email + '") {id, passwordHash}}';

  console.log('userLogin req', data);

  graphql(schema, query).then(function (result) {
    console.log('userLogin res', result);
    
    let user = result.data && result.data.user,
      st = Date.now();

    if (user && user.passwordHash === data.password) {
      res.json({ id: user.id, jwt: user.id + '_' + st });
    } else {
      res.json({ error: 'Wrong email or password' });
    }
  })
};

api.createUser = function (req, res, profile) {

};

api.getProfile = function(req, res) {
  let data = req.body,
    query = '{ profile(id: ' + data.id + ') {'+ data.fields.join(', ')  + '}}';

  console.log('getProfile req', data);

  graphql(schema, query).then(function (result) {
    let data = result.data;

    res.json(data || {error: 'Data not found'})
  });

};

api.updateProfile = function(req, res) {
  let data = req.body,
      user = users[data.id];
  
  console.log('api.updateProfile', data);
  
  if(user && data.profile) {
    let profile = user.profile = user.profile || {};
    
    ['firstName', 'lastName'].forEach((name) => {
      profile[name] = data.profile[name];  
    });
    //profile.firstName = data.profile.firstName;
    //profile.lastName = data.profile.lastName;
    
    updateUser();
    
    res.json('done');  
  } else {
    res.json({error: 'Invalid data'});
  }
  
  
};

export default api;