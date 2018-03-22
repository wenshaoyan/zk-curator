/**
 * Created by yanshaowen on 2017/9/12
 * 监视一个结点的创建、更新、删除，子节点的创建更新，并将结点的数据缓存在本地。
 */
'use strict';
const BaseCache = require('./base-cache');

class PathCache extends BaseCache {
    constructor(client, path) {
        super(client, path);
    }

    /**
     * 开始cache
     */
    async start() {
        await this.listener('init');
    }

    /**
     *
     * @param nodeType   节点的状态   init:启动或者节点创建时候的状态  node:该节点删除或数据变化时候的状态  child:子节点创建或删除时候的状态
     */
    async listener(nodeType) {
        const data = this.data.root;
        if (nodeType === 'init' || nodeType === 'node') {
            data.state = await this.client.checkExists()
            .unwantedNamespace()
            .setWatcher(this.client, async (_client, event) => {   // 监听创建和删除
                if (event.getType() === 1) {    // 创建
                    await this.listener('init');
                    this.callbacks.nodeCreate(this, 0, BaseCache.deepCopyNode(this.getData()));
                } else if (event.getType() === 2) { // 删除
                    const changeNode = BaseCache.deepCopyNode(this.getData());
                    await this.listener('node');
                    data.data = null;
                    this.callbacks.nodeRemove(this, 0, changeNode);
                } else if (event.getType() === 3) { // 数据变化
                    const changeNode = BaseCache.deepCopyNode(this.getData());
                    await this.listener('node');
                    this.callbacks.nodeDataChange(this, 0, changeNode);
                }
            })
            .forPath(this.path);
        }
        if (data.state) {
            if (nodeType === 'init' || nodeType === 'node') {
                data.data = await this.client.getData()
                .unwantedNamespace()
                .forPath(this.path);
            }
            if (nodeType === 'init' || nodeType === 'child') {
                data.children = await this.client.getChildren()
                .unwantedNamespace()
                .setWatcher(this.client, async (_client, event) => {   // 监听创建和删除
                    if (event.getType() === 4) {
                        let oldLen = 0;
                        let newLen;
                        const keys1 = new Set(data.children);
                        if (data.children instanceof Array) {
                            oldLen = data.children.length;
                        }
                        await this.listener('child');
                        if (data.children instanceof Array) {
                            newLen = data.children.length;
                        }
                        const keys2 = new Set(data.children);
                        const d1 = [...keys1].filter(x => !keys2.has(x));
                        const d2 = [...keys2].filter(x => !keys1.has(x));
                        const changeNode = {};
                        if (d1.length === 1) {
                            changeNode.id = d1[0];
                        } else if (d2.length === 1) {
                            changeNode.id = d2[0];
                        }
                        if (newLen > oldLen) this.callbacks.childAdd(this, 0, changeNode);
                        else this.callbacks.childRemove(this, 0, changeNode);
                    }
                })
                .forPath(this.path);
            }
        }
    }

}

module.exports = PathCache;