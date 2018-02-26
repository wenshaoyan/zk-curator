/**
 * Created by yanshaowen on 2017/9/10.
 */
'use strict';
const BasicBuilder = require('./basic-builder');
const Api = require('../../lib/api');

class GetChildrenBuilder extends BasicBuilder {
    constructor(conn, namespace) {
        super(conn, namespace);
        this._watcherCallback = null;
        this._isClean = false;

    }

    get watcherCallback() {
        return this._watcherCallback;
    }

    set watcherCallback(value) {
        this._watcherCallback = value;
    }


    get isClean() {
        return this._isClean;
    }

    set isClean(value) {
        this._isClean = value;
    }
    setCleanWatchers() {
        this.isClean = true;
        return this;
    }
    setWatcher(_client, callback) {
        if (callback instanceof Function && _client) {
            this.watcherCallback = (event) => {
                callback(_client, event);
            };
        }
        return this;
    }

    forPath(path) {
        if (path) this.path = path;
        if (this.isClean) this.cleanWatchers({location: 'child', path: this.path});
        return Api.getChildren(this.conn, this.isNamespace ? this.namespace + path : path, this.watcherCallback);
    }


}

module.exports = GetChildrenBuilder;
