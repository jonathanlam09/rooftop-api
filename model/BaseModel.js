const db_config = require('../config/db');
const { Sequelize, DataTypes, Model } = require('sequelize');
const { DateTime, Duration } = require('luxon');

let dt_now = DateTime.now();
let offset_min = dt_now.offset;
let offset_duration = Duration.fromObject({ minutes: offset_min });

const Cls = require('cls-hooked');
// const namespace = Cls.createNamespace('sequelize.ns');
const namespace = Cls.getNamespace('sequelize') ?? Cls.createNamespace('sequelize');
// const namespace = Cls.getNamespace('sequelize');

Sequelize.useCLS(namespace);
const sequelize = new Sequelize(
    db_config.DB,
    db_config.USER,
    db_config.PASSWORD,
    {
        host: db_config.HOST,
        dialect: db_config.dialect,
        port: db_config.port,
        operationsAliases: false,
        // timezone: '+11:00',  // fixed
        timezone: offset_duration.toFormat(`${offset_min >= 0 ? '+' : ''}hh:mm`), // dynamic, due to daylight saving time
        pool: {
            max: db_config.pool.max,
            min: db_config.pool.min,
            acquire: db_config.pool.acquire,
            idle: db_config.pool.idle
        },
        define: {
            timestamps: false,
        },
        dialectOptions: {
            // ref: https://github.com/mysqljs/mysql
            // ref: https://stackoverflow.com/questions/47367893/sequelize-reads-datetime-in-utc-only
            // timezone: '+11:00', // not working
            // useUTC: false, // deprecated //for reading from database
            // dateStrings: true,
            typeCast: function (field, next) { // for reading from database
                if (field.type === 'DATETIME') {
                    let str = field.string();
                    // console.log(field.name);
                    // console.log(str);
                    if (!str) {
                        return str;
                    }

                    let dt = DateTime.fromFormat(str, 'yyyy-MM-dd HH:mm:ss');
                    return dt.toJSDate();
                }

                return next();
            },
        },
    });

// let sequelize_transaction = sequelize.transaction.bind(sequelize);
sequelize.__transaction = sequelize.transaction;
sequelize.transaction = function (...arg) {
    let ret = this.__transaction(...arg).then(txn => {
        if (txn) {
            // let managed_txn = namespace.get('managed_txn_arr') ?? [];
            // managed_txn.push(txn);
            // namespace.set('managed_txn_arr', managed_txn);

            txn.__symbol = Symbol(txn.id);
            txn.__commit = txn.commit;
            txn.__rollback = txn.rollback;
            
            txn.commit = async function () {
                let res = await this.__commit();
                let managed_txn = namespace.get('managed_txn_list');
                delete managed_txn[this.__symbol];
                namespace.set('managed_txn_list', managed_txn);
                return res;
            };

            txn.rollback = async function () {
                let res = await this.__rollback();
                let managed_txn = namespace.get('managed_txn_list');
                delete managed_txn[this.__symbol];
                namespace.set('managed_txn_list', managed_txn);
                return res;
            };

            let managed_txn = namespace.get('managed_txn_list') ?? {};
            managed_txn[txn.__symbol] = txn;
            namespace.set('managed_txn_list', managed_txn);
        }

        return txn;
    });

    return ret;
};

const knex = require('knex')({
    client: 'mysql2',
});

class BaseModel extends Model {
    static sequelize = sequelize;
    static Sequelize = Sequelize;

    static knex = knex;

    static TABLENAME = null;
    static cls_ns = namespace;

    hook_queue = {
        beforeSave: [],
        afterSave: [],
    };

