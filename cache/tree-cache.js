/**
 * Created by yanshaowen on 2017/9/12
 * 监视一个结点的创建、更新、删除，及子节点的创建、更新、删除， 从数并将结点的数据缓存在本地。
 */
'use strict';
const BaseCache = require('./base-cache');

class TreeCache extends BaseCache {
    // deep: 树的最大层级 默认不限制
    constructor(client, path, maxDeep) {
        super(client, path);
        if (typeof maxDeep === 'number' && maxDeep > -1) {
            this._maxDeep = parseInt(maxDeep);
        } else {
            this._maxDeep = -1;
        }
    }

    get maxDeep() {
        return this._maxDeep;
    }

    set maxDeep(value) {
        this._maxDeep = value;
    }

    /**
     * 开始cache
     */
    async start() {
        await this.listener('init', this.data, 'root', this.path);
    }

    relativeDeep(inputPath) {
        const referenceDeep = this.path.split('/').length;
        const comparisonDeep = inputPath.split('/').length;
        return comparisonDeep - referenceDeep;
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
        if (this.maxDeep !== -1 && this.relativeDeep(parentPath) > this.maxDeep) {
            return;
        }

        if (!(nodeKey in parentData)) {
            const split = parentPath.split('/');
            const id = split[split.length - 1];
            parentData[nodeKey] = {
                id: id,
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
                    this.callbacks.nodeCreate(this, this.relativeDeep(parentPath));
                } else if (event.getType() === 2) { // 删除
                    await this.listener('node', parentData, nodeKey, parentPath);
                    delete parentData[nodeKey];
                    this.callbacks.nodeRemove(this, this.relativeDeep(parentPath));
                } else if (event.getType() === 3) { // 数据变化
                    await this.listener('node', parentData, nodeKey, parentPath);
                    this.callbacks.nodeDataChange(this, this.relativeDeep(parentPath));
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
                        let oldLen = current.children.length;
                        let newLen;
                        await this.listener('child', parentData, nodeKey, parentPath);
                        newLen = current.children.length;
                        if (newLen > oldLen) this.callbacks.childAdd(this, this.relativeDeep(parentPath));
                        else this.callbacks.childRemove(this, this.relativeDeep(parentPath))
                    }
                })
                .forPath(parentPath);

                current.childrenData = {};
                current.children = children;
                for (const node of children) {
                    current.childrenData[node] = {
                        id: node,
                        path: parentPath + '/' + node
                    };
                    await this.listener('init', current.childrenData, node, parentPath + '/' + node);
                }

            }
        }
    }
}

module.exports = TreeCache;