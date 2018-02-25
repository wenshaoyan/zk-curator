/**
 * Created by yanshaowen on 2017/9/12
 * 监视一个结点的创建、更新、删除，并将结点的数据缓存在本地。
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
                console.log(event, this.children)
                if (event.getType() === 1) {    // 创建
                    await this.listener();
                    this.callbacks.nodeCreate();
                } else if (event.getType() === 2) { // 删除
                    await this.listener();
                    this.data = null;
                    this.callbacks.nodeRemove();
                } else if (event.getType() === 3) { // 数据变化
                    await this.listener();
                    this.callbacks.nodeDataChange();
                } else if (event.getType() === 4) {
                    let oldLen = 0;
                    let newLen;
                    if (this.children instanceof Array) {
                        oldLen = this.children.length;
                    }
                    await this.listener();
                    if (this.children instanceof Array) {
                        newLen = this.children.length;
                    }
                    if (newLen > oldLen) this.callbacks.childAdd();
                    else this.callbacks.childRemove()

                }
            })
            .forPath(this.path);
        if (this.state) {
            this.data = await this.client.getData()
                .unwantedNamespace()
                .forPath(this.path);
            this.children = await this.client.getChildren()
                .unwantedNamespace()
                .forPath(this.path);
            console.log(this.children)


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