const Utils = {
    types: ["Array", "Boolean", "Date", "Number", "Object", "RegExp", "String", "Function"],
    is: {},
};
for (let i = 0, c; (c = Utils.types[i++]);) {
    Utils.is[c] = (function (type) {
        return function (obj) {
            if (!obj)
                return false;
            return Object.prototype.toString.call(obj) === "[object " + type + "]";
        };
    })(c);
}
let showLogInfo = false;
const log = function (...args) {
    showLogInfo && console.log(...args);
};
const showLog = (b) => {
    showLogInfo = b;
};
// 转换 a === b && b == c 语句成sql语法
const convertToSQL = function (sql) {
    return sql.replace(/(?:&&)/, "AND").replace(/(?:[==|===])+/g, "=");
};
const dbQuery = function (db, sql, rowParam) {
    if (sql === undefined) {
        return;
    }
    return new Promise((resolve, reject) => {
        db.transaction(function (transaction) {
            console.log(sql, rowParam);
            transaction.executeSql(sql, rowParam, function (_tx, results) {
                const arr = [];
                let row;
                for (let i = 0; i < results.rows.length; i++) {
                    row = results.rows.item(i);
                    arr.push(row);
                }
                resolve(arr);
            }, function (_tx, e) {
                reject(e);
            });
        });
    });
};

class WebsqlTable {
    name;
    db;
    constructor(name, db) {
        this.name = name;
        this.db = db;
    }
    create(o) {
        var sql = '', s = '';
        if (!Utils.is.Object(o)) {
            log('定义表格需要传入字段对象');
            return;
        }
        s = JSON.stringify(o).replace(/[":\{\}]/g, ' ');
        sql = 'CREATE TABLE IF NOT EXISTS ' + this.name + ' (' + s + ')';
        return this.query(sql);
    }
    ;
    async query(sql, rowParam, cb) {
        const result = await dbQuery(this.db, sql, rowParam);
        if (Utils.is.Function(cb)) {
            cb && cb(result);
        }
        return result;
    }
    ;
    count(sql, cb) {
        return this.query(sql, undefined, function (r) {
            if (Utils.is.Function(cb)) ;
        });
    }
    ;
    update(values, where, cb) {
        var k, filed, _values;
        if (!Utils.is.Object(values))
            return false;
        filed = [];
        _values = [];
        for (k in values) {
            filed.push(k);
            _values.push(values[k]);
        }
        filed = filed.join(',');
        var sql = 'UPDATE ' + this.name + ' SET ' + filed.replace(/,/g, '=?,') + '=? ';
        if (where) {
            where = where + '=' + values[where];
            sql += 'WHERE ' + where;
        }
        sql += ';';
        return this.query(sql, _values, cb);
    }
    ;
    insert(values, cb) {
        var k, filed, _values;
        if (!Utils.is.Object(values))
            return false;
        filed = [];
        _values = [];
        for (k in values) {
            filed.push(k);
            _values.push(values[k]);
        }
        filed = filed.join(',');
        var sql = 'INSERT INTO ' + this.name + '(' + filed + ') VALUES (' + filed.replace(/[a-zA-Z-_\d]+/g, '?') + ');';
        return this.query(sql, _values, cb);
    }
    ;
    async save(values, key, cb) {
        let where, sql;
        if (!this.name || !Utils.is.Object(values) || !key)
            return this;
        sql = 'SELECT count(*) FROM ' + this.name;
        if (Utils.is.String(key)) {
            where = key + "='" + values[key] + "'";
            sql += ' WHERE ' + where;
        }
        sql += ' ;';
        const r = await this.count(sql);
        if (!r)
            return;
        if (r.length === 0) {
            return this.insert(values, cb);
        }
        else {
            return this.update(values, key, cb);
        }
    }
    ;
    get(where) {
        var sql = 'SELECT * FROM ' + this.name;
        if (where) {
            sql += ' WHERE ' + convertToSQL(where);
        }
        sql += ';';
        return this.query(sql);
    }
    ;
    del(where) {
        var sql = 'DELETE FROM ' + this.name;
        if (where) {
            sql += ' WHERE ' + convertToSQL(where);
        }
        sql += ';';
        return this.query(sql);
    }
    ;
    drop(tableName) {
        this.query(`DROP TABLE IF EXISTS ${tableName};`, undefined, () => {
            log('dropped!');
        });
        log(`Table ${tableName} has been dropped.`);
        return this;
    }
    ;
    batch(arr) {
        if (!Array.isArray(arr)) {
            return;
        }
        arr.forEach((v) => {
            //@ts-ignore
            this[v.type].apply(this, v.args);
        });
        return this;
    }
    ;
}

class WebsqlWrapper {
    tables = {};
    db = null;
    events = {};
    query = (sql, rowParam) => {
        return dbQuery(this.db, sql, rowParam);
    };
    constructor(opts) {
        try {
            if (!window.openDatabase) {
                alert('Databases are not supported in this browser.');
            }
            else {
                var shortName = opts.name;
                var version = opts.version;
                var displayName = opts.displayName;
                var maxSize = opts.maxSize || 100000; //  bytes
                this.db = window.openDatabase(shortName, version, displayName, maxSize);
                opts.success && opts.success.call(this, this.db);
            }
        }
        catch (e) {
            if (e == 2) {
                // Version number mismatch.
                console.log("Invalid database version.");
            }
            else {
                console.log("Unknown error " + e + ".");
            }
            opts.fail && opts.fail.call(this, e);
            return;
        }
    }
    static showLog = (b) => {
        showLog(b);
    };
    batchExec(arr) {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(arr)) {
                reject('参数需要传递 SQL 数字串数组');
            }
            this.db.transaction((transaction) => {
                const promiseArr = arr.map(function (sql) {
                    return new Promise((res, rej) => {
                        transaction.executeSql(sql, [], function (tx, results) {
                            log('SQL Batch Executed, ' + sql, tx);
                            res(results);
                        }, function (_tx, e) {
                            rej(e);
                        });
                    });
                });
                resolve(Promise.all(promiseArr));
            });
        });
    }
    ;
    getTable(tableName) {
        return this.tables[tableName];
    }
    ;
    async createTable(tableName, o) {
        const table = new WebsqlTable(tableName, this.db);
        await table.create(o);
        return table;
    }
    ;
}

export { WebsqlWrapper };
