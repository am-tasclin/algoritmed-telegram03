'use strict'
var ar = angular
const session = {}, conf = {}, singlePage = {}
conf.eMap = {}
var app = angular.module("app", ['ngRoute', 'ngResource', 'ngSanitize'])
angular.element(() => angular.bootstrap(document, ['app']))

let ctrlName='ctrl'
// app.config(RouteProviderConfig)
class RouteProviderConfig {
    constructor($routeProvider) {
        console.log('RouteProviderConfig', Object.keys(singlePage))
        angular.forEach(singlePage, (v, k) => {
            if (v.controller) {
                if (!v.controllerAs) v.controllerAs = ctrlName
                // console.log(k)
                $routeProvider.when("/" + k, v)
            }
        })
        if (singlePage.index_template)
            $routeProvider.otherwise({ templateUrl: singlePage.index_template })
        else
            $routeProvider.otherwise({ template: "<h1>?</h1><p>Hi API</p>" })
    }
}

class AmSqlHtml {
    constructor($compile) { this.$compile = $compile }
    link = (s, e) => {
        let sqlE = sql_app[conf.sqlKeyName]
        if (sqlE.sqlHtml)
            if (sqlE.sqlHtml[s.k] != null) {
                e.html(sqlE.sqlHtml[s.k])
                this.$compile(e.contents())(s)
            }
    }
    restrict = 'A'
}

class RWDataFactory {
    constructor($http, $q) { this.$http = $http; this.$q = $q }
    urlSql = '/r/url_sql_read_db1'
    sqlRowLimit = 50

    httpPostSql = params => {
        let deferred = this.$q.defer()
        this.$http.post(this.urlSql, params)
            .then(response => deferred.resolve(response.data)
                , response => console.error(response.status))
        return deferred.promise
    }

    httpGetSql = params => {
        let deferred = this.$q.defer()
        if (params.sql) {
            if (params.limit) sqlRowLimit = params.limit
            params.sql = params.sql + ' LIMIT ' + this.sqlRowLimit
            this.$http.get(this.urlSql, { params: params })
                .then(response => deferred.resolve(response.data)
                    , response => console.error(response.status))
        } else deferred.resolve({ hello: 'Hello World! no SQL' })
        return deferred.promise
    }
    // deferred.reject(response.status)
    // https://metanit.com/web/angular/3.3.php

    readSql = (sql, fn) => this.httpGetSql({ sql: sql }).then(fn)
    writeSql = (sql, fn) => this.httpPostSql({ sql: sql }).then(fn)
}

const route01Controller = (controllerClass, pseudoRestList, templateUrl) => {
    const controllerName = controllerClass.toString().split(' ')[1]
    // console.log(controllerName, pseidoRest)
    app.controller(controllerName, controllerClass)
    ar.forEach(pseudoRestList, pseidoRest => singlePage[pseidoRest] = {
        controller: controllerName, templateUrl: templateUrl,
    })
}

const routeController = (controllerClass, templateUrl) => {
    const controllerName = controllerClass.toString().split(' ')[1]
    app.controller(controllerName, controllerClass)
    return { templateUrl: templateUrl, controller: controllerName, }
    // return { templateUrl: 'mc-sql-design.html', controller: controllerName, }
}

class Abstract01Controller {
    conf = conf; session = session; singlePage = singlePage
    constructor(dataFactory) {
        this.dataFactory = dataFactory
        urlMap = {}; singlePage.UrlMap()
    }
    getSql = n => sql_app[n]
    initSession = () => JSON.stringify(singlePage.session)
}

let urlMap = {}
singlePage.UrlMap = () => {
    if (Object.keys(urlMap).length === 0) singlePage.Url().split('/').forEach(v => {
        if (v) urlMap[v.split('_')[0]] = v.replace(v.split('_')[0] + '_', '')
    })
    return urlMap
}
singlePage.Url = () => window.location.href.split('#!')[1]

let setConfSqlApp = (n, pConf, pSql_app) => {
    conf[n] = pConf;
    if (pSql_app) sql_app[n] = pSql_app;
}
