/**
 * Created by yanshaowen on 2017/9/12
 * 监视一个结点的创建、更新、删除，子节点的创建更新，并将结点的数据缓存在本地。
 */
'use strict';
const {switchCallback} = require('./cache-util');
class PathCache {
    constructor(client, path) {
        this._client = client;
        this._path = path;
        this._state = null;
        this._data = null;
        this._callbacks = null;
        this._children = null;
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


    get children() {
        return this._children;
    }

    set children(value) {
        this._children = value;
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
        this.listener('init');
    }

    /**
     *
     * @param nodeType   节点的状态   init:启动或者节点创建时候的状态  node:该节点删除或数据变化时候的状态  child:子节点创建或删除时候的状态
     */
    async listener(nodeType) {
        if (nodeType === 'init' || nodeType === 'node') {
            this.state = await this.client.checkExists()
            .unwantedNamespace()
            .setWatcher(this.client, async(_client, event) => {   // 监听创建和删除
                if (event.getType() === 1) {    // 创建
                    await this.listener('init');
                    this.callbacks.nodeCreate();
                } else if (event.getType() === 2) { // 删除
                    await this.listener('node');
                    this.data = null;
                    this.callbacks.nodeRemove();
                } else if (event.getType() === 3) { // 数据变化
                    await this.listener('node');
                    this.callbacks.nodeDataChange();
                }
            })
            .forPath(this.path);
        }
        if (this.state) {
            if (nodeType === 'init' || nodeType === 'node') {
                this.data = await this.client.getData()
                .unwantedNamespace()
                .forPath(this.path);
            }
            if (nodeType === 'init' || nodeType === 'child') {
                this.children = await this.client.getChildren()
                .unwantedNamespace()
                .setWatcher(this.client, async (_client, event) => {   // 监听创建和删除
                    if (event.getType() === 4) {
                        let oldLen = 0;
                        let newLen;
                        if (this.children instanceof Array) {
                            oldLen = this.children.length;
                        }
                        await this.listener('child');
                        if (this.children instanceof Array) {
                            newLen = this.children.length;
                        }
                        if (newLen > oldLen) this.callbacks.childAdd();
                        else this.callbacks.childRemove()
                    }
                })
                .forPath(this.path);
            }
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
module.exports = PathCache;