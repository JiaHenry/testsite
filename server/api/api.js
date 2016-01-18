import {
GraphQLObjectType,
GraphQLInputObjectType,
GraphQLNonNull,
GraphQLInt,
GraphQLString,
GraphQLBoolean,
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

const contactType = new GraphQLObjectType({
  name: 'Contact',
  fields: {
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    company: { type: GraphQLString },
    address1: { type: GraphQLString },
    address2: { type: GraphQLString },
    city: { type: GraphQLString },
    state: { type: GraphQLString },
    postal: { type: GraphQLString },
    country: { type: GraphQLString },
    telephone: { type: GraphQLString }    
  }
});  

const billToContactType = new GraphQLObjectType({
  name: 'BillToContact',
  fields: {
    email: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    company: { type: GraphQLString },
    address1: { type: GraphQLString },
    address2: { type: GraphQLString },
    city: { type: GraphQLString },
    state: { type: GraphQLString },
    postal: { type: GraphQLString },
    country: { type: GraphQLString },
    telephone: { type: GraphQLString }    
  }
});

const customContactType = new GraphQLObjectType({
  name: 'Contacts',
  fields: {
    shipto: { type: contactType },
    sameBillto: { type: GraphQLBoolean, default: true },
    billto: { type: billToContactType },
    id: {type: GraphQLInt}
  }
});

const userType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: { type: GraphQLInt },
    email: { type: GraphQLString },
    passwordHash: { type: GraphQLString },
    userName: { type: GraphQLString },
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
        resolve: function (_, {email}) {
          for (var key in users) {
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
        resolve: function (_, {id}) {
          let user = users[id];

          return user && (user.profile || {});
        }
      },
      contact: {
        type: customContactType,
        args: {
          id: { type: GraphQLInt }
        },
        resolve: function(_, {id}) {
          let user = users[id],
              result = {shipto: {}, sameBillto: true, billto: {}};
              
          if (user) {
            let contact = user.contact || {sameBillto: true};
            if (contact.shipto) result.shipto = contact.shipto;
            if (contact.billto) result.billto = contact.billto;
            result.sameBillto = contact.sameBillto ? true : false;
          }
          
          result.id = id;
          
          return result;
        }
      }
    }
  }),
  mutation: new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
      createUser: {
        type: userType,
        description: 'Create an new user with provide data',
        args: {
          email: { type: new GraphQLNonNull(GraphQLString) },
          password: { type: new GraphQLNonNull(GraphQLString) },
          username: {type: GraphQLString }
        },
        resolve: function(_, {email, password, username}) {
          let user = {};
          user.email = email;
          user.passwordHash = password;
          user.userName = username; 
          
          let id = users["__id"] || 1;
          while(users[id]) {
            id++;
          }
          user.id = id;
          users["__id"] = id;
          
          console.log("user created", user);
          
          users[id] = user;
   
          updateUser();
          
          return user;
        }
      },
      updateContact: {
        type: userType,
        description: 'update contact information',
        args: {
          id: { type: GraphQLInt },
          data: { type: GraphQLString }
        },
        resolve: function(_, {id, data}) {
          let user = users[id],
              contacts = JSON.parse(decode(data)),
              shipto = contacts && contacts.shipto,
              billto = contacts && contacts.billto;
              
              console.log("updateContact", contacts);
          
          if (user) {
            user.contact = {
              shipto: shipto || {},
              billto: billto || {},
              sameBillto: contacts.sameBillto
            };
            
            updateUser();
            
            return user;
          } else {
            return null;
          }
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

api.createUser = function (req, res) {
  let data = req.body,
    query = `mutation createUser { 
      user: createUser(
        email: "` + data.email + `",
        password: "` + data.password + `",
        username: "` + data.extra.username + `") {
          id
        }
      }`;

  console.log('createUser req', data);
  
  graphql(schema, query).then(function (result) {
    console.log('createUser res', result);

    let user = result.data && result.data.user,
      st = Date.now();

    if (user) {
      res.json({ id: user.id, jwt: user.id + '_' + st });
    } else {
      res.json({ error: 'create user failed: ' + JSON.stringify(result) });
    }
  })
};

api.getProfile = function (req, res) {
  let data = req.body,
    query = '{ contact: contact(id: ' + data.id + ') {' + data.fields.join(', ') + '}}';

  graphql(schema, query).then(function (result) {
    let data = result.data;
    
    res.json(data && data.contact || { error: 'Data not found' })
  });

};

api.updateProfile = function (req, res) {
  let data = req.body,
    user = users[data.id];

  console.log('api.updateProfile', data);

  if (user && data.profile) {
    let profile = user.profile = user.profile || {};

    ['firstName', 'lastName'].forEach((name) => {
      profile[name] = data.profile[name];
    });
    //profile.firstName = data.profile.firstName;
    //profile.lastName = data.profile.lastName;
    
    updateUser();

    res.json('done');
  } else {
    res.json({ error: 'Invalid data' });
  }
};

api.updateContact = function(req, res) {
  let data = req.body,
    query = `mutation updateContact { 
      contact: updateContact(
        id: ` + data.id + `,
        data: "` + encode(JSON.stringify(data.contacts)) + `") {
          id
        }
      }`;

  console.log('updateContact req', data);
  console.log('updateContact query', query);
  
  graphql(schema, query).then(function (result) {
    console.log('updateContact res', result);

    res.json(result);
  })
};

api.checkEmail = function (req, res) {
  let data = req.body,
      query = '{ user(email: "' + data.email + '") {id}}';

  graphql(schema, query).then(function (result) {
    let user = result.data && result.data.user

    res.json(user);
  });
};


function encode(str) {
  return new Buffer(str).toString('base64');
}

function decode(str) {
  return new Buffer(str, 'base64').toString('utf8');
}

export default api;
