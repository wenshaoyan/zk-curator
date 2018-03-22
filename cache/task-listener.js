/**
 * Created by yanshaowen on 2018/02/26
 * 任务监听器  解决zk某个子节点的同时触发nodeCreate和childAdd导致的并发问题
 */
'use strict';

class TaskListener {
    constructor() {
        this.paths = {};
        this.timeout = 5000;
    }

    check(o, t) {
        return new Promise(resolve => {
            let tool = 0;
            const timer = setInterval(() => {
                if (!o[t]) {
                    resolve(true);
                    clearInterval(timer);
                }
                if(tool === this.timeout){
                    resolve(false);
                    clearInterval(timer);
                }
                tool += 50;
            }, 50)
        })


    }

    addNodeWatch(path) {
        if (path in this.paths) {
            this.paths[path]['node'] = true;
        } else {
            this.paths[path] = {'node': true};
        }
    }

    async removeNodeWatch(path) {
        if (path in this.paths) {
            this.paths[path]['node'] = false;
            if (this.paths[path]['child']) {
                // 开启定时器
                return await this.check(this.paths[path], 'child');
            } else {
                return true;
            }
        }
        return true;
    }

    addChildWatch(path) {
        if (path in this.paths) {
            this.paths[path]['child'] = true;
        } else {
            this.paths[path] = {'child': true};
        }
    }

    async removeChildWatch(path) {
        if (path in this.paths) {
            this.paths[path]['child'] = false;
            if (this.paths[path]['node']) {
                // 开启定时器
                return await this.check(this.paths[path], 'node');
            } else {
                return true;
            }
        }
        return true;
    }

}
module.exports = TaskListener;