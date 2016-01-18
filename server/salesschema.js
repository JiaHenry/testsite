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
import SalesDB from './salesdb';

'use strict';

const Country = new GraphQLObjectType({
    name: 'country',
    description: 'Represents an offical country code and name',
    fields: () => {
        return {
            iso: { type: GraphQLID, resolve(country) { return country.iso; } },
            name: { type: GraphQLString, resolve(country) { return country.name; } }
        }
    }
});

const Currency = new GraphQLObjectType({
    name: 'currency',
    description: 'Represents currencies used in the system and conversion rates',
    fields: () => {
        return {
            code: { type: new GraphQLNonNull(GraphQLID), resolve(currency) { return currency.code; } },
            to_usd: { type: new GraphQLNonNull(GraphQLFloat), resolve(currency) { return currency.to_usd; } },
            to_jpy: { type: new GraphQLNonNull(GraphQLFloat), resolve(currency) { return currency.to_jpy; } }
        }
    }
});

const Pricing = new GraphQLObjectType({
    name: 'pricing',
    description: 'Represents a list of pricing and discount scenarios',
    fields: () => { return {
        scenario: {type: new GraphQLNonNull(GraphQLString), resolve(pricing) {return pricing.scenario; }},
        discount_table: {type: new GraphQLNonNull(GraphQLString), resolve(pricing) {return pricing.discount_table}}
    }}
});

const Promotion = new GraphQLObjectType({
    name: 'promotion',
    description: 'Represents promotion codes for discounts',
    fields: () => {
        return {
            code: { type: new GraphQLNonNull(GraphQLString), resolve(promotion) { return promotion.code; } },
            expiration_date: { type: GraphQLString, resolve(promotion) { return promotion.expiration_date; } },
            discount_percent: { type: GraphQLInt, resolve(promotion) { return promotion.discount_percent; } },
            discount_amount: { type: GraphQLFloat, resolve(promotion) { return promotion.discount_amount; } },
            // missing product ids array
            condition: { type: GraphQLString, resolve(promotion) { return promotion.condition; } },
            active: { type: GraphQLBoolean, resolve(promotion) { return promotion.active; } },
            locality: { type: GraphQLString, resolve(promotion) { return promotion.locality; } },
            notes: { type: GraphQLString, resolve(promotion) { return promotion.notes; } }
        }
    }
});

const Product = new GraphQLObjectType({
    name: 'product',
    description: 'Represents product catalog',
    fields: () => {
        return {
            id: { type: GraphQLID, resolve(product) { return product.id; }},
            name: { type: new GraphQLNonNull(GraphQLString), resolve(product) { return product.name; }},
            maintenance_months: { type: GraphQLInt, resolve(product) { return product.maintenance_months; }},
            list_price: { type: new GraphQLNonNull(GraphQLFloat), resolve(product) { return product.list_price; }},
            family: {type: new GraphQLNonNull(GraphQLString), resolve(product) {return product.family;}},
            edition: {type: new GraphQLNonNull(GraphQLString), resolve(product) {return product.edition;}},
            version: {type: new GraphQLNonNull(GraphQLString), resolve(product) {return product.verion;}},
            platform: {type: new GraphQLNonNull(GraphQLString), resolve(product) {return product.platform;}},
            license_type: {type: new GraphQLNonNull(GraphQLString), resolve(product) {return product.license_type;}},
            locality: {type: new GraphQLNonNull(GraphQLString), resolve(product) {return product.locality;}},
            sn_validation_url: {type: GraphQLString, resolve(product) {return product.sn_validation_url;}},
            sn_generator_url: {type: GraphQLString, resolve(product) {return product.sn_generator_url;}},
            currency_code: {type: new GraphQLNonNull(GraphQLString), resolve(product) {return product.currency_code;}},
            start_date: {type: GraphQLString, resolve(product) {return product.start_date;}},
            end_date: {type: GraphQLString, resolve(product) {return product.end_date;}},
            notes: {type: GraphQLString, resolve(product) {return product.notes;}}
        }
    }
});

