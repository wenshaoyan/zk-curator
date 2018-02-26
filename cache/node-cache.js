/**
 * Created by yanshaowen on 2017/9/12
 * 监视一个结点的创建、更新、删除，并将结点的数据缓存在本地。
 */
'use strict';
const {switchCallback} = require('./cache-util');
class NodeCache {
    constructor(client, path) {
        this._client = client;
        this._path = path;
        this._state = null;
        this._data = null;
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


    get state() {
        return this._state;
    }

    set state(value) {
        this._state = value;
    }

    /**
     * 开始cache
     */
    start() {
        this.listener();
    }

    async listener() {
        this.state = await this.client.checkExists()
            .unwantedNamespace()
            .setWatcher(this.client, async(_client, event) => {   // 监听创建和删除
                if (event.getType() === 1) {    // 创建
                    await this.listener();
                    this.callbacks.nodeCreate();
                } else if (event.getType() === 2) { // 删除
                    await this.listener();
                    this.data = null;
                    this.callbacks.nodeRemove();
                } else if (event.getType() === 3) {
                    await this.listener();
                    this.callbacks.nodeDataChange();
                }
            })
            .forPath(this.path);
        if (this.state) {
            this.data = await this.client.getData()
                .unwantedNamespace()
                .forPath(this.path);
        }
    }

    /**
     *
     * @param callbacks
     */
    addListener(callbacks) {
        this.callbacks = switchCallback(callbacks);
    }
}
module.exports = NodeCache;