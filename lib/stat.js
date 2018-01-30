/**
 * Created by yanshaowen on 2017/9/11
 */
'use strict';
class Stat{
    constructor(){
        this._data = null;
    }

    get data() {
        return this._data;
    }

    set data(value) {
        this._data = value;
    }
}
module.exports = Stat;