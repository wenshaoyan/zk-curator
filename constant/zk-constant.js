/**
 * Created by yanshaowen on 2017/9/10.
 */
'use strict';

// source zookeeper
const CREATE_MODES = {
    /**
     *持久化节点
     */
    PERSISTENT : 0,

    /**
     * 持久化序列节点
     */
    PERSISTENT_SEQUENTIAL : 2,

    /**
     * 临时节点
     */
    EPHEMERAL : 1,

    /**
     * 临时序列节点
     */
    EPHEMERAL_SEQUENTIAL : 3,
    MODE_SET :  new Set([0,1,2,3]),
};

module.exports = CREATE_MODES;