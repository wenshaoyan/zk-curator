/**
 * Created by yanshaowen on 2017/9/10.
 */
'use strict';
const BasicBuilder = require('./basic-builder');
const Api = require('../../lib/api');

class GetChildrenBuilder extends BasicBuilder {
    constructor(conn,namespace){
        super(conn,namespace);
        this._watcherCallback =null;

    }

    get watcherCallback() {
        return this._watcherCallback;
    }

    set watcherCallback(value) {
        this._watcherCallback = value;
    }

    setWatcher(_client,callback){
        if (callback instanceof Function  && _client){
            this.watcherCallback =  (event)=> {
                callback(_client,event);
            };
        }
        return this;
    }
    forPath(path){
        return Api.getChildren(this.conn,this.isNamespace?this.namespace+path:path,this.watcherCallback );
    }


}
module.exports = GetChildrenBuilder;
