'use strict';

/*global describe, it*/

const expect = require('chai').expect;
const sql = require('../sql');

describe('select', function() {
    it('simple', function() {
        expect('SELECT * FROM test;')
            .to.be
            .equal(sql.select().table('test').sql());
        expect('SELECT * FROM test;')
            .to.be
            .equal(sql.select('*').table('test').sql());
    });

    it('fields', function() {
        expect('SELECT id, field FROM test;')
            .to.be
            .equal(sql.select(['id', 'field']).table('test').sql());
        expect('SELECT id, field FROM test;')
            .to.be
            .equal(sql.select('id, field').table('test').sql());
        expect('SELECT id, field FROM test;')
            .to.be
            .equal(sql.select('id, field', 'test').sql());
    });

    it('where', function() {
        expect('SELECT id, field1 FROM test WHERE id=:id;')
            .to.be
            .equal(sql.select(['id', 'field1'], 'test').where('id=:id').sql());
        expect('SELECT id, field1 FROM test WHERE id=:id;')
            .to.be
            .equal(sql.select(['id', 'field1'], 'test').where({id: ':id'}).sql());
        expect('SELECT id, field1 FROM test WHERE id=:id AND name=:name;')
            .to.be
            .equal(sql.select(['id', 'field1'], 'test').where({id: ':id', name: ':name'}).sql());
        expect('SELECT id, field1 FROM test WHERE NOT (id=:id);')
            .to.be
            .equal(sql.select(['id', 'field1'], 'test').where(['NOT',  'id=:id']).sql());
        expect('SELECT id FROM test WHERE (id=1 OR id=2);')
            .to.be
            .equal(sql.select('id', 'test').where(['OR', 'id=1', 'id=2']).sql());
        expect('SELECT id FROM test WHERE (id=1 OR (id=3 AND id=2));')
            .to.be
            .equal(sql.select('id', 'test').where(['OR', 'id=1', ['AND', 'id=3', 'id=2']]).sql());
        expect('SELECT id FROM test WHERE (id=1 OR (id=3 OR id=2));')
            .to.be
            .equal(sql.select('id', 'test').where(['OR', 'id=1', ['OR', 'id=3', 'id=2']]).sql());
    });

    it('real', function() {
        expect("SELECT raw_data FROM sso_service_lines WHERE (created_at > NOW() - INTERVAL '1 minute' OR updated_at > NOW() - INTERVAL '1 minute') AND portal_id = :portal_id`;")
            .to.be
            .equal(sql.select('raw_data', 'sso_service_lines')
                .where("(created_at > NOW() - INTERVAL '1 minute' OR updated_at > NOW() - INTERVAL '1 minute') AND portal_id = :portal_id`")
                .sql());
    });
});

describe('delete', function() {
    it('simple', function() {
        expect('DELETE FROM test;')
            .to.be
            .equal(sql.delete('test').sql());
    });

    it('where', function() {
        expect('DELETE FROM test WHERE id=:id;')
            .to.be
            .equal(sql.delete('test').where({id: ':id'}).sql());
        expect('DELETE FROM test WHERE id=:id;')
            .to.be
            .equal(sql.delete('test').where('id=:id').sql());
    });
});

describe('update', function() {
    it('simple', function() {
        expect('UPDATE test SET id=:id;')
            .to.be
            .equal(sql.update('test', {id: ':id'}).sql());
    });

    it('where', function() {
        expect('UPDATE test SET id=:id WHERE name=:name;')
            .to.be
            .equal(sql.update('test', {id: ':id'}).where('name=:name').sql());
        expect('UPDATE test SET id=:id WHERE name=:name;')
            .to.be
            .equal(sql.update('test', {id: ':id'}).where({name: ':name'}).sql());
    });
});
