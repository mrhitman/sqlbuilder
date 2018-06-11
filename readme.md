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