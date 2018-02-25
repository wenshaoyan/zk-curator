/**
 * Created by yanshaowen on 2017/9/10.
 */
'use strict';
const BasicBuilder = require('./basic-builder');
const Api = require('../../lib/api');

class ExistsBuilder extends BasicBuilder {
    constructor(conn, namespace) {
        super(conn, namespace);
        this._watcherCallback = null;
        this._path = null;

    }

    get watcherCallback() {
        return this._watcherCallback;
    }

    set watcherCallback(value) {
        this._watcherCallback = value;
    }

    get path() {
        return this._path;
    }

    set path(value) {
        this._path = value;
    }

    setWatcher(_client, callback) {
        if (callback instanceof Function && _client) {
            this.watcherCallback = (event) => {
                callback(_client, event)
            };
        }
        return this;
    }

    forPath(path) {
        if (path) this.path = path;
        return Api.exists(this.conn, this.isNamespace ? this.namespace + path : path, this.watcherCallback);
    }


}
module.exports = ExistsBuilder;
