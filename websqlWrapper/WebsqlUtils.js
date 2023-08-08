export const Utils = {};
Utils.types = ["Array", "Boolean", "Date", "Number", "Object", "RegExp", "String", 'Function'];
Utils.is = {};
for(let i = 0, c; c = Utils.types[i++];){
    Utils.is[c] = (function(type){
        return function(obj){
            if(!obj) return false;
            return Object.prototype.toString.call(obj) == "[object " + type + "]";
        }
    })(c);
}
export const log = function (args){
    console.log(...args);
}
export const emptyHandle = function(){};
export const errorHandle = function( tx, err, sql ){
    log('[error]:' + err.message + "  [sql]:" + sql);
};

// 转换 a === b && b == c 语句成sql语法
export const convertToSQL = function( sql ){
    return sql.replace( /(?:&&)/,'AND' ).replace( /(?:[==|===])+/g, '=' );
};

export const dbQuery = function(db, sql, rowParam) {
    if(sql === undefined){
        return;
    }
    return new Promise((resolve, reject) => {
        db.transaction(  
            function (transaction) {  
                // console.log(sql, rowParam)
                transaction.executeSql(sql, rowParam, function(tx, results){
                    var arr = [], row, i;
                    for (i=0; i<results.rows.length; i++) {   
                        row = results.rows.item(i); 
                       arr.push(row);
                    }
                    resolve(arr);
                }
                , function(tx, e){
                    reject(e);
                }); 
            }  
        ); 
    });
}