import Sequelize from "sequelize";
import _ from "lodash";
import Faker from "faker";

'use strict';

// CREATE DATABASE hivedb OWNER hive;
// \c hivedb
// CREATE SCHEMA sales;
// ALTER SCHEMA sales OWNER TO hive;
// SalesDB ect to hive database as user hive password H!veSqlAdm!n
const SalesDB = new Sequelize(
    'hivedb',
    'hive',
    'H!veSqlAdm!n',
    // 'Do you need 2 make DB changes??',
    {
        host: 'localhost',
        // host: 'dev-hivepg-01.ncgc.local',
        dialect: 'postgres'
    }
);

const Pricing = SalesDB.define(
    'pricing',
    {
        scenario: {type: Sequelize.STRING, primaryKey: true, allowNull: false, comment: 'examples: CUSTVOLUME, NFR, RESELLER1, RESELLER2, RESELLER3, ...' },
        discount_table: {type: Sequelize.JSON, allowNull: false, comment: 'discounttable:  array[] start, end, discount'}
    },
    {
        schema: 'sales',
        timestamps: false
    }
);

const Country = SalesDB.define(
    'country',
    {
        iso: {type: Sequelize.STRING(3), primaryKey: true},
        name: {type: Sequelize.STRING, allowNull: false}
    },
    {
        schema: 'sales',
        timestamps: false
    }
);

const Currency = SalesDB.define(
    'currency',
    {
        code: {type: Sequelize.STRING(3), primaryKey: true},
        to_usd: {type: Sequelize.DECIMAL},
        to_jpy: {type: Sequelize.DECIMAL}
    },
    {
        schema: 'sales',
        timestamps: false
    }
);

const Promotion = SalesDB.define(
    'promotion',
    {
        code: {type: Sequelize.STRING, primaryKey: true},
        expiration_date: {type: Sequelize.DATEONLY},
        discount_percent: {type: Sequelize.INTEGER, validation: {min: 0, max: 100}, defaultValue: 0},
        discount_amount: {type: Sequelize.DECIMAL(10,2)},
        product_ids: {type: Sequelize.ARRAY(Sequelize.INTEGER)},
        condition: {type: Sequelize.TEXT},
        active: {type: Sequelize.BOOLEAN, defaultValue: false},
        notes: {type: Sequelize.TEXT},
        locality: {type: Sequelize.ENUM('US', 'JP', 'CN', 'KR', 'IN', 'NA'), defaultValue: 'US'}
    },
    {
        schema: 'sales',
        indexes: [
            {name: 'promotion_expiration_date', fields: ['expiration_date']},
            {name: 'promotion_active', fields: ['active']},
            {name: 'promotion_locality', fields: ['locality']}
        ],
        timestamps: false
    }
);

const CustomerSource = SalesDB.define(
    'customer_source',
    {
        id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
        espresso_source_id: {type: Sequelize.INTEGER},
        source: {type: Sequelize.TEXT}
    },
    {
        schema: 'sales',
        timestamps: false
    }
);

const Account = SalesDB.define(
    'account',
    {
        id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
        main_contact_id: {type: Sequelize.INTEGER},
        company: {type: Sequelize.STRING},
        credit_status: {type: Sequelize.ENUM('NONE', 'APPROVED', 'NA')},
        notes: {type: Sequelize.TEXT},
        locality: {type: Sequelize.ENUM('US', 'JP', 'CN', 'KR', 'IN', 'NA'), defaultValue: 'US'}
    },
    {
        schema: 'sales',
        indexes: [
            {name: 'account_company_name', fields: ['company']},
            {name: 'account_main_contact_id', fields: ['main_contact_id']},
            {name: 'account_locality', fields: ['locality']}
        ],
        timestamps: false
    }
);

