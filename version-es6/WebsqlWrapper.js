import { log, showLog, dbQuery } from './WebsqlUtils.js';
import { WebsqlTable } from "./WebsqlTable.js";

export class WebsqlWrapper {
    tables = []
    db = null
    query = (sql, rowParam, cb) => {
        return dbQuery(this.db, sql, rowParam, cb)
    }
    constructor(opts){
        try {  
            if (!window.openDatabase) {  
                alert('Databases are not supported in this browser.');  
            } else {  
                var shortName = opts.name;  
                var version = opts.version;  
                var displayName = opts.displayName;  
                var maxSize = opts.maxSize || 100000; //  bytes 
            
    
                this.db = openDatabase(shortName, version, displayName, maxSize);
                opts.success && opts.success.call(this, this.db);
            }  
        } catch(e) {
            if (e == 2) {
                // Version number mismatch.  
                console.log("Invalid database version.");  
            } else {  
                console.log("Unknown error "+e+".");  
            }  
            opts.fail && opts.fail.call(this, e);
            return ;
        }
        this.events = {};  
    }
    /**
     * 是否开启日志输出
     * @param {boolean} b 
     */
    static showLog = (b) => {
        showLog(b)
    }
    /**
     * 同个事务中批量执行原生SQL指令
     * 
     * @param {string[]]} arr 
     * @returns 
     */
    batchExec = function(arr) {
        return new Promise((resolve, reject) => {
            if (!Array.isArray(arr)) {
                reject('参数需要传递 SQL 数字串数组')
            }
            this.db.transaction((transaction) => {
                 const promiseArr = arr.map(function(sql) {
                    return new Promise((res, rej) => {
                        transaction.executeSql(sql, [], function(tx, results) {
                            log('SQL Batch Executed, ' + sql, tx);
                            res(results)
                        }, function(tx, e) {
                            rej(e);
                        });
                    })
                    
                });
                resolve(Promise.all(promiseArr))
            });
        })
    }
    /**
     * [instance 表实例]
     * @param  {[string]} tableName [table名]
     * @return {[WebsqlTable]}           [table]
     */
    getTable = (tableName) => {
        return this.tables[tableName];
    }
    createTable= async (tableName, o) => {
        const table = new WebsqlTable(tableName, this.db, o)
        await table.create(o)
        return table;
    }
}