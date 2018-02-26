/**
 * Created by yanshaowen on 2017/9/12
 * 监视一个结点的创建、更新、删除，并将结点的数据缓存在本地。
 */
'use strict';
const BaseCache = require('./base-cache');

class NodeCache extends BaseCache{
    constructor(client, path) {
        super(client, path);
    }
    /**
     * 开始cache
     */
    async start() {
        await this.listener();
    }

    async listener() {
        const data = this.data.root;
        data.state = await this.client.checkExists()
        .unwantedNamespace()
        .setWatcher(this.client, async (_client, event) => {   // 监听创建和删除
            if (event.getType() === 1) {    // 创建
                await this.listener();
                this.callbacks.nodeCreate(this, 0);
            } else if (event.getType() === 2) { // 删除
                await this.listener();
                data.data = null;
                this.callbacks.nodeRemove(this, 0);
            } else if (event.getType() === 3) {
                await this.listener();
                this.callbacks.nodeDataChange(this, 0);
            }
        })
        .forPath(this.path);
        if (data.state) {
            data.data = await this.client.getData()
            .unwantedNamespace()
            .forPath(this.path);
        }
    }

}

module.exports = NodeCache;