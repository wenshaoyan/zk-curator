/**
 * Created by yanshaowen on 2017/9/10.
 */
'use strict';
const Api = require('../../lib/api');
const BasicBuilder = require('./basic-builder');
const Stat = require('../../lib/Stat');
const Listener = require('../../lib/listener');
class GetDataBuilder extends BasicBuilder {
    constructor(conn, namespace) {
        super(conn, namespace);
        this._state = new Stat();
        this._watcherCallback = null;
        this._path = null;
        this._isClean = false;
    }

    get state() {
        return this._state;
    }

    set state(value) {
        this._state = value;
    }

    get path() {
        return this._path;
    }

    set path(value) {
        this._path = value;
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

    storingStatIn(_state) {
        this.state = _state;
        return this;
    }
    setCleanWatchers() {
        this.isClean = true;
        return this;
    }

    setWatcher(_client, callback) {
        if (callback instanceof Function && _client) {
            this.watcherCallback = (event) => {
                callback(_client, event)
            };
        }
        return this;
    }

    /*addListener(_client, callbacks) {
        const listener = new Listener(_client, this, callbacks);
        listener.watch();
        return this;
    }*/

    forPath(path) {
        if (path) this.path = path;
        if (this.isClean) this.cleanWatchers({location: 'data', path: this.path});
        return Api.getData(this.conn, this.isNamespace ? this.namespace + path : path, this.watcherCallback, this.state);
    }

}
module.exports = GetDataBuilder;
