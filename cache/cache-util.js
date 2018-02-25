/**
 * Created by wenshao on 2018/2/25.
 * cache工具类
 */
'use strict';
class CacheUtil {
    static switchCallback(value) {
        const cbs = {
            nodeCreate: function () {

            },
            nodeRemove: function () {

            },
            nodeDataChange: function () {

            },
            childChange: function () {

            },
            childAdd: function () {

            },
            childRemove: function () {

            },

        };
        if (value) {
            if (typeof value.nodeCreate === 'function') cbs.nodeCreate = value.nodeCreate;
            if (typeof value.nodeRemove === 'function') cbs.nodeRemove = value.nodeRemove;
            if (typeof value.nodeDataChange === 'function') cbs.nodeDataChange = value.nodeDataChange;
            if (typeof value.childChange === 'function') cbs.childChange = value.childChange;
            if (typeof value.childAdd === 'function') cbs.childAdd = value.childAdd;
            if (typeof value.childRemove === 'function') cbs.childRemove = value.childRemove;
        }
        return cbs;
    };
}
module.exports = CacheUtil;
