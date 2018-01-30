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
}

module.exports = BasicBuilder;