import { log, showLog, dbQuery } from './WebsqlUtils';
import { WebsqlTable } from "./WebsqlTable";

interface Options {
  name: string;
  version: string;
  displayName: string;
  maxSize?: number;
  success?: (db: any) => void;
  fail?: (e: any) => void;
}

export class WebsqlWrapper {
  tables: { [key: string]: WebsqlTable } = {};
  db: any = null;
  events: any = {};

  query = (sql: string, rowParam?: any[]) => {
    return dbQuery(this.db, sql, rowParam);
  };

  constructor(opts: Options) {
    try {
      if (!window.openDatabase) {
        alert('Databases are not supported in this browser.');
      } else {
        var shortName = opts.name;
        var version = opts.version;
        var displayName = opts.displayName;
        var maxSize = opts.maxSize || 100000; //  bytes

        this.db = window.openDatabase(shortName, version, displayName, maxSize);
        opts.success && opts.success.call(this, this.db);
      }
    } catch (e) {
      if (e == 2) {
        // Version number mismatch.
        console.log("Invalid database version.");
      } else {
        console.log("Unknown error " + e + ".");
      }
      opts.fail && opts.fail.call(this, e);
      return;
    }
  }

  static showLog = (b: boolean) => {
    showLog(b);
  };

  batchExec (arr: string[]) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(arr)) {
        reject('参数需要传递 SQL 数字串数组');
      }
      this.db.transaction((transaction: any) => {
        const promiseArr = arr.map(function (sql) {
          return new Promise((res, rej) => {
            transaction.executeSql(
              sql,
              [],
              function (tx: any, results: any) {
                log('SQL Batch Executed, ' + sql, tx);
                res(results);
              },
              function (_tx: any, e: any) {
                rej(e);
              }
            );
          });
        });
        resolve(Promise.all(promiseArr));
      });
    });
  };

  getTable(tableName: string){
    return this.tables[tableName];
  };

  async createTable (tableName: string, o: any){
    const table = new WebsqlTable(tableName, this.db);
    await table.create(o);
    return table;
  };
}

