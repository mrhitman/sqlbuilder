'use strict';

const _ = require("lodash");
const assert = require("assert");

class Sql {
    constructor() {
        this.__reset();
    }

    __reset() {
        this.__begin = '';
        this.__fields = '';
        this.__values = '';
        this.__tableName = '';
        this.__condition = '';
    }

    __prepareFields(fields) {
        if (typeof fields === 'string') {
            return `${fields} `;
        }
        if (Array.isArray(fields)) {
            return `${fields.join(', ')} `;
        }
        return `* `;
    }

    __prepareCondition(condition) {
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

    __prepareValues(data) {
        switch (this.__begin) {
            case 'INSERT': 
                return ` (${Object.keys(data).join()}) VALUES (${Object.values(data).join()})`
            case 'UPDATE':
                const values = _.map(data, (value, key) => `${key}=${value}`);
                return ` SET ${values}`;
        }
    }

    static select(fields, tableName) {
        const instance = new Sql();
        instance.__begin = 'SELECT';
        instance.__fields = instance.__prepareFields(fields);
        if (tableName) {
            return instance.table(tableName);
        }
        return instance;
    }

    static insert(tableName, data) {
        const instance = new Sql();
        instance.__begin = 'INSERT';
        instance.__values = instance.__prepareValues(data);
        return instance.table(tableName);
    }

    static update(tableName, data) {
        const instance = new Sql();
        instance.__begin = 'UPDATE';
        instance.__values = instance.__prepareValues(data);
        return instance.table(tableName);
    }

    static delete(tableName) {
        const instance = new Sql();
        instance.__begin = 'DELETE';
        return instance.table(tableName);
    }

    table(tableName) {
        this.__tableName = tableName;
        return this;
    }

    where(condition) {
        this.__condition = this.__prepareCondition(condition);
        return this;
    }

    sql() {
        const sql = [];
        switch (this.__begin) {
            case 'SELECT': 
                sql.push(`${this.__begin} ${this.__fields}`);
                sql.push(`FROM ${this.__tableName}`);
                sql.push(this.__condition);
            break;
            case 'INSERT': 
                sql.push(`${this.__begin} `);
                sql.push(`INTO ${this.__tableName}`);
                sql.push(this.__values);
            break;
            case 'UPDATE': 
                sql.push(`${this.__begin} ${this.__fields}`);
                sql.push(`${this.__tableName}`);
                sql.push(this.__values)
                sql.push(this.__condition);
            break;
            case 'DELETE':
                sql.push(`${this.__begin} `);
                sql.push(`FROM ${this.__tableName}`);
                sql.push(this.__condition);
            break;
        }
        sql.push(';');
        this.__reset();
        return sql.join('');
    }
}

const selectSql = Sql.select;
const insertSql = Sql.insert;
const updateSql = Sql.update;
const deleteSql = Sql.delete;

const tests = [
    [selectSql().table('test').sql(), "SELECT * FROM test;"],
    [selectSql(['id', 'field1']).table('test').sql(), "SELECT id, field1 FROM test;"],
    [selectSql('id, field1').table('test').sql(), "SELECT id, field1 FROM test;"],
    [selectSql(['id', 'field1']).table('test').sql(), "SELECT id, field1 FROM test;"],
    [selectSql(['id', 'field1']).table('test').sql(), "SELECT id, field1 FROM test;"],
    [selectSql(['id', 'field1']).table('test').where('id=:id').sql(), "SELECT id, field1 FROM test WHERE id=:id;"],
    [selectSql(['id', 'field1']).table('test').where({id: ':id'}).sql(), "SELECT id, field1 FROM test WHERE id=:id;"],
    [selectSql(['id', 'field1'], 'test').where({id: ':id'}).sql(), "SELECT id, field1 FROM test WHERE id=:id;"],
    [selectSql('*', 'test').sql(), "SELECT * FROM test;"],
    [updateSql('test', { field: 1 }).sql(), "UPDATE test SET field=1;"],
    [updateSql('test', { field: 1 }).where({ id: 1 }).sql(), "UPDATE test SET field=1 WHERE id=1;"],
    [deleteSql('test').where({ id: 1 }).sql(), "DELETE FROM test WHERE id=1;"],
    [insertSql('test', { id: 1 }).sql(), "INSERT INTO test (id) VALUES (1);"],
];

tests.map((test) => {
    assert.deepEqual(test[0], test[1]);
});
