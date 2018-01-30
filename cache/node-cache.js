/**
 * Created by yanshaowen on 2017/9/12
 */
'use strict';
const api = require('../lib/Api');

class NodeCache{

    constructor(client,path){
        this._client = client;
        this._path = path;
    }

    get client() {
        return this._client;
    }

    set client(value) {
        this._client = value;
    }

    get path() {
        return this._path;
    }

    set path(value) {
        this._path = value;
    }
    addListener(callback){
        api.listener(this.client,this.path,callback);
    }
}
module.exports = NodeCache;