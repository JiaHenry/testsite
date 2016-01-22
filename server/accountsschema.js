import {
    GraphQLObjectType,
    GraphQLString,
    GraphQLFloat,
    GraphQLInt,
    GraphQLBoolean,
    GraphQLList,
    GraphQLID,
    GraphQLNonNull,
    GraphQLSchema
} from 'graphql';
import AccountsDB from './accountsdb';

'use strict';

const User = new GraphQLObjectType({
    name: 'user',
    description: 'User records',
    fields: () => {
        return {
            id: {type: GraphQLID, resolve(user) {return user.id; }},
            email: {type: GraphQLString, resolve(user) {return user.email; }},
            unsubscribe: {type: GraphQLBoolean, resolve(user) {return user.unsubscribe; }},
            is_bounce: {type: GraphQLBoolean, resolve(user) {return user.is_bounce; }},
            display_name: {type: GraphQLString, resolve(user) {return user.display_name; }},
            permissions: {type: GraphQLString, resolve(user) {return user.permissions; }},
            notes: {type: GraphQLString, resolve(user) {return user.notes; }},
            is_login: {type: GraphQLBoolean, resolve(user) {return user.is_login;} },
            password_hash: {type: GraphQLString, resolve(user) {return user.password_hash; }},
        }
    }
});

const AccountsQuery = new GraphQLObjectType({
    name: 'AccountsQuery',
    description: 'Query Accounts DB Model',
    fields: () => {
        return {
         users: {
                type: new GraphQLList(User),
                args: {
                    id: {type: GraphQLID},
                    email: {type: GraphQLString},
                    unsubscribe: {type: GraphQLBoolean},
                    is_bounce: {type: GraphQLBoolean},
                    display_name: {type: GraphQLString},
                    is_login: {type: GraphQLBoolean}
                },
                resolve(root, args) {
                    return AccountsDB.models.users.findAll({where: args});
                }
            } 
        }
    }
});

const AccountsMutation = new GraphQLObjectType({
    name: 'AccountsMutation',
    description: 'calls to modify the database',
    fields() {
        return {
          addUser: {
            type: User,
            args: {
              email: { type: GraphQLString },
              username: { type: GraphQLString },
              password: { type: GraphQLString },
              permissions: { type: GraphQLString },
              notes: { type: GraphQLString }
            },
            resolve(_, args) {
              return AccountsDB.models.users.create({
                email: args.email.toLowerCase(),
                display_name: args.username,
                password_hash: args.password,
                permissions: args.permissions,
                notes: args.notes
              });
            }
          }
        }
    }
});

const AccountsSchema = new GraphQLSchema({
    query: AccountsQuery,
    mutation: AccountsMutation
});

export default AccountsSchema;

        