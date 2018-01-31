/**
 * Created by yanshaowen on 2017/9/10.
 */
'use strict';
const CuratorFramework = require('./curator-framework');
const ZkConstant = require('../constant/zk-Constant');
const CuratorFrameworkFactory = (function () {

    const _isPrintLog = Symbol('_isPrintLog');

    class CuratorFrameworkFactory {
        constructor() {
            this._address = '127.0.0.1:2181';
            this._space = '/';
            this._logger = null;
            this[_isPrintLog] = false;
            this._options = null;
        }

        static builder() {
            return new CuratorFrameworkFactory();
        }

        get address() {
            return this._address;
        }

        set address(value) {
            this._address = value;
        }


        get space() {
            return this._space;
        }

        set space(value) {
            this._space = value;
        }


        get logger() {
            return this._logger;
        }


        set logger(value) {
            if (value && value.info instanceof Function) this[_isPrintLog] = true;
            this._logger = value;
        }

        get options() {
            return this._options;
        }

        set options(value) {
            this._options = value;
        }

        isPrintLog (){
            return this[_isPrintLog];
        }
        connectString(address) {
            if (typeof address !== 'string') {
                throw new Error('address not is string');
            }
            this.address = address;
            return this;
        }

        namespace(space) {
            if (typeof space !== 'string') {
                throw new Error('space not is string');
            }
            if (space[0] === '/' || space[space.length - 1] === '/') {
                throw new Error('space error:' + space);
            }
            this.space += space;
            return this;
        }

        setLogger(func) {
            if ('info' in func) {
                this.logger = func;
                return this;
            }
            throw new Error('func not is Logger object');

        }
        setOptions(option) {
            if (option) {
                this.options = option;
            }
            return this;
        }
        build(callback) {
            return new CuratorFramework(this, callback);

        }
    }

    CuratorFrameworkFactory.PERSISTENT = ZkConstant.PERSISTENT;
    CuratorFrameworkFactory.PERSISTENT_SEQUENTIAL = ZkConstant.PERSISTENT_SEQUENTIAL;
    CuratorFrameworkFactory.EPHEMERAL = ZkConstant.EPHEMERAL;
    CuratorFrameworkFactory.EPHEMERAL_SEQUENTIAL = ZkConstant.EPHEMERAL_SEQUENTIAL;
    return CuratorFrameworkFactory;
})();

module.exports = CuratorFrameworkFactory;