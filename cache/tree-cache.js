/**
 * Created by yanshaowen on 2017/9/12
 * 监视一个结点的创建、更新、删除，及子节点的创建、更新、删除， 从数并将结点的数据缓存在本地。
 */
'use strict';
const {switchCallback} = require('./cache-util');
const a = {
    "test": {
        id: "test",
        path: "/path",
        data: "",
        state: "",
        children: {}
    }
};

class PathCache {
    constructor(client, path) {
        this._client = client;
        this._path = path;
        this._data = {};
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
        this.data.root.path = value;
        this._path = value;
    }


    get data() {
        return this._data;
    }

    set data(value) {
        this._data = value;
    }


    /**
     * 开始cache
     */
    start() {
        let id = 'root';
        if (this.path) {
            const list = this.path.split('/');
            if (list) id = list[list.length - 1]

        }
        this.listener('init', this.data, id, this.path);
    }

    /**
     *
     * @param nodeType      节点的状态   init:启动或者节点创建时候的状态
     *                                  node:该节点删除或数据变化时候的状态
     *                                  child:子节点变化
     * @param parentData    父节点数据对象
     * @param nodeKey       当前子节点key
     * @param parentPath       当前子节点key
     */
    async listener(nodeType, parentData, nodeKey, parentPath) {
        if (!(nodeKey in parentData)) {
            parentData[nodeKey] = {
                id: nodeKey,
                path: parentPath
            };
        }
        const current = parentData[nodeKey];
        if (nodeType === 'init' || nodeType === 'node') {
            current.state = await this.client.checkExists()
            .unwantedNamespace()
            .setCleanWatchers()
            .setWatcher(this.client, async (_client, event) => {   // 监听创建和删除
                if (event.getType() === 1) {    // 创建
                    await this.listener('init', parentData, nodeKey, parentPath);
                    this.callbacks.nodeCreate();
                } else if (event.getType() === 2) { // 删除
                    await this.listener('node', parentData, nodeKey, parentPath);
                    delete parentData[nodeKey];
                    this.callbacks.nodeRemove();
                } else if (event.getType() === 3) { // 数据变化
                    await this.listener('node', parentData, nodeKey, parentPath);
                    this.callbacks.nodeDataChange();
                }
            })
            .forPath(parentPath);
        }
        if (current.state) {
            if (nodeType === 'init' || nodeType === 'node') {
                current.data = await this.client.getData()
                .unwantedNamespace()
                .forPath(parentPath);
            }
            if (nodeType === 'init' || nodeType === 'child') {
                const children = await this.client.getChildren()
                .unwantedNamespace()
                .setCleanWatchers()
                .setWatcher(this.client, async (_client, event) => {   // 监听创建和删除
                    if (event.getType() === 4) {
                        let oldLen = Object.keys(current.children).length;
                        let newLen;
                        await this.listener('child', parentData, nodeKey, parentPath);
                        newLen = Object.keys(current.children).length;
                        if (newLen > oldLen) this.callbacks.childAdd();
                        else this.callbacks.childRemove()
                    }
                })
                .forPath(parentPath);

                current.children = {};
                for (const node of children) {
                    current.children[node] = {
                        id: node,
                        path: parentPath + '/' + node
                    };
                    await this.listener('init', current.children, node, parentPath + '/' + node);
                }

            }
        }
        // console.log(JSON.stringify(this.data))
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