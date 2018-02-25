/**
 * Created by yanshaowen on 2017/9/10.
 */
'use strict';
class Api {
    static create(conn, path, data, mode) {
        return new Promise((resolve, reject) => {
            conn.create(path, new Buffer(data), mode, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            })
        })
    }

    static exists(conn, path, callback) {
        return new Promise((resolve, reject) => {
            conn.exists(path,callback, (err, stat) => {
                if (err) reject(err);
                else resolve(stat);
            })
        })
    }

    static getChildren(conn, path, callback) {
        return new Promise((resolve, reject) => {
            conn.getChildren(path, callback, (err, children, stat) => {
                if (err) reject(err);
                //else resolve(children,stats);
                else resolve(children);
            })
        });
    }

    static getData(conn, path, callback, state) {
        return new Promise((resolve, reject) => {
            conn.getData(path, callback, (err, data, stat) => {
                state.data = stat;
                if (err) reject(err);
                //else resolve(children,stats);
                else resolve(data.toString('utf8'));
            })
        });
    }

    static remove(conn, path, version) {
        return new Promise((resolve, reject) => {
            conn.remove(path, version, (err) => {
                if (err) reject(err);
                //else resolve(children,stats);
                else resolve(true);
            })
        });
    }


}
module.exports = Api;

