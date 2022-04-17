app.factory('dataFactory', RWDataFactory)
app.config(RouteProviderConfig)
app.directive('amSqlHtml', AmSqlHtml)

conf.episode_telegram = {}
sql_app.episode_telegram = {
    sql: 'SELECT d.doc_id episode_id, ts2.value ts FROM doc d,doc d2 , timestamp ts2 \n\
    where d.reference2=:patientId and d2.parent=d.doc_id and d2.reference=368894 \n\
    and ts2.timestamp_id=d2.doc_id'
}

conf.patient_family_name = {}
sql_app.patient_family_name = {
    name: 'Пацієнти я з тобою телеграм чат-бот',
    sql: 'SELECT p.doc_id patient_id, hn.*, tid.value telegram_id FROM doc p \n\
            LEFT JOIN (:sql_app.HumanName_family_name ) hn ON hn.family_id = p.reference2 \n\
            LEFT JOIN (SELECT * FROM doc, integer_u WHERE doc_id=integer_u_id ) tid ON tid.parent=p.doc_id \n\
            WHERE p.reference=373423',
}

sql_app.patient_family_name.sqlHtml = {
    patient_id: '<a data-ng-click="ctrl.clickPatient(r)" href="#!/hy_{{r.patient_id}}"> {{r[k]}} </a>',
}

sql_app.HumanName_family_name = {
    name: "Ім'я Призвище",
    sql: 'SELECT n.value name_v, f.value family_v, d.doc_id family_id, dn.doc_id name_id FROM doc d \n\
    LEFT JOIN string f ON d.doc_id=f.string_id \n\
    LEFT JOIN doc dn ON d.doc_id=dn.parent AND dn.reference=372117 \n\
    LEFT JOIN string n ON dn.doc_id=n.string_id \n\
    WHERE d.reference = 372116',
}

class AbstractController {
    constructor(dataFactory) { this.dataFactory = dataFactory }
    conf = conf; session = session
    getSqlApp = name => sql_app[name]
}

class InitPageController extends AbstractController {
    constructor(dataFactory) { super(dataFactory) }
    patientSql = () => replaceSql(sql_app.patient_family_name.sql) + ' AND p.parent=373825'
    readPatient = sql => this.dataFactory.readSql(sql, r => {
        conf.patient_family_name.d = r
        conf.sqlKeyName = 'patient_family_name'
    })
}; app.controller('InitPageController', InitPageController)

class PatientListController extends InitPageController {
    constructor(dataFactory) {
        super(dataFactory)
        this.readPatient(this.patientSql())
    }
}; app.controller('PatientListController', PatientListController)

class HistoryController extends InitPageController {
    constructor(dataFactory) {
        super(dataFactory)
        this.readPatient(this.patientSql() + ' AND p.doc_id=' + singlePage.UrlMap().hy)
        let sqlEpisode = sql_app.episode_telegram.sql.replace(':patientId', singlePage.UrlMap().hy)
        console.log(sqlEpisode)
        dataFactory.readSql(sqlEpisode, r => conf.episode_telegram.d = r)
    }
}; app.controller('HistoryController', HistoryController)

singlePage['hy_:pt_id'] = { controller: 'HistoryController', templateUrl: '/f/case/history.html', }
singlePage['pl'] = { controller: 'PatientListController', templateUrl: '/f/case/sql.html', }
