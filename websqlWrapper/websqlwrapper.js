import { Utils, dbQuery } from './WebsqlUtils.js';
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
   
    /*
     * 同个事务中执行原生SQL指令
     * 
     */
    batchExec = function(arr, cb) {
        if (!Array.isArray(arr)) {
            return;
        }
        this.db.transaction(function(transaction) {
            arr.forEach(function(v) {
                var sql = v;
                transaction.executeSql(sql, [], function(tx, results) {
                    console.log('SQL Batch Executed, ' + sql);
                }, function(tx, e) {
                    cb(null);
                    errorHandle.apply(this, [tx, e, sql]);
                });
            });
        }.bind(this));
        return this;
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