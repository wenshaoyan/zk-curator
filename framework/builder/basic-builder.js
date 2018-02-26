/**
 * Created by yanshaowen on 2017/9/11
 */
'use strict';

class BasicBuilder {
    constructor(conn,namespace){
        this._conn = conn;
        this._namespace = namespace;
        this._isNamespace = true;
    }


    get isNamespace() {
        return this._isNamespace;
    }

    set isNamespace(value) {
        this._isNamespace = value;
    }

    get namespace() {
        return this._namespace;
    }

    set namespace(value) {
        this._namespace = value;
    }

    get conn() {
        return this._conn;
    }

    set conn(value) {
        this._conn = value;
    }
    // 不使用namespace
    unwantedNamespace(){
        this.isNamespace = false;
        return this;
    }
    /**
     *
     * @param params
     * @param params.location   data or child
     * @param params.path       路径
     */
    cleanWatchers(params) {
        const wm = this.conn.connectionManager.watcherManager;
        if (params.location === 'data') {
            const dataWatchers = wm.dataWatchers;
            const existWatchers = wm.existenceWatchers;
            if (params.path in dataWatchers) {
                delete dataWatchers[params.path];
            }
            if (params.path in existWatchers) {
                delete existWatchers[params.path];
            }

        } else if (params.location === 'child') {
            const watchers = wm.childWatchers;
            if (params.path in watchers) {
                delete watchers[params.path];
            }
        }
    }
}

module.exports = BasicBuilder;