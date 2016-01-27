import Sequelize from "sequelize";
import { connectionString } from '../dbconfig';

'use strict';

const AccountsDB = new Sequelize(connectionString);

const Users = AccountsDB.define(
    'users',
    {
        id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
        email: {type: Sequelize.TEXT, allowNull: false, unique: true, validate: {isEmail: true}},
        unsubscribe: {type: Sequelize.BOOLEAN},
        is_bounce: {type: Sequelize.BOOLEAN},
        display_name: {type: Sequelize.TEXT, allowNull: false, unique: true},
        permissions: {type: Sequelize.TEXT},
        notes: {type: Sequelize.TEXT},
        is_login : {type: Sequelize.BOOLEAN},
        password_hash: {type: Sequelize.TEXT}
    },
    {
        schema: 'accounts',
        indexes: [
            {name: 'user_email', fields: ['email']},
            {name: 'user_unsubscribe', fields: ['unsubscribe']},
            {name: 'user_display_name', fields: ['display_name']}
        ],
        timestamps: false
    }
);

AccountsDB.sync().then(() => {
  console.log("AccountsDB.sync done!");
});
export default AccountsDB;