    static init(attributes = {}, options = null) {
        let model = super.init(attributes, options ? options : {
            sequelize,
            // modelName: this.TABLENAME,
            tableName: this.TABLENAME,
            timestamps: false,

            // If don't want createdAt
            //createdAt: false,

            // If don't want updatedAt
            //updatedAt: false,
        });

        model.removeHook('beforeSave', 'base_process_queue');
        model.addHook('beforeSave', 'base_process_queue', async (hook_model, hook_option) => {
            if (hook_model.hook_queue.beforeSave.length > 0) {
                let queue = hook_model.hook_queue.beforeSave;
                hook_model.hook_queue.beforeSave = [];

                let option_assoc = null;
                if (hook_option) {
                    option_assoc = {};
                    ['transaction'].forEach(el => {
                        if (typeof (hook_option?.[el]) != 'undefined') {
                            option_assoc[el] = hook_option[el];
                        }
                    });
                }

                for (let i in queue) {
                    await queue[i](hook_model, option_assoc);
                }
            }
        });

        model.removeHook('afterSave', 'base_process_queue');
        model.addHook('afterSave', 'base_process_queue', async (hook_model, hook_option) => {
            if (hook_model.hook_queue.afterSave.length > 0) {
                let queue = hook_model.hook_queue.afterSave;
                hook_model.hook_queue.afterSave = [];

                let option_assoc = null;
                if (hook_option) {
                    option_assoc = {};
                    ['transaction'].forEach(el => {
                        if (typeof (hook_option?.[el]) != 'undefined') {
                            option_assoc[el] = hook_option[el];
                        }
                    });
                }

                for (let i in queue) {
                    await queue[i](hook_model, option_assoc);
                }
            }
        });

        return model;

    }

    async save(option = null) {
        let manual_transaction = false;
        if (this.hook_queue.afterSave.length > 0) {
            if (!this.constructor._hasTransaction(option)) {
                await this.constructor.startTransaction();
                manual_transaction = true;
            }
        }

        return super.save(option).then(async data => {
            if (manual_transaction) {
                await this.constructor.commit();
            }

            return data;
        }).catch(async err => {
            if (manual_transaction) {
                await this.constructor.rollback();
            }

            throw err;
        });

    }

    static getRandomInt(min = 0, max = 10) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
    }

    /**
     * bothcase=0: comprise of digit and alpha upper case
     * bothcase=1: comprise of digit and alpha upper & lower case
     * bothcase=2: comprise of digit and alpha lower case
     */
    static getRandomAlnum(len = 1, bothcase = 0) {
        var str = '';
        var max = 36;
        if (bothcase == 1) {
            max += 26;
        }

        for (var i = 0; i < len; i++) {
            var toUpper = 1;
            if (bothcase == 2) {
                toUpper = 0;
            }

            var rand = this.getRandomInt(0, max);
            if (rand >= 36) {
                rand -= 26;
                toUpper = 0;
            }
            str += (toUpper ? rand.toString(36).toUpperCase() : rand.toString(36));
        }

        return str;
    }

    static loadModel(model) {
        if (!this.sequelize.models[model]) {
            const model_module = require('./' + model);
            return model_module;
        }

        return this.sequelize.models[model];
    }

    static startTransaction(option = null) {
        let txn = this.cls_ns.get('transaction');
        if (txn) {
            return Promise.resolve(txn);
        }

        return this.sequelize.__transaction(option).then(txn => {
            this.cls_ns.set('transaction', txn);
            return txn;
        });
    }

    static savepoint(more = null, option = null) {
        let sql = 'SAVEPOINT';
        if (more?.savepoint) {
            sql += ' ' + more.savepoint;
        }

        return this.sequelize.query(sql, option);

    }

    static rollback(more = null, option = null) {
        if (more?.savepoint) {
            let sql = `ROLLBACK TO SAVEPOINT ${more.savepoint}`;
            return this.sequelize.query(sql, option);
        }

        let txn = this.cls_ns.get('transaction');
        if (!txn) {
            return Promise.resolve();
        }

        return txn.rollback().then(data => {
            this.cls_ns.set('transaction', undefined);
            return data;
        });
    }

    static commit(option = null) {
        let txn = this.cls_ns.get('transaction');
        if (!txn) {
            return Promise.resolve();
        }

        return txn.commit().then(data => {
            this.cls_ns.set('transaction', undefined);
            return data;
        });
    }

    static _hasTransaction(option = null) {
        return this.cls_ns?.get('transaction') || option?.transaction;
    }
}

module.exports = BaseModel;