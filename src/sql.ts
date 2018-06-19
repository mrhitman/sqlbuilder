import { map, first, range } from "lodash";

type Condition = string | Array<string> | Object;
type Fields = string | Array<string>;

class Sql {
    protected _tableName: string;
    protected _condition: string;

    _prepareCondition(condition: Condition) {
        if (typeof condition === 'string') {
            return condition;
        } else if (Array.isArray(condition)) {
            const key = first(condition.splice(0, 1));
            switch (key) {
            case `OR`:
                return `(` + map(condition, this._prepareCondition.bind(this)).join(` OR `) + `)`;
            case `AND`:
                return `(` + map(condition, this._prepareCondition.bind(this)).join(` AND `) + `)`;
            case `NOT`:
                return `NOT (${first(condition)})`;
            default:
                throw new Error(`Invalid sql: ${key}`);
            }
        } else if (condition instanceof Object) {
            return map(condition, (value, key) => {
                return `${key}=${this._prepareCondition(value)}`;
            }).join(` AND `);
        }
        return `1=1`;
    }

    _prepareFields(fields: Fields) {
        if (typeof fields === 'string') {
            return `${fields} `;
        }
        if (Array.isArray(fields)) {
            return `${fields.join(',')} `;
        }
        return `* `;
    }

    table(tableName) {
        this._tableName = tableName;
        return this;
    }

    where(condition) {
        this._condition = ` WHERE ${this._prepareCondition(condition)}`;
        return this;
    }

    _prepareSql(sql) {
        sql.push(`;`);
        return sql.join('');
    }
}

class Select extends Sql {
    protected _fields: string;

    from(tableName) {
        return this.table(tableName);
    }

    static create(fields, tableName) {
        const instance = new Select();
        instance._fields = instance._prepareFields(fields);
        if (tableName) {
            return instance.table(tableName);
        }
        return instance;
    }

    sql() {
        const sql = [];
        sql.push(`SELECT ${this._fields}`);
        sql.push(`FROM ${this._tableName}`);
        sql.push(this._condition);
        return this._prepareSql(sql);
    }
}

class Insert extends Sql {
    protected _conflict: string = ``;
    protected _values: string;

    static create(tableName, data) {
        const instance = new Insert();
        instance._values = instance._prepareValues(data);
        return instance.table(tableName);
    }

    _prepareValues(data) {
        return ` (${Object.keys(data).join()}) VALUES (${Object.values(data).join()})`;
    }

    onConflict(fields, updateSet) {
        if (Array.isArray(fields)) {
            this._conflict = ` ON CONFLICT (${fields.join()})`;
        } else {
            this._conflict = ` ON CONFLICT (${fields})`;
        }
        this._conflict += ` DO UPDATE SET ` + map(updateSet, (value, key) => {
            return `${key}=${value}`;
        });
        return this;
    }

    sql() {
        const sql = [];
        sql.push(`INSERT INTO ${this._tableName}`);
        sql.push(this._values);
        sql.push(this._conflict);
        return this._prepareSql(sql);
    }
}

class InsertBatch extends Sql {
    protected _fields: string;
    protected _values: string;

    static create(tableName, fields, data) {
        const instance = new InsertBatch();
        instance._fields = instance._prepareFields(fields).trim();
        instance._values = instance._prepareValues(data);
        return instance.table(tableName);
    }

    _prepareValues(data) {
        let totalValues = 0;
        return data.map((values, index) => {
            const result = `(:${range(totalValues, totalValues + values.length).join(',:')})`;
            totalValues += values.length;
            return result;
        });
    }

    sql() {
        const sql = [];
        sql.push(`INSERT INTO ${this._tableName} `);
        sql.push(`(${this._fields}) `);
        sql.push(`VALUES ${this._values}`);
        return this._prepareSql(sql);
    }
}

class Update extends Sql {
    protected _values: string;
    protected _condition: string;

    static create(tableName, data) {
        const instance = new Update();
        instance._values = instance._prepareValues(data);
        return instance.table(tableName);
    }

    _prepareValues(data) {
        return ` SET ` + map(data, (value, key) => {
            return `${key}=${value}`;
        });
    }

    sql() {
        const sql = [];
        sql.push(`UPDATE ${this._tableName}`);
        sql.push(this._values);
        sql.push(this._condition);
        return this._prepareSql(sql);
    }
}

class Delete extends Sql {
    protected _condition: string;

    static create(tableName: string) {
        const instance = new Delete();
        return instance.table(tableName);
    }

    sql() {
        const sql = [];
        sql.push(`DELETE FROM ${this._tableName}`);
        sql.push(this._condition);
        return this._prepareSql(sql);
    }
}

export = {
    select: Select.create,
    update: Update.create,
    delete: Delete.create,
    insert: Insert.create,
    insertBatch: InsertBatch.create
};
