'use strict'
//singlePage.session - save data for init the stat of page
singlePage.session = { tree: { l: { id: [] }, r: { id: [] }, }, }
singlePage.session.readSqlForId = { 'SelectADN': [373960, 373826, 373845, 373975,], }

conf.pageInfo = {
    techconf: 'Тех.Стан',
    tree: 'Дата.Командер',
}

//conf.sqlPaar:{sqlName:[sqlName,],}; default - sql_app.SelectADN
//sqlPaar - hierarchical dependency types of data in form of sqlName for read of data
conf.sqlPaar = {}
conf.sqlPaar.CarePlan = ['CarePlan_action_progress']
conf.sqlPaar.CarePlan_action_progress = ['CarePlan_action_reason_Observation']

conf.sqlPaar.PlanDefinition = ['PlanDefinition_action_name']
conf.sqlPaar.PlanDefinition_action_name = ['PlanDefinition_action_name']
conf.sqlPaar.ActivityDefinition = ['ActivityDefinition', 'ActivityDefinition_partOf_timing']

//i18n
conf.i18n = {}
conf.i18n.PlanDefinition = 'Визначення плану'
conf.i18n.PlanDefinition_action_name = 'Назви активностей плану'

conf.i18n.ActivityDefinition = 'Команди активності'
conf.i18n.ActivityDefinition_partOf_timing = 'Команди активності, робота за часом'

conf.i18n.CarePlan = 'План турботи'
conf.i18n.CarePlan_action_progress = 'Активності - прогрес в.01'
conf.i18n.CarePlan_action_reason_Observation = 'Обстеження причина активності'

conf.i18n.Observation = 'Спостереження'

// conf.cols_03 - sqlName columns for tree
conf.cols_03 = {}
conf.cols_03.PlanDefinition = ['name_pd']
conf.cols_03.CarePlan = ['title']
conf.cols_03.ActivityDefinition = ['title']

// rc1. What types of data are embedded in this parentID as children. SQL read name. OR
// rc2. For which identifiers the child data should be read and shown by which sqlName.
// conf.readTypeForChildren:{sqlName:[parentId,],}
conf.readTypeForChildren = {}
conf.readTypeForChildren.PlanDefinition = [373960]
conf.readTypeForChildren.CarePlan = [373826]
conf.readTypeForChildren.Observation = [373845]
conf.readTypeForChildren.ActivityDefinition = [373975]

conf.readTypeForChildren_fn = {}
// get sqlName by id for child data
conf.readTypeForChildren_fn.seekById = id => Object.keys(conf
    .readTypeForChildren).filter(k => conf.readTypeForChildren[k].includes(id))
// get sqlName by id from parent element and sqlPaar hierarchical
conf.readTypeForChildren_fn.seekByIdFromParent = id => conf
    .sqlPaar[conf.readTypeForChildren_fn.seekById(conf.eMap.SelectADN[id].parent)[0]]

class RWData02Factory extends RWDataFactory {
    constructor($http, $q) { super($http, $q) }

    // conf.eMap, conf.parentChild - keep data in JS memory

    // conf.eMap - map sqlName.docId:dataNode

    // conf.parentChild - parentId:[docId,]
    // - info hierarchically embedded data
    // - broken down by to form of read
    readChildren = (parentId, sqlName) => {
        console.log(parentId)
        // init variable for DB_node data, dependent to form of read 
        // sqlName - name form of read the DB_node data
        if (!sqlName) sqlName = 'SelectADN'

        // init conf.parentChild && conf.eMap
        !conf.parentChild ? conf.parentChild = {} : null
        !conf.parentChild[sqlName] ? conf.parentChild[sqlName] = {} : null
        !conf.parentChild[sqlName][parentId] ? conf
            .parentChild[sqlName][parentId] = [] : null
        !conf.eMap[sqlName] ? conf.eMap[sqlName] = {} : null
        console.log(sqlName)
        let sqlReadForm = replaceSql(sql_app[sqlName].sqlWithParent
        ).replace(':parentId', parentId)
        if (!sqlReadForm) sqlReadForm = sql_app.SelectADN.sql
            + ' WHERE d.parent IN (' + parentId + ')'
        // action
        this.readSql(sqlReadForm, r => ar.forEach(r.list, (data, i) => {
            const id = data.row_id || data.doc_id
            console.log(id, data)
            conf.eMap[sqlName][id] = data
            conf.parentChild[sqlName][parentId][i] = id
        }))
    }