const Contact = SalesDB.define(
    'contact',
    {
        id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
        espresso_cid: {type: Sequelize.INTEGER},
        email: {type: Sequelize.TEXT, allowNull: false, unique: true},
        first: {type: Sequelize.TEXT},
        last: {type: Sequelize.TEXT},
        address: {type: Sequelize.TEXT},
        company: {type: Sequelize.TEXT},
        city: {type: Sequelize.TEXT},
        region: {type: Sequelize.TEXT},
        postal_code: {type: Sequelize.TEXT},
        telephone: {type: Sequelize.TEXT},
        type: {type: Sequelize.ENUM('C', 'R', 'O'), defaultValue: 'C'},
        notes: {type: Sequelize.TEXT},
        locality: {type: Sequelize.ENUM('US', 'JP', 'CN', 'KR', 'IN', 'NA'), defaultValue: 'US'}
    },
    {
        schema: 'sales',
        indexes: [
            {name: 'contact_email', fields: ['email']},
            {name: 'contact_company', fields: ['company']},
            {name: 'contact_type', fields: ['type']},
            {name: 'contact_locality', fields: ['locality']},
            {name: 'contact_name', fields: ['first', 'last']},
            {name: 'contact_espresso_cid', fields: ['espresso_cid']}
        ],
        timestamps: false
    }
);

const Product = SalesDB.define(
    'product',
    {
        id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
        espresso_id: {type: Sequelize.INTEGER},
        name: {type: Sequelize.TEXT, unique: true, allowNull: false},
        base_product_id: {type: Sequelize.INTEGER},
        maintenance_months: {type: Sequelize.INTEGER},
        list_price: {type: Sequelize.DECIMAL(10, 2)},
        family: {type: Sequelize.ENUM('AR', 'SP', 'AA', 'GC', 'O', 'PS'), allowNull: false},
        edition: {type: Sequelize.ENUM('STD', 'PRO', 'STE', 'SRV', 'NA'), allowNull: false},
        platform: {type: Sequelize.ENUM('NET', 'XAML', 'ASP','WFM', 'COM', 'JS', 'MIX', 'NA', 'SRV'), allowNull: false},
        version: {type: Sequelize.TEXT, allowNull: false},
        license_type: {type: Sequelize.ENUM('DEV', 'SITE', 'OEM', 'BASE', 'OTHER'), allowNull: false, defaultValue: 'DEV'},
        bundle: {type: Sequelize.JSON},
        is_upgrade: {type: Sequelize.INTEGER},
        is_renewal: {type: Sequelize.INTEGER},
        is_registerable: {type: Sequelize.INTEGER},
        is_support: {type: Sequelize.INTEGER},
        start_date: {type: Sequelize.DATEONLY, defaultValue: Sequelize.NOW},
        discontinue_date: {type: Sequelize.DATEONLY},
        sn_validation_url: {type: Sequelize.TEXT},
        sn_generator_url: {type: Sequelize.TEXT},
        notes: {type: Sequelize.TEXT},
        locality: {type: Sequelize.ENUM('US', 'JP', 'CN', 'KR', 'IN', 'NA'), defaultValue: 'US'}
    },
    {
        schema: 'sales',
        indexes: [
            {name: 'product_name', fields: ['name']},
            {name: 'product_base_product_id', fields: ['base_product_id']},
            {name: 'product_locality', fields: ['locality']},
            {name: 'product_start_date', fields: ['start_date']},
            {name: 'product_discontinue_date', fields: ['discontinue_date']},
            {name: 'product_family', fields: ['family']},
            {name: 'product_platform', fields: ['platform']}
        ],
        timestamps: false
    }
);

