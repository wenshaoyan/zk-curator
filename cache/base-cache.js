/**
 * Created by yanshaowen on 2018/02/26
 * 基础的cache
 */
'use strict';
const {switchCallback} = require('./cache-util');

class BaseCache {
    constructor(client, path) {
        if (typeof path !== 'string' || path.length === 0 || path[0] !== '/') {
            throw new Error('path error');
        }
        if (!client) {
            throw new Error('client error');
        }
        this._client = client;
        this._path = path;
        const split = path.split('/');
        let id = 'root';
        if (split.length >= 2) {
            id = split[split.length-1]
        }
        this._data = {root: {path: path, id: id}};
        this._callbacks = null;
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


    get data() {
        return this._data;
    }

    set data(value) {
        this._data = value;
    }


    get callbacks() {
        return this._callbacks;
    }

    set callbacks(value) {
        this._callbacks = value;
    }
    getData() {
        return this.data.root;
    }
    /**
     *
     * @param callbacks
     */
    addListener(callbacks) {
        this.callbacks = switchCallback(callbacks);
    }
}

module.exports = BaseCache;
