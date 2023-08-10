import { Utils, convertToSQL, log, dbQuery } from './WebsqlUtils.js';

/**
 * [数据表构造函数]
 * eg: db.instance('codebook').get('code=2', function(){})
 */
export class WebsqlTable {
    constructor(name, db, o, cb) {
        this.name = name;
        this.db = db;
    }
    create = (o) => {
        var sql = '', s = '';
        if (!Utils.is.Object(o)) {
            log('定义表格需要传入字段对象');
            return;
        }
        s = JSON.stringify(o).replace(/[":\{\}]/g, ' ');
        sql = 'CREATE TABLE IF NOT EXISTS ' + this.name + ' (' + s + ')';
        return this.query(sql);
    }
    query = async (sql, rowParam, cb) => {
        const result = await dbQuery(this.db, sql, rowParam)
        if (Utils.is.Function(cb)) {
            cb(result)
        }
        return result
    }
    count = function (sql, cb) {
        return this.query(sql, null, function (r) {
            if (Utils.is.Function(cb)) {
                cb(r)
            }
        });
    }
    update = function (values, where, cb) {
        var k, filed, _values;
        if (!Utils.is.Object(values)) return false;

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
    insert = function (values, cb) {
        var k, filed, _values;
        if (!Utils.is.Object(values)) return false;
        filed = [];
        _values = [];
        for (k in values) {
            filed.push(k);
            _values.push(values[k])
        }
        filed = filed.join(',');
        var sql = 'INSERT INTO ' + this.name + '(' + filed + ') VALUES (' + filed.replace(/[a-zA-Z-_\d]+/g, '?') + ');';
        return this.query(sql, _values, cb);
    }
    save = async (values, key, cb) => {
        let where, sql;
        if (!this.name || !Utils.is.Object(values) || !key) return this;
        sql = 'SELECT count(*) FROM ' + this.name;
        if (Utils.is.String(key)) {
            where = key + "='" + values[key] + "'";
            sql += ' WHERE ' + where;
        }
        sql += ' ;';
        const r = await this.count(sql);
        if (r === 0) {
            return this.insert(values, cb);
        } else {
            return this.update(values, key, cb);
        }
    }
    /**
     * [get 查询数据]
     * @param  {[type]}   where     [SQL条件语句]
     * @param  {Function} cb        [回调]
     * @return {[type]}             [this]
     */
    get = function (where) {
        var sql = 'SELECT * FROM ' + this.name;
        if (Utils.is.String(where)) {
            sql += ' WHERE ' + convertToSQL(where);
        }
        sql += ';';
        return this.query(sql);
    }
    /**
     * [del 删除命令]
     * @param  {[String]}   where     [SQL条件语句]
     * @param  {Function} cb        [回调]
     * @return {[type]}             [this]
     */
    del = function (where) {
        var sql = 'DELETE FROM ' + this.name;
        if (where) {
            sql += ' WHERE ' + convertToSQL(where);
        }
        sql += ';';
        return this.query(sql, cb);
    }
    /**
     * [drop 删除表]
     * @param  {[String]} tableName [tabel名称]
     * @return {[Object]}           [this]
     */
    drop = function (tableName) {
        this.query("DROP TABLE IF EXISTS " + tableName + ";", function () {
            log('dropped!');
        });
        log("Table " + tableName + " has been dropped.");
        return this;
    }

    /**
     * [batch 批处理命令, 可批量进行save, insert, update, del]
     * @param  {Array}   arr   [批处理命令集，型如{type: "update", args: ['表名',{id:1, name:'修改'},'id', callback]}]		
     */
    batch = function (arr) {
        if (!Array.isArray(arr)) {
            return;
        }
        arr.forEach((v) => {
            this[v.type].apply(this, v.args);
        });
        return this;
    }

}