[![Coverage Status](https://coveralls.io/repos/github/mrhitman/sqlbuilder/badge.svg?branch=master)](https://coveralls.io/github/mrhitman/sqlbuilder?branch=master)
![Build Status](https://travis-ci.org/mrhitman/sqlbuilder.svg?branch=master)
## select
```
    select().from('test').where('id=:id').sql(); 
    // SELECT * FROM test WHERE id=:id;
    select(['id', 'field'], 'test').sql();
    // SELECT id, field FROM test;
```
## insert
```
    insert('test', {id: 'id'}).sql(); 
    //INSERT INTO test (id) VALUES (:id); 
```
## update
```
```
## delete
```
```