const ProductKey = new GraphQLObjectType({
    name: 'product_key',
    description: 'product keys issues to customers',
    fields: () => { return {
        key: {type: GraphQLString, resolve(product_key) {return product_key.key; }},
        email: {type: GraphQLString, resolve(product_key) {return product_key.email; }},
        product_id: {type: GraphQLInt, resolve(product_key) {return product_key.product_id; }},
        order_id: {type: GraphQLInt, resolve(product_key) {return product_key.order_id; }},
        registered: {type: GraphQLString, resolve(product_key) {return product_key.registered; }},
        revoked: {type: GraphQLBoolean, resolve(product_key) {return product_key.revoked; }},
        upgrade_order_id: {type: GraphQLInt, resolve(product_key) {return product_key.upgrade_order_id; }},
        notes: {type: GraphQLString, resolve(product_key) {return product_key.notes; }},
        locality: {type: GraphQLString, resolve(product_key) {return product_key.locality; }}
    }}
});

const Maintenance = new GraphQLObjectType({
    name: 'maintenance',
    description: 'Maintenance Contracts',
    fields: () => { return {
        id: {type: GraphQLID, resolve(maintenance) {return maintenance.id; }},
        product_id: {type: GraphQLInt, resolve(maintenance) {return maintenance.product_id; }},
        product_key: {type: GraphQLString, resolve(maintenance) {return maintenance.product_key; }},
        start_date: {type: GraphQLString, resolve(maintenance) {return maintenance.start_date; }},
        end_date: {type: GraphQLString, resolve(maintenance) {return maintenance.end_date; }},
        order_id: {type: GraphQLInt, resolve(maintenance) {return maintenance.order_id; }},
        locality: {type: GraphQLString, resolve(maintenance) {return maintenance.locality; }}
    }}
});

const Account = new GraphQLObjectType({
    name: 'account',
    description: 'Customer account records',
    fields: () => {
        return {
            id: {type: GraphQLID, resolve(account) {return account.id; }},
            main_contact_id: {type: GraphQLInt, resolve(account) {return account.main_contact_id; }},
            company: {type: GraphQLString, resolve(account) {return account.company; }},
            credit_status: {type: GraphQLString, resolve(account) {return account.credit_status; }},
            parent_id: {type: GraphQLInt, resolve(account) {return account.parent_id; }},
            locality: {type: GraphQLString, resolve(account) {return account.locality; }},
            notes: {type: GraphQLString, resolve(account) {return account.notes; }}
        }
    }
});

const Contact = new GraphQLObjectType({
    name: 'contact',
    description: 'Represents all customer contacts',
    fields: () => {
        return {
            id: { type: GraphQLID, resolve(contact) { return contact.id; }},
            espresso_cid: {type: GraphQLInt, resolve(contact) {return contact.espresso_cid; }},
            account_id: {type: GraphQLString, resolve(contact) {return contact.account_id; }},
            first: { type: GraphQLString, resolve(contact) { return contact.first; }},
            last: { type: GraphQLString, resolve(contact) { return contact.last; }},
            email: { type: GraphQLString, resolve(contact) { return contact.email; }},
            address: { type: GraphQLString, resolve(contact) { return contact.address; }},
            city: { type: GraphQLString, resolve(contact) { return contact.city; }},
            region: {type: GraphQLString, resolve(contact) {return contact.region; }},
            postal_code: {type: GraphQLString, resolve(contact) {return contact.postal_code; }},
            country_iso: {type: GraphQLString, resolve(contact) {return contact.country_iso; }},
            telephone: { type: GraphQLString, resolve(contact) { return contact.telephone; }},
            type: {type: GraphQLString, resolve(contact) {return contact.type; }},
            locality: {type: GraphQLString, resolve(contact) {return contact.locality; }},
            notes: { type: GraphQLString, resolve(contact) { return contact.notes; }},
            price_scenario: {type: GraphQLString, resolve(contact) {return contact.price_scenario; }},
            billto_id: { type: GraphQLInt, resolve(contact) { return contact.billto_id; }},
            source_id: { type: GraphQLInt, resolve(contact) { return contact.source_id; }}
        }
    }
});

