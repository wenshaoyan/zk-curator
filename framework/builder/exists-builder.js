/**
 * Created by yanshaowen on 2017/9/10.
 */
'use strict';
const BasicBuilder = require('./basic-builder');
const Api = require('../../lib/api');

class ExistsBuilder extends BasicBuilder{
    constructor(conn,namespace){
        super(conn,namespace);
    }

    forPath(path){
        return Api.exists(this.conn,this.isNamespace?this.namespace+path:path);
    }


}
module.exports = ExistsBuilder;
