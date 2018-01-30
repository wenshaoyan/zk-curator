/**
 * Created by yanshaowen on 2017/9/10.
 */
'use strict';
const ZkConstant = require('../../constant/zk-Constant');
const defaultMode = 0;
const Api = require('../../lib/api');
const BasicBuilder = require('./basic-builder');
const os = require('os');

const getLocalIp = () => {
	const interfaces = os.networkInterfaces();
	for(let devName in interfaces){
		let iface = interfaces[devName];
		for(let i=0;i<iface.length;i++){
			let alias = iface[i];
			if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
				return alias.address;
			}
		}
	}
};
class CreateBuilder extends BasicBuilder{
    constructor(conn,namespace) {
        super(conn,namespace);
        this._isParent = false;
        this._mode = 0;
        this._execResult = null;
        this._nodePath = null;
        this._nodeData = getLocalIp();
        this._absoluteAddress = false;

    }


    get absoluteAddress() {
        return this._absoluteAddress;
    }

    set absoluteAddress(value) {
        this._absoluteAddress = value;
    }
    get isParent() {
        return this._isParent;
    }

    set isParent(value) {
        this._isParent = value;
    }


    get mode() {
        return this._mode;
    }

    set mode(value) {

        this._mode = value;
    }


    get nodePath() {
        return this._nodePath;
    }

    set nodePath(value) {
        this._nodePath = value;
    }

    get nodeData() {
        return this._nodeData;
    }

    set nodeData(value) {
        this._nodeData = value;
    }

    get execResult() {
        return this._execResult;
    }


    set execResult(value) {
        this._execResult = value;
    }

    // 自动递归创建父节点
    creatingParentContainersIfNeeded() {
        this.isParent = true;
        return this;
    }
    // 设置模式
    withMode(_mode) {
        if (ZkConstant.MODE_SET.has(_mode)){
            this.mode = _mode;
        }
        return this;
    }
    isAbsoluteAddress(){
        this.absoluteAddress = true;
        return this;
    }

    async forPath(_nodePath, _nodeData){
        if (!this.isNamespace){    // 创建namespace指定的路径
            this.nodePath = _nodePath;
        }else{
            this.nodePath = this.namespace+_nodePath;
        }
        if (_nodeData){
            this.nodeData = _nodeData;
        }

        let split = this.nodePath.split('/');
        if (!(split instanceof Array) || split[0] !== ''){
            throw new Error('path error:'+_nodePath);
        }
        if (split[split.length-1] === '') split.pop();
        split.shift();
        const checkResultFirst = await Api.exists(this.conn,this.nodePath);
        if (checkResultFirst){
            //throw new Error('path exists:'+_nodePath);
            await Api.remove(this.conn,this.nodePath,-1);
        }
        let path = '';
        if (this.isParent && split.length>2) {
            let index = 0;
            let defMap = new Map();
            defMap.set('mode',defaultMode);
            defMap.set('data',Util.getLocalIp());
            let generatePath;
            for (let value of split){
                index++;
                if (index === split.length) {
                    defMap.set('mode',this.mode);
                    defMap.set('data',this.nodeData);
                }
                generatePath = `${path}/${value}`;
                const checkResult = await Api.exists(this.conn,generatePath);
                if (!checkResult){
                    path = await Api.create(this.conn,generatePath , defMap.get('data'),defMap.get('mode'));
            }else{
                    path = generatePath;
                }
            }

        }else{
            path = await Api.create(this.conn, this.nodePath, this.nodeData,this.mode);
        }
        if (!this.absoluteAddress && this.namespace.length >1) path = path.replace(this.namespace,'');
        return path;
    }

}
module.exports = CreateBuilder;
