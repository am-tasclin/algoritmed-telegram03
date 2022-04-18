'use strict'
app.factory('dataFactory', RWDataFactory)

session.selected = {}
session.mc = {
    l: {
        listName: 'plandefinition',
        // listName: 'careplan',
        selectedId: {}
    },
    r: {
        listName: 'careplan', selectedId: {
            // careplan: 373833,
            careplan: 373828,
        }
    },
    //r: { listName: 'observation', selectedId: {} },
}

console.log(JSON.stringify(session, null, 2))

conf.objList = ['observation', 'careplan', 'plandefinition']
conf.mc = { l: {}, r: {} }

conf.careplan = {
    name: 'План турботи',
    colList: ['title_id', 'title'],
    subDataList: ['careplan_action_progress'],
}

conf.planDefinition_action_name = {//
    name: 'Назва активності плану',
    colList: ['actionname_id', 'activityname'],
    subDataList: ['planDefinition_action_name'],
}
conf.plandefinition = {//керування планом
    name: 'Визначення плану',
    colList: ['plandefinition_id', 'name_pd'],
    subDataList: ['planDefinition_action_name'],
}

conf.observation = {//словник спостережень
    name: 'Спостереження',
    colList: ['code_id', 'code'],
}

conf.careplan_action_reason_observation = {
    name: 'Обстеження причина активності',
    colList: ['reason_code', 'observation'],
}

conf.careplan_action_progress = {
    name: 'Активності',
    colList: ['progress_id', 'progress'],
    subDataList: ['careplan_action_reason_observation'],
}

sql_app.planDefinition_action_name = {
    sql: 'SELECT s.value activityname, d.doc_id actionname_id, d.* \n\
    FROM doc d, string s where s.string_id=d.reference2 and d.reference=369920',

    sqlWithParent: 'SELECT actionname_id row_id, x.* FROM (:sql_app.planDefinition_action_name ) x \n\
    LEFT JOIN sort s ON s.sort_id=actionname_id \n\
    WHERE parent=:parentId ORDER BY sort',
}

sql_app.careplan_action_progress = {
    sql: 'SELECT d.doc_id progress_id, s.value progress, d.parent progress_parent \n\
    FROM doc d, string s WHERE s.string_id=d.doc_id AND d.reference= 373836',

    sqlWithParent: 'SELECT progress_id row_id, y.* FROM (:sql_app.careplan_action ) x \n\
    , (:sql_app.careplan_action_progress ) y LEFT JOIN sort s ON s.sort_id=progress_id \n\
    WHERE action_id=progress_parent AND x.action_parent=:parentId ORDER BY sort',
}

sql_app.careplan_action = {
    sql: 'SELECT d.parent action_parent, d.doc_id action_id FROM doc d WHERE d.reference=368789',
}

sql_app.careplan = {
    sql: 'SELECT d.doc_id row_id, d.doc_id title_id, s.value title \n\
    FROM doc d, string s WHERE s.string_id=d.doc_id AND d.reference=372080 AND d.parent = 373826',
}

console.log(123)

sql_app.plandefinition = {
    sql: 'SELECT d.doc_id row_id, d.doc_id plandefinition_id, s.value name_pd FROM doc d, string s \n\
    WHERE d.reference= 371998 and d.parent=373960 and s.string_id=d.doc_id',
}
sql_app.observation = {
    sql: 'SELECT d.doc_id row_id, d.doc_id code_id, s.value code FROM doc d, string s \n\
    WHERE s.string_id=d.doc_id AND d.parent = 373845',
}
class AbstractController {
    conf = conf; session = session
    constructor(dataFactory) {
        this.dataFactory = dataFactory
        console.log(123)
        console.log(sql_app.careplan_action_reason_observation.sqlWithParent)
        console.log(replaceSql(sql_app.careplan_action_reason_observation.sqlWithParent)
            .replace(':parentId', 373843))
    }

    initSession = () => angular.forEach(session.mc, (lrv, lr) => angular.forEach(lrv, (v, selectedId
    ) => selectedId == 'selectedId' && angular.forEach(v, (row_id, listName
    ) => angular.forEach(conf[listName].subDataList, listName => this.dataFactory
        .readSql(replaceSql(sql_app[listName].sqlWithParent).replace(':parentId', row_id
        ), r => conf.mc[lr][listName] = { d: r })
    ))))

    openSubData_x = (lr, row_id, listName) => {
        console.log(lr, row_id, listName)
    }

    openSubData = (lr, row_id, listName) => {
        console.log(session.mc[lr], listName, row_id)
        // this.openSubDataTest(lr, row, listName)
        session.mc[lr].selectedId[listName] = session.mc[lr].selectedId[listName] == row_id ? null : row_id
        console.log(session.mc[lr].selectedId[listName])
        console.log(conf[listName].subDataList)
        angular.forEach(conf[listName].subDataList, listName => {
            let sql = replaceSql(sql_app[listName].sqlWithParent).replace(':parentId', row_id)
            console.log(sql)
            this.dataFactory.readSql(sql, r => conf.mc[lr][listName] = { d: r })
        })
    }

    openSubDataTest = (lr, row_id, listName) => {
        console.log(session.mc[lr], listName, 11)
        angular.forEach(conf[listName].subDataList, listName => {
            console.log(listName, row_id)
            console.log(sql_app[listName])
            console.log(replaceSql(sql_app[listName].sqlWithParent).replace(':parentId', row_id))
        })
    }

}

class InitPageController extends AbstractController {
    constructor(dataFactory) {
        super(dataFactory)
        dataFactory.readSql(sql_app.observation.sql, r => conf.observation.d = r)
        dataFactory.readSql(sql_app.careplan.sql, r => conf.careplan.d = r)
        dataFactory.readSql(sql_app.plandefinition.sql, r => conf.plandefinition.d = r)
        this.initSession()
    }

}; app.controller('InitPageController', InitPageController)
