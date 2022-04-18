'use strict'
app.factory('dataFactory', RWDataFactory)
singlePage.session = { tree: { l: { id: [] }, r: { id: [] }, }, }
singlePage.view = () => console.log(JSON.stringify(singlePage.session, null, 2))

setConfSqlApp('confTelegram', { eMap: {}, parentChild: {} }, {
    parentIdToDocType: {
        373960: 'PlanDefinition',
        373826: 'CarePlan',
        373845: 'Observation',
        373975: 'ActivityDefinition',
    },
})

setConfSqlApp('Observation', {//словник спостережень
    name: 'Спостереження',
    colList: ['code_id', 'code'],
}, {
    sql: 'SELECT d.doc_id row_id, d.doc_id code_id, d.parent, s.value code FROM doc d, string s \n\
    WHERE s.string_id=d.doc_id',
    sqlWithParent: 'SELECT code_id row_id, x.* FROM (:sql_app.Observation ) x \n\
    LEFT JOIN sort s ON s.sort_id=code_id \n\
    WHERE parent=:parentId ORDER BY sort',
})

setConfSqlApp('ActivityDefinition', {
    name: 'Команди активності',
    colList: ['title_id', 'title'],
    subDataList: ['ActivityDefinition', 'ActivityDefinition_partOf_timing'],
}, {
    sql: 'SELECT d.doc_id row_id, d.parent, d.doc_id title_id, s.value title \n\
    FROM doc d, string s WHERE s.string_id=d.doc_id AND d.reference=373500',

    sqlWithParent: 'SELECT d.* FROM (:sql_app.ActivityDefinition ) d \n\
    LEFT JOIN sort ON sort_id=row_id WHERE d.parent=:parentId ORDER BY sort',
})

setConfSqlApp('ActivityDefinition_partOf_timing', {
    name: 'Команди активності, робота за часом',
    colList: ['title_id', 'title', 'partof_title'],
}, {
    sql: 'SELECT x.*, partOf.value partof_title, partof.doc_id partof_id \n\
    FROM (:sql_app.ActivityDefinition ) x \n\
    LEFT JOIN (SELECT * FROM doc,string  \n\
    WHERE reference2=string_id) partOf ON partOf.parent=row_id AND partOf.reference= 369781',

    sqlWithParent: 'SELECT d.* FROM (:sql_app.ActivityDefinition_partOf_timing ) d \n\
    LEFT JOIN sort ON sort_id=row_id WHERE d.parent=:parentId ORDER BY sort',
})

setConfSqlApp('CarePlan', {
    name: 'План турботи',
    colList: ['title_id', 'title'],
    subDataList: ['CarePlan_action_progress'],
}, {
    sql: 'SELECT d.doc_id row_id, d.parent, d.doc_id title_id, s.value title \n\
    FROM doc d, string s WHERE s.string_id=d.doc_id AND d.reference=372080 ',

    sqlWithParent: 'SELECT d.* FROM (:sql_app.CarePlan ) d \n\
    LEFT JOIN sort ON sort_id=row_id \n\
    WHERE d.parent=:parentId ORDER BY sort',
})

setConfSqlApp('CarePlan_action_reason_Observation', {
    name: 'Обстеження причина активності',
    colList: ['reason_code', 'observation'],
}   // sql_app part in /f/case/sql_app.telegram.js
    // for use in java, direct run as JS-script 
)

setConfSqlApp('CarePlan_action_progress', {
    name: 'Активності - прогрес в.01',
    colList: ['progress_id', 'progress'],
    subDataList: ['CarePlan_action_reason_Observation'],
}, {
    sql: 'SELECT d.doc_id progress_id, s.value progress, d.parent progress_parent \n\
    FROM doc d, string s WHERE s.string_id=d.doc_id AND d.reference= 373836',

    sqlWithParent: 'SELECT progress_id row_id, y.* FROM (:sql_app.CarePlan_action ) x \n\
    , (:sql_app.CarePlan_action_progress ) y LEFT JOIN sort s ON s.sort_id=progress_id \n\
    WHERE action_id=progress_parent AND x.action_parent=:parentId ORDER BY sort',
})
sql_app.CarePlan_action = {
    sql: 'SELECT d.parent action_parent, d.doc_id action_id FROM doc d WHERE d.reference=368789',
}

