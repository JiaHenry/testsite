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

import SalesSchema from '../db/SalesSchema';
import AccountsSchema from '../db/AccountsSchema';

let api = {};

function getHashString(src) {
    // TODO, creat hash string for src string 
    return encode(src);
}

function encode(str) {
    return new Buffer(str).toString('base64');
}

function decode(str) {
    return new Buffer(str, 'base64').toString();
}

api.userLogin = function (req, res) {
    let data = req.body,
        query = '{ users(email: "' + data.email.toLowerCase() + '") {id, password_hash}}';

    graphql(AccountsSchema, query).then(function (result) {
        let user = result.data && result.data.users && result.data.users[0],
            st = Date.now();
            
        if (user && user.password_hash === getHashString(data.password)) {
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
        password: "` + getHashString(data.password) + `",
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
    for (var key in contact) {
        let value = contact[key];

        // for string type only, need speical process items with type int / boolean which value dont need enclosed in "" 
        if (value) {
            result.push(key + ': "' + value + '"');
        }
    }

    return result.join(", ");
}


api.getContacts = function (req, res) {
    let data = req.body,
        query = '{ contacts: contacts(email: "' + data.email.toLowerCase() + 
        '") { ...ContactItems, billto { ...ContactItems } } }' +
        'fragment ContactItems on contact { id, email, first, last, company, address, city, region, postal_code, country_iso, telephone }';

        console.log("get contact query", query);

    graphql(SalesSchema, query).then(function (result) {
        let data = result.data,
            contact = data.contacts && data.contacts[0],
            response = { shipto: {}, sameBillto: true, billto: {} };

        console.log("getContacts result", contact);

        if (contact) {
            response.shipto = convertContactToUI(contact);
            if(contact.billto) {
                response.sameBillto = false;    
                response.billto = convertContactToUI(contact.billto);
            }
        }
        res.json(response);
    });
};

api.updateContacts = function (req, res) {
    let data = req.body,
        email = data.email.toLowerCase(),
        contactData = data.contacts,
        sameBillto = contactData.sameBillto === "true", // need check as string
        query = `{ contacts(email: "` + email + `") { id, billto_id } }`;

        console.log("updateContacts req", data);
        console.log("sameBillto 1 ? ", sameBillto);
        
    contactData.shipto.email = email;
try{
    graphql(SalesSchema, query).then((result) => {
        console.log("updateContact res", result.data.contacts);

        var contacts = result.data.contacts || [],
            contact = contacts[0],
            id,
            billto_id,
            ignoreBillto,
            items = [],
            newContact = contact == null;
            
        console.log('update step 1 new? ', newContact);

        if (newContact) {
            console.log('prepare query ...');
            items.push(`primary: addContact(` + convertContactFromUI(contactData.shipto) + `) { id }`);
        } else {
            id = contact.id;
            billto_id = contact.billto_id;
        }

        console.log("sameBillto?", sameBillto);
        console.log("items 1", items);
        console.log("billto_id? ", billto_id);
        
        if (!sameBillto) {
            console.log("billto_id 2? ", billto_id);
            if (!billto_id) {
                items.push(`billto: addContact(` + convertContactFromUI(contactData.billto) + `) { id }`);
            } else {
                items.push(`billto : updateContact(` + convertContactFromUI(contactData.billto, billto_id) + `) { id } `);
            }
            console.log("items 2", items);
        } else {
            if (billto_id) {
                // remove old billto contact record, and update billto_id refer in main contact
                items.push(`billto: removeContact(id: ` + billto_id + `, main_id: ` + id + `) { id }`);
                
                // set flag to ignore
                ignoreBillto = true;
            }
            console.log("items 3", items);
        }
        
        console.log("items 4", items);

        query = `mutation updateContact {` + items.join(', ') + `}`;
        console.log('update contacts query-1:', query);

        graphql(SalesSchema, query).then((result) => {
            let errors = result.errors;

            if (errors) {
                res.json({ error: 'update contact step-1: ' + errors.message });
                return;
            }

            let data = result.data;
            
            if (newContact) {
                id =  data.primary.id;
            }
            
            billto_id = ignoreBillto ? null : data.billto && data.billto.id;

            query = `mutation updateContact { contact: updateContact(` +
                    convertContactFromUI(newContact ? {} : contactData.shipto, id, billto_id) +
                    `) { id, billto_id } }`;

            console.log("update contacts query-2", query);

            graphql(SalesSchema, query).then(function (result) {
                let errors = result.errors;

                if (errors) {
                    res.json({ error: 'update contact step-2: ' + errors.message });
                    return;
                }

                res.json(result.data.contact);
            });
        });
    });
}
catch(e) {
    console.log("update contact w/ exception", e);
}
};

api.checkEmail = function (req, res) {
    let data = req.body,
        query = '{ user: users(email: "' + data.email.toLowerCase() + '") {id}}';

    console.log("checkEmail", query);

    graphql(AccountsSchema, query).then(function (result) {
        let user = result.data && result.data.user && result.data.user[0];

        console.log("checkEmail result:", user);
        res.json(user);
    });
};

export default api;