const Order = SalesDB.define(
    'order',
    {
        id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
        order_date: {type: Sequelize.DATEONLY, defaultValue: Sequelize.NOW},
        ship_date: {type: Sequelize.DATEONLY},
        pay_method: {type: Sequelize.ENUM('CC', 'PO', 'WIRE', 'NA', 'OTHER'), defaultValue: 'CC'},
        po_number: {type: Sequelize.TEXT},
        // add encryption
        cc_number: {type: Sequelize.TEXT, validate: {isCreditCard: true}},
        cc_security_code: {type: Sequelize.INTEGER, validate: {max: 9999}},
        cc_expire_month: {type: Sequelize.INTEGER, validate: {min: 1, max: 12}},
        cc_expire_year: {type: Sequelize.INTEGER, validate: {min: 2016, max: 2099}},
        cc_name: {type: Sequelize.TEXT},
        cc_address: {type: Sequelize.TEXT},
        cc_city: {type: Sequelize.TEXT},
        cc_region: {type: Sequelize.TEXT},
        cc_country_iso: {type: Sequelize.STRING(3)},
        cc_postal_code: {type: Sequelize.TEXT},
        cc_authorization_code: {type: Sequelize.TEXT},
        cc_authorization_date: {type: Sequelize.DATE},
        status: {type: Sequelize.ENUM('PMTHOLD', 'INFOHOLD', 'PAID', 'SHIP', 'INPROCESS', 'COMPLETE', 'NA')},
        subtotal: {type: Sequelize.DECIMAL(10,2)},
        sales_tax: {type: Sequelize.DECIMAL(10,2)},
        amount_paid: {type: Sequelize.DECIMAL(10,2)},
        amount_due: {type: Sequelize.DECIMAL(10,2)},
        shipping_charges: {type: Sequelize.DECIMAL(10,2)},
        transaction_fees: {type: Sequelize.DECIMAL(10,2)},
        notes: {type: Sequelize.TEXT},
        locality: {type: Sequelize.ENUM('US', 'JP', 'CN', 'KR', 'IN', 'NA'), defaultValue: 'US'},
        type: {type: Sequelize.ENUM('O', 'I', 'Q'), defaultValue: 'O'},
    },
    {
        schema: 'sales',
        indexes: [
            {name: 'order_status', fields: ['status']},
            {name: 'order_order_date', fields: ['order_date']},
            {name: 'order_locality', fields: ['locality']},
            {name: 'order_type', fields: ['type']}
        ],
        timestamps: false
    }
);

const OrderItem = SalesDB.define(
    'order_item',
    {
        id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
        quantity: {type: Sequelize.INTEGER, allowNull: false, validation: {min: 1}},
        price: {type: Sequelize.DECIMAL(10,2), allowNull: false},
        discount: {type: Sequelize.DECIMAL(10, 2)}
    },
    {
        schema: 'sales',
        timestamps: false
    }
);

const ProductKey = SalesDB.define(
    'productkey',
    {
        key: {type: Sequelize.TEXT, primaryKey: true},
        email: {type: Sequelize.TEXT, allowNull: false},
        registered: {type: Sequelize.DATEONLY},
        revoked: {type: Sequelize.BOOLEAN},
        notes: {type: Sequelize.TEXT},
        locality: {type: Sequelize.ENUM('US', 'JP', 'CN', 'KR', 'IN', 'NA'), defaultValue: 'US'}
    },
    {
        schema: 'sales',
        indexes: [
            {name: 'productkey_email', fields: ['email']},
            {name: 'productkey_locality', fields: ['locality']}
        ],
        timestamps: false
    }
);

const Maintenance = SalesDB.define(
    'maintenance',
    {
        id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
        start_date: {type: Sequelize.DATEONLY},
        end_date: {type: Sequelize.DATEONLY},
        locality: {type: Sequelize.ENUM('US', 'JP', 'CN', 'KR', 'IN', 'NA'), defaultValue: 'US'}
    },
    {
        schema: 'sales',
        indexes: [
            {name: 'maintenance_date', fields: ['start_date', 'end_date']},
            {name: 'maintenance_locality', fields: ['locality']}
        ],
        timestamps: false
    }
);

const Cart = SalesDB.define(
    'cart',
    {
        uuid: {type: Sequelize.UUID, primaryKey: true},
        email: {type: Sequelize.TEXT},
        content: {type: Sequelize.JSON}
    },
    {
        schema: 'sales',
        timestamps: false
    }
);