setConfSqlApp('PlanDefinition', {//керування планом
    name: 'Визначення плану',
    colList: ['plandefinition_id', 'name_pd'],
    subDataList: ['PlanDefinition_action_name'],
}, {
    sql: 'SELECT d.doc_id row_id, d.parent, d.doc_id plandefinition_id, s.value name_pd FROM doc d, string s \n\
    WHERE d.reference= 371998 and s.string_id=d.doc_id',

    sqlWithParent: 'SELECT d.* FROM (:sql_app.PlanDefinition ) d LEFT JOIN sort s ON s.sort_id=row_id \n\
    WHERE d.parent=:parentId ORDER BY sort',
})

setConfSqlApp('PlanDefinition_action_name', {//
    name: 'Назви активностей плану',
    colList: ['actionname_id', 'activityname'],
    subDataList: ['PlanDefinition_action_name'],
}, {
    sql: 'SELECT s.value activityname, d.doc_id actionname_id, d.* \n\
    FROM doc d, string s where s.string_id=d.reference2 and d.reference=369920',

    sqlWithParent: 'SELECT actionname_id row_id, x.* FROM (:sql_app.PlanDefinition_action_name ) x \n\
    LEFT JOIN sort s ON s.sort_id=actionname_id \n\
    WHERE parent=:parentId ORDER BY sort',
})

class InitPageController extends Abstract01Controller {//старт сторінки
    constructor(dataFactory) {
        super(dataFactory)
        // dataFactory.readSql(sql_app.Observation.sql, r => conf.Observation.d = r)
        // dataFactory.readSql(sql_app.CarePlan.sql, r => conf.CarePlan.d = r)
        // dataFactory.readSql(sql_app.plandefinition.sql, r => conf.plandefinition.d = r)
        // this.initSession()
    }
}; route01Controller(InitPageController)

class Abstract02Controller extends Abstract01Controller {
    constructor(dataFactory) { super(dataFactory) }

    initTreeFromSinglePageSession = (
    ) => ar.forEach(singlePage.session.tree, (lrV, lr) => ar.forEach(lrV.id, idFromTree => {
        let parentIdToDocType = sql_app.confTelegram.parentIdToDocType[idFromTree]
        console.log(singlePage.session.tree[lr])
        console.log(singlePage.session.tree[lr].openIds, idFromTree)
        if (!singlePage.session.tree[lr].openIds)
            singlePage.session.tree[lr].openIds = {}
        if (singlePage.session.tree[lr].openIds[idFromTree])
            parentIdToDocType = singlePage.session.tree[lr].openIds[idFromTree][0]
        console.log(lr, idFromTree, parentIdToDocType)
        if (parentIdToDocType) {
            this.initOpenIds(lr, idFromTree, parentIdToDocType)
            let sql = replaceSql(sql_app[parentIdToDocType].sqlWithParent
            ).replace(':parentId', idFromTree)
            this.dataFactory.readSql(sql, r => setConfTelegram_eMap(r, parentIdToDocType, idFromTree))
            // dataFactory.readSql(sql, r => conf[parentIdToDocType].d = r)
            let sql2 = sql_app.SelectADN.sql + ' WHERE d.doc_id=' + idFromTree
            this.dataFactory.readSql(sql2, r => conf.eMap[idFromTree] = r.list[0])
        }
    }))

    readFhirDataWithParent = (readFhirDataName, parentId) => sql_app[readFhirDataName] && this.dataFactory
        .readSql(replaceSql(sql_app[readFhirDataName].sqlWithParent)
            .replace(':parentId', parentId)
            , r => setConfTelegram_eMap(r, readFhirDataName, parentId))

    initOpenChildFromSession = () => ar.forEach
        (singlePage.session.tree, (lrV, lr) => ar.forEach
            (lrV.openIds, (openNames, parentId) => ar.forEach
                (openNames, readFhirDataName => (!conf
                    .confTelegram.parentChild[readFhirDataName] || !conf
                        .confTelegram.parentChild[readFhirDataName][parentId]
                ) && this.readFhirDataWithParent(readFhirDataName, parentId))))

    //because the second click on the same link does not work
    // clickChildren = (lr, id, listNameP) => {
    onOffChildren = (lr, id) => {
        //on|off children: onOffChildren
        //open|close tree 
        singlePage.session.tree[lr].selectedId = id
        if (singlePage.session.tree[lr].openIds[id]) {
            if (!singlePage.session.tree[lr].closeIds)
                singlePage.session.tree[lr].closeIds = {}
            singlePage.session.tree[lr].closeIds[id] = singlePage
                .session.tree[lr].openIds[id]
            delete singlePage.session.tree[lr].openIds[id]
        } else if (singlePage.session.tree[lr].closeIds) {
            singlePage.session.tree[lr].openIds[id] = singlePage
                .session.tree[lr].closeIds[id]
            delete singlePage.session.tree[lr].closeIds[id]
        }
    }

