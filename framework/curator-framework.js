/**
 * Created by yanshaowen on 2017/9/10.
 */
'use strict';
const zookeeper = require('node-zookeeper-client');

const CreateBuilder = require('./builder/create-builder');
const ExistsBuilder = require('./builder/exists-builder');
const GetChildrenBuilder = require('./builder/get-children-builder');
const GetDataBuilder = require('./builder/get-data-builder');
const DeleteBuilder = require('./builder/delete-builder');

class CuratorFramework {

    constructor(curatorFrameworkFactory, callback) {
        this._client = zookeeper.createClient(curatorFrameworkFactory.address,
            curatorFrameworkFactory.options ? curatorFrameworkFactory.options : undefined);
        this._curatorFrameworkFactory = curatorFrameworkFactory;
        this._client.once('connected', async () => {
            if (this.curatorFrameworkFactory.isPrintLog())
                this.curatorFrameworkFactory.logger.info('zookeeper connect succeed');
            const createBuilder = this.create()
            .creatingParentContainersIfNeeded()
            .unwantedNamespace();
            try {
                await createBuilder.forPath(this.curatorFrameworkFactory.space, null);
            } catch (e) {
                //console.log(e);
            }
            callback();
        });
    }


    get curatorFrameworkFactory() {
        return this._curatorFrameworkFactory;
    }

    set curatorFrameworkFactory(value) {
        this._curatorFrameworkFactory = value;
    }

    get client() {
        return this._client;
    }

    set client(value) {
        this._client = value;
    }

    /**
     * 连接
     */
    start() {
        if (this.curatorFrameworkFactory.isPrintLog())
            this.curatorFrameworkFactory.logger.info('zookeeper connecting..');
        this.client.connect();
        return this;
    }

    /**
     * 关闭
     */
    close() {
        this.client.close();

    }

    create() {
        return new CreateBuilder(this.client, this.curatorFrameworkFactory.space);
    }

    checkExists() {
        return new ExistsBuilder(this.client, this.curatorFrameworkFactory.space);
    }

    getChildren() {
        return new GetChildrenBuilder(this.client, this.curatorFrameworkFactory.space);
    }

    getData() {
        return new GetDataBuilder(this.client, this.curatorFrameworkFactory.space);
    }
    delete() {
        return new DeleteBuilder(this.client, this.curatorFrameworkFactory.space);
    }
}

module.exports = CuratorFramework;
