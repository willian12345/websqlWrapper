import { Utils, convertToSQL, log, dbQuery } from './WebsqlUtils';

export class WebsqlTable {
  name: string;
  db: any;

  constructor(name: string, db: any,) {
    this.name = name;
    this.db = db;
  }

  create(o: any){
    var sql = '',
      s = '';
    if (!Utils.is.Object(o)) {
      log('定义表格需要传入字段对象');
      return;
    }
    s = JSON.stringify(o).replace(/[":\{\}]/g, ' ');
    sql = 'CREATE TABLE IF NOT EXISTS ' + this.name + ' (' + s + ')';
    return this.query(sql);
  };

  async query(sql: string, rowParam?: any[], cb?: (result: any) => void){
    const result = await dbQuery(this.db, sql, rowParam);
    if (Utils.is.Function(cb)) {
        cb && cb(result);
    }
    return result;
  };

  count(sql: string, cb?: (result: any) => void) {
    return this.query(sql, undefined, function (r: any) {
      if (Utils.is.Function(cb)) {
        cb && (r);
      }
    });
  };

  update(values: any, where: string, cb?: (result: any) => void){
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
  };

  insert(values: any, cb?: (result: any) => void) {
    var k, filed, _values;
    if (!Utils.is.Object(values)) return false;
    filed = [];
    _values = [];
    for (k in values) {
      filed.push(k);
      _values.push(values[k]);
    }
    filed = filed.join(',');

    var sql = 'INSERT INTO ' + this.name + '(' + filed + ') VALUES (' + filed.replace(/[a-zA-Z-_\d]+/g, '?') + ');';
    return this.query(sql, _values, cb);
  };
  async save(values: any, key: string, cb?: (result: any) => void) {
    let where, sql;
    if (!this.name || !Utils.is.Object(values) || !key) return this;
    sql = 'SELECT count(*) FROM ' + this.name;
    if (Utils.is.String(key)) {
      where = key + "='" + values[key] + "'";
      sql += ' WHERE ' + where;
    }
    sql += ' ;';
    const r = await this.count(sql);
    if(!r) return;
    if (r.length === 0) {
      return this.insert(values, cb);
    } else {
      return this.update(values, key, cb);
    }
  };

  get (where?: string) {
    var sql = 'SELECT * FROM ' + this.name;
    if (where) {
      sql += ' WHERE ' + convertToSQL(where);
    }
    sql += ';';
    return this.query(sql);
  };

  del (where?: string) {
    var sql = 'DELETE FROM ' + this.name;
    if (where) {
      sql += ' WHERE ' + convertToSQL(where);
    }
    sql += ';';
    return this.query(sql);
  };

  drop (tableName: string) {
    this.query(`DROP TABLE IF EXISTS ${tableName};`, undefined,  () => {
      log('dropped!');
    });
    log(`Table ${tableName} has been dropped.`);
    return this;
  };

  batch (arr: { type: string; args: any[] }[]) {
    if (!Array.isArray(arr)) {
      return;
    }
    arr.forEach((v) => {
        //@ts-ignore
      this[v.type].apply(this, v.args);
    });
    return this;
  };
}