    initOpenIds = (lr, parentId, childrenType) => {
        console.log(lr, parentId, childrenType)
        if (!singlePage.session.tree[lr].openIds)
            singlePage.session.tree[lr].openIds = {}
        const isIdClosed = singlePage.session.tree[lr].closeIds && singlePage.session.tree[lr].closeIds[parentId]
        if (childrenType && !isIdClosed) {
            if (!singlePage.session.tree[lr].openIds[parentId])
                singlePage.session.tree[lr].openIds[parentId] = []
            if (!singlePage.session.tree[lr].openIds[parentId].includes(childrenType))
                singlePage.session.tree[lr].openIds[parentId][0] = childrenType
            //singlePage.session.tree[lr].openIds[parentId].push(childrenType)
        }
    }

}

class ChildrenController extends Abstract02Controller {
    constructor(dataFactory) {
        super(dataFactory)
        console.log(123)
        this.initOpenChildUrlToSession()
        console.log(124)
        ar.forEach
            (singlePage.session.tree, (lrV, lr) => ar.forEach
                (lrV.openIds, (openNames, parentId) => ar.forEach
                    (openNames, readFhirDataName => {
                        console.log(readFhirDataName)
                        let sql = replaceSql(sql_app[readFhirDataName].sqlWithParent)
                            .replace(':parentId', parentId)
                        console.log(sql)
                    })))

        this.initOpenChildFromSession()
        console.log(125)
    }

    initOpenChildUrlToSession = () => {
        const children = {
            lr: urlMap.children.split('_')[0]
            , parentId: urlMap.children.split('_')[1],
        }
        children.parentType = urlMap.children
            .replace(children.lr + '_' + children.parentId + '_', '')
        children.childrenType = children.parentType.split(':')[1]
        children.parentType = children.parentType.split(':')[0]
        urlMap.children = children
        console.log(urlMap.children)
        if (urlMap.children.parentType)
            if (conf[urlMap.children.parentType].subDataList)
                if (!urlMap.children.childrenType)
                    urlMap.children.childrenType
                        = conf[urlMap.children.parentType].subDataList[0]
        this.initOpenIds(urlMap.children.lr, urlMap.children.parentId, urlMap.children.childrenType)
    }

}; route01Controller(ChildrenController, ['children_:id'], 'tree.html')

class InitFromUrlController extends Abstract02Controller {
    constructor(dataFactory) {
        super(dataFactory)
        singlePage.session = JSON.parse(decodeURI(singlePage.UrlMap()['init']))
        this.initTreeFromSinglePageSession()
        this.initOpenChildFromSession()

    }
}; route01Controller(InitFromUrlController, ['init_:initJson'], 'tree.html')

class TreeController extends Abstract02Controller {
    constructor(dataFactory) {
        super(dataFactory)
        this.initSessionFromTree()
        console.log(JSON.stringify(singlePage.session, null, 2))
        this.initTreeFromSinglePageSession()
    }

    initSessionFromTree = () => ar.forEach(singlePage.UrlMap()['tree']
        .split(','), (ids, rl) => ar.forEach(ids
            .split('_'), (id, k) => singlePage
                .session.tree[!rl ? 'l' : 'r'].id[k] = 1 * id))
}; route01Controller(TreeController, ['tree_:lId,:rId'], 'tree.html')
// }; route01Controller(TreeController, ['tree_:lId,:rId'], 'mc_lr_part.html')

let setConfTelegram_eMap = (r, dataName, parentId) => {
    if (!conf.confTelegram.eMap[dataName]) conf.confTelegram.eMap[dataName] = {}
    if (!conf.confTelegram.parentChild[dataName]) conf.confTelegram.parentChild[dataName] = {}
    console.log(dataName, conf.confTelegram)
    ar.forEach(r.list, o => {
        conf.confTelegram.eMap[dataName][o.row_id] = o
        if (!conf.confTelegram.parentChild[dataName][parentId])
            conf.confTelegram.parentChild[dataName][parentId] = []
        if (!conf.confTelegram.parentChild[dataName][parentId].includes(o.row_id))
            conf.confTelegram.parentChild[dataName][parentId].push(o.row_id)
    })
}

app.config(RouteProviderConfig)