const DateKey = SalesDB.define(
    'date_key',
    {
        key: {type: Sequelize.DATEONLY, allowNull: false, primaryKey: true},
        us_holiday: {type: Sequelize.TEXT},
        jp_holiday: {type: Sequelize.TEXT},
        in_holiday: {type: Sequelize.TEXT},
        cn_holiday: {type: Sequelize.TEXT},
        kr_holiday: {type: Sequelize.TEXT},
        fiscal_year: {type: Sequelize.INTEGER, validate: {min: 1990, max: 2050}},
        fiscal_quarter: {type: Sequelize.INTEGER, validate: {min: 1, max: 4}},
        month: {type: Sequelize.INTEGER, validate: {min: 1, max: 12}},
        year: {type: Sequelize.INTEGER, validate: {min: 1990, max: 2050}}
    },
    {
        schema: 'sales',
        indexes: [
            {name: 'datekey_fiscal_year', fields: ['fiscal_year', 'fiscal_quarter', 'month']}
        ],
        timestamps: false
    }
);

Account.hasOne(Account, {foreignKey: 'parent_id'});

Order.hasMany(OrderItem, {foreignKey: 'order_id'});
Product.hasMany(OrderItem, {foreignKey: 'product_id'});
Promotion.hasMany(OrderItem, {foreignKey: 'promo_code'});
Currency.hasMany(OrderItem, {foreignKey: 'currency_code'});

Maintenance.belongsTo(Product, {foreignKey: 'product_id'});
Maintenance.belongsTo(ProductKey, {foreignKey: 'product_key'});
Maintenance.belongsTo(Order, {foreignKey: 'order_id'});

Product.hasMany(ProductKey, {foreignKey: 'product_id'});
Order.hasMany(ProductKey, {foreignKey: 'order_id'});
Order.hasMany(ProductKey, {foreignKey: 'upgrade_order_id'});

// Product.hasMany(Product, {foreignKey: 'base_product_id'});
Currency.hasMany(Product, {foreignKey: 'currency_code'});

Contact.hasMany(Order, {foreignKey: 'billto_id'});
Contact.hasMany(Order, {foreignKey: 'shipto_id'});
Promotion.hasMany(Order, {foreignKey: 'promo_code'});
Currency.hasMany(Order, {foreignKey: 'currency_code'});

Account.hasMany(Contact, {foreignKey: 'account_id'});
Country.hasMany(Contact, {foreignKey: 'country_iso'});
Pricing.hasMany(Contact, {foreignKey: 'price_scenario'});
Contact.hasOne(Contact, {foreignKey: 'billto_id'});
CustomerSource.hasMany(Contact, {foreignKey: 'source_id'});


// create database tables if they do not exist.
// the database and schema have to be created beforehand.
SalesDB.sync().then(() => {
    // based on annual budget planning rate
     Currency.create({code: 'USD', to_usd: 1.0, to_jpy: 125.0}).then(function(task) {task.save();});
     Currency.create({code: 'JPY', to_usd: 0.008, to_jpy: 1.0}).then(function(task) {task.save();});
     Currency.create({code: 'INR', to_usd: 0.01576, to_jpy: 1.97}).then(function(task) {task.save();});
     Currency.create({code: 'KRW', to_usd: 0.0009, to_jpy: 0.113}).then(function(task) {task.save();});
     Currency.create({code: 'CNY', to_usd: 0.16, to_jpy: 20.0}).then(function(task) {task.save();});

     Country.create({iso: 'USA', name: 'United States of America'}).then(function(task) {task.save();});
     Country.create({iso: 'GBR', name: 'United Kingdom'}).then(function(task) {task.save();});
     Country.create({iso: 'DEU', name: 'Germany'}).then(function(task) {task.save();});
     Country.create({iso: 'JPN', name: 'Japan'}).then(function(task) {task.save();});
     Country.create({iso: 'CHN', name: 'China'}).then(function(task) {task.save();});
     Country.create({iso: 'KOR', name: 'Korea, Republic of'}).then(function(task) {task.save();});
     Country.create({iso: 'IND', name: 'India'}).then(function(task) {task.save();});

    console.log("done!");
});


export default SalesDB;
