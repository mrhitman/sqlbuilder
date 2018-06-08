'use strict';

const _ = require("lodash");

const types = {
    select: 'SELECT',
    update: 'UPDATE',
    insert: 'INSERT',
    delete: 'DELETE'
};
class Sql {
    constructor(type) {
        this._reset();
        this._type = type;
    }

    _reset() {
        this._type = '';
        this._fields = '';
        this._values = '';
        this._tableName = '';
        this._condition = '';
    }

    _prepareFields(fields) {
        if (typeof fields === 'string') {
            return `${fields} `;
        }
        if (Array.isArray(fields)) {
            return `${fields.join(', ')} `;
        }
        return `* `;
    }

    _prepareCondition(condition) {
        if (typeof condition === 'string') {
            return ` WHERE ${condition}`;
        }
        if (condition instanceof Object) {
            return ` WHERE ${_.map(condition, (value, key) => {
                return `${key}=${value}`;
            }).join()}`;
        }
        return ``;
    }

    _prepareValues(data) {
        switch (this._type) {
        case types.insert:
            return ` (${Object.keys(data).join()}) VALUES (${Object.values(data).join()})`;
        case types.update:
            return ` SET ` + _.map(data, (value, key) => {
                return `${key}=${value}`;
            });
        default:
            throw new Error(`Invalid sql type:${this._type}`);
        }
    }

    static select(fields, tableName) {
        const instance = new Sql(types.select);
        instance._fields = instance._prepareFields(fields);
        if (tableName) {
            return instance.table(tableName);
        }
        return instance;
    }

    static insert(tableName, data) {
        const instance = new Sql(types.insert);
        instance._values = instance._prepareValues(data);
        return instance.table(tableName);
    }

    static update(tableName, data) {
        const instance = new Sql(types.update);
        instance._values = instance._prepareValues(data);
        return instance.table(tableName);
    }

    static delete(tableName) {
        const instance = new Sql(types.delete);
        return instance.table(tableName);
    }

    table(tableName) {
        this._tableName = tableName;
        return this;
    }

    where(condition) {
        this._condition = this._prepareCondition(condition);
        return this;
    }

    sql() {
        const sql = [];
        switch (this._type) {
        case types.select:
            sql.push(`${this._type} ${this._fields}`);
            sql.push(`FROM ${this._tableName}`);
            sql.push(this._condition);
            break;
        case types.insert:
            sql.push(`${this._type} `);
            sql.push(`INTO ${this._tableName}`);
            sql.push(this._values);
            break;
        case types.update:
            sql.push(`${this._type} ${this._fields}`);
            sql.push(`${this._tableName}`);
            sql.push(this._values);
            sql.push(this._condition);
            break;
        case types.delete:
            sql.push(`${this._type} `);
            sql.push(`FROM ${this._tableName}`);
            sql.push(this._condition);
            break;
        default:
            throw new Error(`Invalid sql type:${this._type}`);
        }
        sql.push(';');
        this._reset();
        return sql.join('');
    }

    toString() {
        return this.sql();
    }
}

module.exports = {
    select: Sql.select,
    update: Sql.update,
    delete: Sql.delete,
    insert: Sql.insert
};
