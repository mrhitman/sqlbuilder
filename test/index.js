'use strict';

/*global describe, it*/

const expect = require('chai').expect;
const sql = require('../sql');

describe('select', function() {
    it('simple', function() {
        expect('SELECT * FROM test;').to.be.equal(sql.select().table('test').sql());
        expect('SELECT * FROM test;').to.be.equal(sql.select('*').table('test').sql());
    });

    it('fields', function() {
        expect('SELECT id, field FROM test;').to.be.equal(sql.select(['id', 'field']).table('test').sql());
        expect('SELECT id, field FROM test;').to.be.equal(sql.select('id, field').table('test').sql());
        expect('SELECT id, field FROM test;').to.be.equal(sql.select('id, field', 'test').sql());
    });

    it('where', function() {
        expect('SELECT id, field1 FROM test WHERE id=:id;').to.be.equal(sql.select(['id', 'field1'], 'test').where('id=:id').sql());
        expect('SELECT id, field1 FROM test WHERE id=:id;').to.be.equal(sql.select(['id', 'field1'], 'test').where({id: ':id'}).sql());
    });
});

describe('select', function() {
    it('simple', function() {

    });
});
