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

import SalesSchema from '../SalesSchema';
import AccountsSchema from '../AccountsSchema';

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
      user: addUser(
        email: "` + data.email + `",
        password: "` + data.password + `",
        username: "` + data.extra.username + `") {
          id
        }
      }`;

  console.log('createUser req', data);
  
  graphql(AccountsSchema, query).then(function (result) {
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

function convertContactToUI(contact) {
  return {
    firstName: contact.first,
    lastName: contact.last,
    company: contact.company,
    address: contact.address,
    city: contact.city,
    state: contact.region,
    postal: contact.postal_code,
    country: contact.country_iso,
    telephone: contact.telephone,
    email: contact.email 
  };
}

function convertContactFromUI(data, id, billto_id) {
    let contact = {
        company: data.company,
        email: data.email,
        first: data.firstName,
        last: data.lastName,
        city: data.city,
        region: data.state,
        telephone: data.telephone,
        postal_code: data.postal,
        country_iso: data.country
    };
    
    if (id) { 
        contact.id = id;
        if (billto_id) {
            contact.billto_id = billto_id;
        } 
    }

    let result = [];
    for(var key in contact) {
        let value = contact[key];
        
        if (value) {
            result.push(key + ': "' + value + '"');
        }
    }
    //if (billto_id == null) {
    //    result.push("billto_id: null");
    //}
    console.log('convertContactFromUI', result);
        
    return result.join(", ");
}


api.getProfile = function (req, res) {
    let data = req.body,
        query = '{ contacts: contacts(email: "' + data.email.toLowerCase() + '") { first, last, company, address, city, region, postal_code, country_iso, telephone, email }}';

        console.log('getprofile query', query);
        
    graphql(SalesSchema, query).then(function (result) {
        let data = result.data,
            contacts = data.contacts,
            response = {shipto: {}, sameBillto: true, billto: {}};

        console.log("getProfile result", contacts);

        if (contacts && contacts.length) {
            let count = contacts.length,
                shipto = contacts[0];

            response.shipto = convertContactToUI(shipto);
            response.sameBillto = count == 1;
            if (count > 1) {
                let billto = contacts[1]; // .find(item => { return item.id == shipto.billto_id; });

                if (billto) {
                    response.billto = convertContactToUI(billto);
                }
            }
        }
        res.json(response);
    });
    /*.error(d => {
        console.log('getProfile error', d);
        res.json({ error: d });
    });
    */
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
        email = data.email,
        sameBillto = data.sameBillto,
        contactData = data.contacts,
        query = `{ contacts(email: "` + email + `", withBillto: true) { id, billto_id } }`;  
    
  //console.log('updateContact query', query);
  
    contactData.shipto.email = email;
  
  graphql(SalesSchema, query).then(function (result) {
      console.log("updateContact res", result.data.contacts);
      
    var contacts = result.data.contacts || [],
        contact = contacts[0],
        newContact = contact == null;
    
    console.log('update step 1 new? ', newContact);
    
    if(newContact) {
        console.log('prepare query ...');
        
        query = `mutation addContact { contact: addContact(`
            + convertContactFromUI(contactData.shipto) +
            `) { id } }`;
            
            console.log("addContact primary", query);
            
            graphql(SalesSchema, query).then(function (result) {
                contact = result.data.contact;
                console.log("addContact result:", result.data || result.errors.message); // contact);
            });
    }
    
    console.log('after add contact primary');
    
        let billto_id = contact.billto_id,
            billto = contacts[1];
        
        if (!sameBillto) {
        if (!billto) {
            query = `mutation addContact { contact: addContact(`
            + convertContactFromUI(contactData.billto) +
            `) { id } }`;
            
            console.log("addContact billto", query);
            
            graphql(SalesSchema, query).then(function (result) {
                billto_id = result.data.contact.id;
                console.log('add billto result id:', billto_id);
            });        
        } else {
            query = `mutation updateContact { 
                    contact: updateContact(` 
                + convertContactFromUI(contactData.billto, billto.id) + 
                `) { id } }`;
                
            console.log("updateContact billto", query);
            
            graphql(SalesSchema, query).then(function (result) {
                console.log("update contact - billto Done!");
            });    
        }
        } else {
            if (billto_id) {
                // remove old billto contact record
                query = `mutation removeContact { contact: removeContact(id: ` + billto_id + `) { id }`;
                graphql(SalesSchema, query).then(function (result) {
                    console.log("contact removed:", result.contact && result.contact.id );
                });    
                
                billto_id = null;
            }
        }
        
        query = `mutation updateContact { 
                    contact: updateContact(` 
                + convertContactFromUI(newContact ?  {} : contactData.shipto, contact.id, billto_id) + 
                `) { id } }`;
                
        console.log("updateContact primary 2", query);
                    
        graphql(SalesSchema, query).then(function (result) {
            res.json({success: "update contact Done!"});
            if (billto_id != result.billto_id) {
                console.log('diff billto_id');
                result.update({billto_id: billto_id});
            }
        });
    
    console.log('updateContact res', result);

    //res.json(result);
  })
};

api.checkEmail = function (req, res) {
  let data = req.body,
      query = '{ users(email: "' + data.email.toLowerCase() + '") {id}}';

      console.log("checkEmail", query);
      
  graphql(AccountsSchema, query).then(function (result) {
    let user = result.data && result.data.users && result.data.users[0];

    console.log("checkEmail result:", user);
    res.json(user);
  });
};

export default api;