    readTreeIdObjects = (
    ) => {
        //
        // sqlName - name form of read the DB_node data
        let sqlName = 'SelectADN'
        let sqlReadForm = sql_app[sqlName].sql
            + ' WHERE d.doc_id IN (' + urlMap.tree.replaceAll('_', ',') + ')'
        !conf.eMap[sqlName] ? conf.eMap[sqlName] = {} : null
        this.readSql(sqlReadForm, r => ar.forEach(r.list
            , data => conf.eMap[sqlName][data.doc_id] = data
        ))
        ar.forEach(singlePage.session.tree, (lrV, lr) => ar.forEach(lrV.id, idFromTree => {
            console.log(lrV, lr, idFromTree)
        }))
    }

}; app.factory('dataFactory', RWData02Factory)

const nodeIdMenu = {}
nodeIdMenu.setSubMenu1 = typeSubMenu => nodeIdMenu
    .subMenu = typeSubMenu == nodeIdMenu.subMenu ? null : typeSubMenu

// nodeIdMenu.setSubMenu = (typeSubMenu, id, lr) => nodeIdMenu
//     .subMenu = typeSubMenu + (id ? '_' + id : '') + (lr ? lr + '_' : '')

class PageLogicFactory {
    nodeIdMenu = nodeIdMenu
    conf = conf; singlePage = singlePage; sp = singlePage;
    constructor(dataFactory) { }

    onOffChildren = (lr, id) => {
        console.log(lr, id, this.sp)
        if (!singlePage.session.tree[lr].openIds) singlePage.session.tree[lr].openIds = []
        //1. add|del id to openIds
        singlePage.session.tree[lr].openIds.includes(id) ? singlePage.session.tree[lr]
            .openIds = singlePage.session.tree[lr].openIds.filter(n => n != id) :
            singlePage.session.tree[lr].openIds.push(id)
        //2. select green
        singlePage.session.tree[lr].selectedId = id
        //3.

    }

    initSession = () => JSON.stringify(singlePage.session)
}; app.factory('pageLogic', PageLogicFactory)

class ChildrenController extends Abstract02Controller {
    constructor(dataFactory, pageLogic) {
        super(pageLogic)
        parse.urlMapChindren()
        let sqlName = conf.readTypeForChildren_fn.seekById(urlMap.children.parentId)
        if (sqlName.length == 0)
            sqlName = conf.readTypeForChildren_fn.seekByIdFromParent(urlMap.children.parentId)
        console.log(123, sqlName)
        dataFactory.readChildren(urlMap.children.parentId, sqlName[0])
    }
}; route01Controller(ChildrenController, ['children_:id'], 'tree.html')

const parse = {}
parse.urlMapChindren = () => {
    console.log(urlMap.children)
    const children = {
        lr: urlMap.children.split('_')[0], parentId: 1 * urlMap.children.split('_')[1],
    }
    console.log(children)
    urlMap.children = children
}

parse.sessionFromTree = () => ar.forEach(urlMap.tree
    .split(','), (ids, rl) => ar.forEach(ids
        .split('_'), (id, k) => singlePage
            .session.tree[['l', 'r'][rl]].id[k] = 1 * id))

class TechconfController extends Abstract02Controller {
    constructor(dataFactory, pageLogic) {
        super(pageLogic)
        console.log(123)
    }
}; route01Controller(TechconfController, ['techconf_', 'techconf_:techconf'], 'techconf.html')

class TreeController extends Abstract02Controller {
    constructor(dataFactory, pageLogic) {
        super(pageLogic)
        parse.sessionFromTree()
        console.log(123, urlMap.tree.replaceAll('_', ','))
        dataFactory.readTreeIdObjects()
    }
}; route01Controller(TreeController, ['tree_:lId,:rId'], 'tree.html')

