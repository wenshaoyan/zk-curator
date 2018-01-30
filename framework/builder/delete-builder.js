/**
 * Created by yanshaowen on 2017/9/10.
 */
'use strict';
const BasicBuilder = require('./basic-builder');
const Api = require('../../lib/api');

class DeleteBuilder extends BasicBuilder{
    constructor(conn,namespace){
        super(conn,namespace);
    }

    forPath(path){
        return Api.remove(this.conn,this.isNamespace?this.namespace+path:path);
    }


}
module.exports = DeleteBuilder;
