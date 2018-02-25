/**
 * Created by wenshao on 2018/2/25.
 */
'use strict';
const setCallback = (value) => {
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
        else if (typeof value.nodeRemove === 'function') cbs.nodeRemove = value.nodeRemove;
        else if (typeof value.nodeDataChange === 'function') cbs.nodeDataChange = value.nodeDataChange;
        else if (typeof value.childChange === 'function') cbs.childChange = value.childChange;
        else if (typeof value.childAdd === 'function') cbs.childAdd = value.childAdd;
        else if (typeof value.childRemove === 'function') cbs.childRemove = value.childRemove;
    }
    return cbs;
}
class Listener {
    constructor(_client, _builder, _callbacks) {
        this._client = _client;
        this._builder = _builder;
        this._callbacks = setCallback(_callbacks);
    }
    get client() {
        return this._client;
    }

    set client(value) {
        this._client = value;
    }

    get builder() {
        return this._builder;
    }

    set builder(value) {
        this._builder = value;
    }

    get callbacks() {
        return this._callbacks;
    }

    set callbacks(value) {
        this._callbacks = setCallback(value);
    }

    watch() {
        this.builder.watcherCallback = (event) => {
            console.log(event);
            switch (event.getType()) {
                case 1: // node create
                    this.callbacks.nodeCreate(this.client, event);
                    break;
                case 2: // node delete
                    this.callbacks.nodeRemove(this.client, event);
                    break;
                case 3: // data change
                    this.callbacks.nodeDataChange(this.client, event);
                    break;
                case 4: // children change
                    this.callbacks.childChange(this.client, event);
                    break;
                default:
                    break;

            }
            // this.watch();
            this.builder.forPath();
        }
    }
}
module.exports = Listener;