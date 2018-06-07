'use strict';

const _ = require("lodash");

class Sql {
    constructor() {
        this._reset();
    }

    _reset() {
        this._begin = '';
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
        switch (this._begin) {
        case 'INSERT':
            return ` (${Object.keys(data).join()}) VALUES (${Object.values(data).join()})`;
        case 'UPDATE':
            const values = _.map(data, (value, key) => {
                return `${key}=${value}`;
            });
            return ` SET ${values}`;
        default:
            throw new Error('Invalid sql type');
        }
    }

    static select(fields, tableName) {
        const instance = new Sql();
        instance._begin = 'SELECT';
        instance._fields = instance._prepareFields(fields);
        if (tableName) {
            return instance.table(tableName);
        }
        return instance;
    }

    static insert(tableName, data) {
        const instance = new Sql();
        instance._begin = 'INSERT';
        instance._values = instance._prepareValues(data);
        return instance.table(tableName);
    }

    static update(tableName, data) {
        const instance = new Sql();
        instance._begin = 'UPDATE';
        instance._values = instance._prepareValues(data);
        return instance.table(tableName);
    }

    static delete(tableName) {
        const instance = new Sql();
        instance._begin = 'DELETE';
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
        switch (this._begin) {
        case 'SELECT':
            sql.push(`${this._begin} ${this._fields}`);
            sql.push(`FROM ${this._tableName}`);
            sql.push(this._condition);
            break;
        case 'INSERT':
            sql.push(`${this._begin} `);
            sql.push(`INTO ${this._tableName}`);
            sql.push(this._values);
            break;
        case 'UPDATE':
            sql.push(`${this._begin} ${this._fields}`);
            sql.push(`${this._tableName}`);
            sql.push(this._values);
            sql.push(this._condition);
            break;
        case 'DELETE':
            sql.push(`${this._begin} `);
            sql.push(`FROM ${this._tableName}`);
            sql.push(this._condition);
            break;
        default:
            throw new Error('Invalid sql type');
        }
        sql.push(';');
        this._reset();
        return sql.join('');
    }
}

module.exports = {
    select: Sql.select,
    update: Sql.update,
    delete: Sql.delete,
    insert: Sql.insert
};
