export const Utils: {
    types: string[];
    is: {
      [key: string]: (obj: any) => boolean;
    };
  } = {
    types: ["Array", "Boolean", "Date", "Number", "Object", "RegExp", "String", "Function"],
    is: {},
  };
  
  for (let i = 0, c: string; (c = Utils.types[i++]); ) {
    Utils.is[c] = (function (type: string) {
      return function (obj: any) {
        if (!obj) return false;
        return Object.prototype.toString.call(obj) === "[object " + type + "]";
      };
    })(c);
  }
  
  let showLogInfo = false;
  
  export const log = function (...args: any[]) {
    showLogInfo && console.log(...args);
  };
  
  export const showLog = (b: boolean) => {
    showLogInfo = b;
  };
  
  export const emptyHandle = function () {};
  
  export const errorHandle = function (_tx: any, err: Error, sql: string) {
    log('[error]:' + err.message + "  [sql]:" + sql);
  };
  
  // 转换 a === b && b == c 语句成sql语法
  export const convertToSQL = function (sql: string) {
    return sql.replace(/(?:&&)/, "AND").replace(/(?:[==|===])+/g, "=");
  };
  
  export const dbQuery = function (db: any, sql: string, rowParam?: any[]) {
    if (sql === undefined) {
      return;
    }
    return new Promise<any[]>((resolve, reject) => {
      db.transaction(
        function (transaction: any) {
          console.log(sql, rowParam);
          transaction.executeSql(
            sql,
            rowParam,
            function (_tx: any, results: any) {
              const arr: any[] = [];
              let row: any;
              for (let i = 0; i < results.rows.length; i++) {
                row = results.rows.item(i);
                arr.push(row);
              }
              resolve(arr);
            },
            function (_tx: any, e: Error) {
              reject(e);
            }
          );
        }
      );
    });
  };