const Order = new GraphQLObjectType({
    name: 'order',
    description: 'Represents a list of orders, quotes and invoices',
    fields: () => { return {
        id: {type: GraphQLID, resolve(order) {return order.id; }},
        billto_id: {type: GraphQLInt, resolve(order) {return order.billto_id; }},
        shipto_id: {type: GraphQLInt, resolve(order) {return order.shipto_id; }},
        order_date: {type: GraphQLString, resolve(order) {return order.order_date; }},
        ship_date: {type: GraphQLString, resolve(order) {return order.ship_date; }},
        pay_method: {type: GraphQLString, resolve(order) {return order.pay_method; }},
        po_number: {type: GraphQLString, resolve(order) {return order.po_number; }},
        cc_number: {type: GraphQLString, resolve(order) {return order.cc_number; }},
        cc_security_code: {type: GraphQLInt, resolve(order) {return order.cc_security_code; }},
        cc_expire_month: {type: GraphQLInt, resolve(order) {return order.cc_expire_month; }},
        cc_expire_year: {type: GraphQLInt, resolve(order) {return order.cc_expire_year; }},
        cc_name: {type: GraphQLString, resolve(order) {return order.cc_name; }},
        cc_address: {type: GraphQLString, resolve(order) {return order.cc_address; }},
        cc_city: {type: GraphQLString, resolve(order) {return order.cc_city; }},
        cc_region: {type: GraphQLString, resolve(order) {return order.cc_region; }},
        cc_country_iso: {type: GraphQLString, resolve(order) {return order.cc_country_iso; }},
        cc_postal_code: {type: GraphQLString, resolve(order) {return order.cc_postal_code; }},
        cc_authorization_code: {type: GraphQLString, resolve(order) {return order.cc_authorization_code; }},
        cc_authorization_date: {type: GraphQLString, resolve(order) {return order.cc_authorization_date; }},
        status: {type: GraphQLString, resolve(order) {return order.status; }},
        subtotal: {type: GraphQLFloat, resolve(order) {return order.subtotal; }},
        sales_tax: {type: GraphQLFloat, resolve(order) {return order.sales_tax; }},
        amount_paid: {type: GraphQLFloat, resolve(order) {return order.amount_paid; }},
        amount_due: {type: GraphQLFloat, resolve(order) {return order.amount_due; }},
        shipping_charges: {type: GraphQLFloat, resolve(order) {return order.shipping_charges; }},
        transaction_fees: {type: GraphQLFloat, resolve(order) {return order.transaction_fees; }},
        type: {type: GraphQLString, resolve(order) {return order.type; }},
        promo_code: {type: GraphQLString, resolve(order) {return order.promo_code; }},
        currency_code: {type: GraphQLString, resolve(order) {return order.currency_code; }},
        notes: {type: GraphQLString, resolve(order) {return order.notes; }},
        locality: {type: GraphQLString, resolve(order) {return order.locality; }}
    }}
});

const OrderItem = new GraphQLObjectType({
    name: 'order_item',
    description: 'A list of each order items',
    fields: () => { return {
        order_id: {type: GraphQLInt, resolve(order_item) {return order_item.order_id;}},
        product_id: {type: GraphQLInt, resolve(order_item) {return order_item.product_id;}},
        quantity: {type: GraphQLInt, resolve(order_item) {return order_item.quantity;}},
        price: {type: GraphQLFloat, resolve(order_item) {return order_item.price;}},
        amount: {type: GraphQLFloat, resolve(order_item) {return order_item.quantity * order_item.price;}},
        discount: {type: GraphQLFloat, resolve(order_item) {return order_item.discount;}},
        discount_amount: {type: GraphQLFloat, resolve(order_item) {return order_item.quantity * order_item.price * order_item.discount;}},
        promo_code: {type: GraphQLString, resolve(order_item) {return order_item.promo_code;}},
        currency_code: {type: GraphQLString, resolve(order_item) {return order_item.currency_code;}},
        product: {type: Product, resolve(order_item) {return order_date.getProduct()}}
    }}
});