class InitPageController extends Abstract02Controller {//старт сторінки
    constructor(dataFactory, pageLogic) {
        super(pageLogic)
        console.log(singlePage)
    }
}; route01Controller(InitPageController)

singlePage.view2 = o => JSON.stringify(o, null, 2)
singlePage.view1 = () => singlePage.view2(singlePage.session)
singlePage.view = () => console.log(singlePage.view1())
// ctrlName = 'cr'; 
app.config(RouteProviderConfig)

sql_app.ActivityDefinition = {
    sql: 'SELECT d.doc_id row_id, d.parent, d.doc_id title_id, s.value title \n\
    FROM doc d, string s WHERE s.string_id=d.doc_id AND d.reference=373500',

    sqlWithParent: 'SELECT d.* FROM (:sql_app.ActivityDefinition ) d \n\
    LEFT JOIN sort ON sort_id=row_id WHERE d.parent=:parentId ORDER BY sort',
}
sql_app.ActivityDefinition_partOf_timing = {
    sql: 'SELECT x.*, partOf.value partof_title, partof.doc_id partof_id \n\
    FROM (:sql_app.ActivityDefinition ) x \n\
    LEFT JOIN (SELECT * FROM doc,string \n\
    WHERE reference2=string_id) partOf ON partOf.parent=row_id AND partOf.reference= 369781',

    sqlWithParent: 'SELECT d.* FROM (:sql_app.ActivityDefinition_partOf_timing ) d \n\
    LEFT JOIN sort ON sort_id=row_id WHERE d.parent=:parentId ORDER BY sort',
}
sql_app.CarePlan = {
    sql: 'SELECT d.doc_id row_id, d.parent, d.doc_id title_id, s.value title \n\
    FROM doc d, string s WHERE s.string_id=d.doc_id AND d.reference=372080 ',

    sqlWithParent: 'SELECT d.* FROM (:sql_app.CarePlan ) d \n\
    LEFT JOIN sort ON sort_id=row_id \n\
    WHERE d.parent=:parentId ORDER BY sort',
}
sql_app.CarePlan_action_progress = {
    sql: 'SELECT d.doc_id progress_id, s.value progress, d.parent progress_parent \n\
    FROM doc d, string s WHERE s.string_id=d.doc_id AND d.reference= 373836',

    sqlWithParent: 'SELECT progress_id row_id, y.* FROM (:sql_app.CarePlan_action ) x \n\
    , (:sql_app.CarePlan_action_progress ) y LEFT JOIN sort s ON s.sort_id=progress_id \n\
    WHERE action_id=progress_parent AND x.action_parent=:parentId ORDER BY sort',
}
sql_app.PlanDefinition_action_name = {
    sql: 'SELECT s.value activityname, d.doc_id actionname_id, d.* \n\
    FROM doc d, string s where s.string_id=d.reference2 and d.reference=369920',

    sqlWithParent: 'SELECT actionname_id row_id, x.* FROM (:sql_app.PlanDefinition_action_name ) x \n\
    LEFT JOIN sort s ON s.sort_id=actionname_id \n\
    WHERE parent=:parentId ORDER BY sort',
}
sql_app.Observation = {
    sql: 'SELECT d.doc_id row_id, d.doc_id code_id, d.parent, s.value code FROM doc d, string s \n\
    WHERE s.string_id=d.doc_id',

    sqlWithParent: 'SELECT code_id row_id, x.* FROM (:sql_app.Observation ) x \n\
    LEFT JOIN sort s ON s.sort_id=code_id \n\
    WHERE parent=:parentId ORDER BY sort',
}
sql_app.PlanDefinition = {
    sql: 'SELECT d.doc_id row_id, d.parent, d.doc_id plandefinition_id, s.value name_pd FROM doc d, string s \n\
    WHERE d.reference= 371998 and s.string_id=d.doc_id',

    sqlWithParent: 'SELECT d.* FROM (:sql_app.PlanDefinition ) d LEFT JOIN sort s ON s.sort_id=row_id \n\
    WHERE d.parent=:parentId ORDER BY sort',
}
