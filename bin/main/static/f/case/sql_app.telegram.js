'use strict'
var sql_app = {}

sql_app.SelectADN = {
    name: 'Зчитати абстрактий вузел - TeSe',
    sql: 'SELECT d.*, dr.doctype r_doctype, s.value value_22, su.value value_u_22, f.value value_24 \n\
    , ts.value value_25, srr.value rr_value_22 \n\
    , sr.value r_value_22, dr2.doctype r2_doctype \n\
    , sr2.value r2_value_22, o.sort \n\
    FROM doc d \n\
     LEFT JOIN string s ON s.string_id=d.doc_id \n\
     LEFT JOIN string_u su ON su.string_u_id=d.doc_id \n\
     LEFT JOIN double f ON f.double_id=d.doc_id \n\
     LEFT JOIN timestamp ts ON ts.timestamp_id=d.doc_id \n\
     LEFT JOIN doc dr ON dr.doc_id=d.reference \n\
     LEFT JOIN string sr ON sr.string_id=d.reference \n\
     LEFT JOIN string srr ON srr.string_id=dr.reference \n\
     LEFT JOIN doc dr2 ON dr2.doc_id=d.reference2 \n\
     LEFT JOIN string sr2 ON sr2.string_id=d.reference2 \n\
     LEFT JOIN sort o ON sort_id=d.doc_id \n\
     ',
    oderBy: 'sort',
    rowId: 'doc_id',
    whereDocAlias: 'd',
}

sql_app.careplan_action_reason_observation = {
    sql: 'SELECT d.parent, d.doc_id reason_code, s2.value observation, d.reference2 observation_id \n\
    FROM doc d, string s2 WHERE d.reference=368605 AND s2.string_id=d.reference2 ',

    sqlWithParent: 'SELECT reason_code row_id, reason.* FROM (:sql_app.careplan_action_reason_observation ) reason \n\
    LEFT JOIN sort ON sort_id=reason_code, \n\
    (:sql_app.careplan_action_reason ) x \n\
    WHERE x.reason_id=reason.parent AND reason_parent=:parentId AND reason_code=sort_id ORDER BY sort',

}

sql_app.CarePlan_action_reason_Observation = sql_app.careplan_action_reason_observation

sql_app.careplan_action_reason = {
    sql: 'SELECT parent reason_parent, doc_id reason_id FROM doc where reference=368871',
}

var readSql2R = function (sqlN) { return sql_app[sqlN] && replaceSql(sql_app[sqlN].sql) }

// Named structured SQL to native SQL
var replaceSql = function (sql) {

    while (sql.includes(':fn_sql_app.')) {
        var sql_fnStr = sql.split(':fn_sql_app.')[1].split(' ')[0]
        var sql_fnPath = sql_fnStr.split('.')
        var fnName = firstFunctionName(sql_fnPath)
        // console.log(sql_fnStr, fnName)
        var fnParamsStr = sql_fnStr.split(fnName + '(')[1].split(')')[0]
        // console.log(sql_fnStr, fnName, '\n-fn(PARAMS)->\n', fnParamsStr)
        sql_fnPath = sql_fnStr.split('.')
        // console.log(sql_fnStr, sql_fnPath, 1)
        var fnObj = firstFunctionObj(sql_app[sql_fnPath.shift()], sql_fnPath)
        sql_fnPath = fnParamsStr.split('.')
        // console.log(sql_fnPath)
        var fnParamObj = pathValue(sql_app[sql_fnPath.shift()], sql_fnPath)
        // console.log(fnObj, fnParamObj)
        var fnSql = fnObj(fnParamObj)
        sql = sql.replace(':fn_sql_app.' + sql_fnStr, fnSql)
        // console.log(sql)
    }

    while (sql.includes(':var_sql_app.')) {
        var sql_varName = sql.split(':var_sql_app.')[1].split(' ')[0],
            sql_varPath = sql_varName.split('.'),
            sql_varVal = pathValue(sql_app[sql_varPath.shift()], sql_varPath)
        // console.log(sql_varName, '=', sql_varVal)
        sql = sql.replace(':var_sql_app.' + sql_varName, sql_varVal)
    }

    while (sql.includes(':sql_app.')) {
        var sql_name = sql.split(':sql_app.')[1].split(' ')[0]
        // console.log(sql_name)
        var sql_inner = readSql2R(sql_name)
        sql = sql.replace(':sql_app.' + sql_name, sql_inner)
    }
    return '' + sql
}

if (!String.prototype.includes)
    String.prototype.includes = function (search, start) {
        'use strict'
        if (typeof start !== 'number') start = 0
        if (start + search.length > this.length) return false
        else return this.indexOf(search, start) !== -1
    }