const SalesQuery = new GraphQLObjectType({
    name: 'SalesQuery',
    description: 'Query Sales DB Model',
    fields: () => {
        return {
            currencies: {
                type: new GraphQLList(Currency),
                args: {
                    code: {
                        type: GraphQLID
                    }
                },
                resolve(root, args) {
                    return SalesDB.models.currency.findAll({where: args});
                }
            },
            countries: {
                type: new GraphQLList(Country),
                args: {
                    iso: { type: GraphQLID },
                    name: {type: GraphQLString}
                },
                resolve(root, args) {
                    return SalesDB.models.country.findAll({where: args});
                }
            },
            pricings: {
                type: new GraphQLList(Pricing),
                args: {
                    scenario: {type: GraphQLString}
                },
                resolve(root, args) {
                    return SalesDB.models.pricing.findAll({where: args});
                }
            },
            promotions: {
                type: new GraphQLList(Promotion),
                args: {
                    code: {type: GraphQLString},
                    locality: {type: GraphQLString}
                },
                resolve(root, args) {
                    return SalesDB.models.promotion.findAll({where: args});
                }
            },
            products: {
                type: new GraphQLList(Product),
                args: {
                    id: {type: GraphQLID},
                    name: {type: GraphQLString},
                    sku: {type: GraphQLString},
                    family: {type: GraphQLString},
                    locality: {type: GraphQLString},
                    startDate: {type: GraphQLString},
                    discontinueDate: {type: GraphQLString}
                },
                resolve(root, args) {
                    return SalesDB.models.product.findAll({where: args});
                }
            },
            product_keys: {
                type: new GraphQLList(ProductKey),
                args: {
                    key: {type: GraphQLString},
                    order_id: {type: GraphQLInt},
                    email: {type: GraphQLString}
                },
                resolve(root, args) {
                    return SalesDB.models.productkey.findAll({where: args});
                }
            },
            maintenances: {
                type: new GraphQLList(Maintenance),
                args: {
                    product_key: {type: GraphQLString},
                    email: {type: GraphQLString}
                },
                resolve(root, args) {
                    return SalesDB.models.maintenance.findAll({where: args});
                }
            },
            contacts: {
                type: new GraphQLList(Contact),
                args: {
                    id: {type: GraphQLID},
                    company: {type: GraphQLString},
                    email: {type: GraphQLString},
                    first: {type: GraphQLString},
                    last: {type: GraphQLString},
                    city: {type: GraphQLString},
                    region: {type: GraphQLString},
                    telephone: {type: GraphQLString},
                    locality: {type: GraphQLString},
                    espresso_cid: {type: GraphQLInt}
                },
                resolve(root, args) {
                    return SalesDB.models.contact.findAll({where: args});
                }
            },
            accounts: {
                type: new GraphQLList(Account),
                args: {
                    id: {type: GraphQLID},
                    company: {type: GraphQLString},
                    locality: {type: GraphQLString}
                },
                resolve(root, args) {
                    return SalesDB.models.account.findAll({where: args});
                }
            },
            orders: {
                type: new GraphQLList(Order),
                args: {
                    id: {type: GraphQLID},
                    shipto_id: {type: GraphQLInt},
                    billto_id: {type: GraphQLInt},
                    locality: {type: GraphQLString},
                    amount_due: {type: GraphQLFloat},
                    promo_code: {type: GraphQLString},
                    order_date: {type: GraphQLString},
                    type: {type: GraphQLString}
                },
                resolve(root, args) {
                    return SalesDB.models.order.findAll({where: args});
                }
            }
        }
    }
});

const SalesMutation = new GraphQLObjectType({
    name: 'SalesMutation',
    description: 'calls to modify the database',
    fields: () => {

    }
});

const SalesSchema = new GraphQLSchema({
    query: SalesQuery
    // , mutation: Mutation
});

export default SalesSchema;
