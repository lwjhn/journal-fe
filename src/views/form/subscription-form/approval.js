import service from "../../../service";
import checkOrder from "./checkOrder";

export function approval(verifyStatus, reverse, beforeHandle, extension = {}) {
    verifyStatus = /^(1|2)$/.test(verifyStatus) ? verifyStatus : 0;
    reverse ? --verifyStatus : ++verifyStatus;
    let cmd = {
            verifyStatus
        },
        message = reverse ? `确认要${verifyStatus == 1 ? '取消审核' : '撤回'}文件？` : ('确认' + (verifyStatus == 1 ? '送报刊管理员进行审核？' : '要通过审核？'))

    if (!reverse && verifyStatus === 1) {   //送审
        Object.assign(cmd, extension)
    }
    switch (verifyStatus) {
        case 1:
            Object.assign(cmd, {
                verifyUser: '',
                verifyUserNo: '',
                verifyTime: null,
                subscribeTime: new Date()
            })
            break;
        case 2:
            Object.assign(cmd, {
                verifyUser: this.$store.state.system.extraUserinfo.userName,
                verifyUserNo: this.$store.state.user.username,
                verifyTime: new Date()
            })
            break;
        default:

    }
    if (verifyStatus < 0 || verifyStatus > 2) {
        return new Promise((resolve, reject) => reject(verifyStatus < 0 ? '此文件已在草稿中！' : '此文件已是已审核状态！'))
    }

    let {expression, value} = beforeHandle.call(this, verifyStatus, reverse, message)
    if (!expression) {
        return new Promise((resolve, reject) => resolve())
    }

    const action = (resolve, reject) => {
        if (message) {
            service.confirm.call(this, message).then((res) => {
                if (!res) return
                callApproval.call(this, cmd, expression, value, resolve, reject)
            })
        } else {
            callApproval.call(this, cmd, expression, value, resolve, reject)
        }
    }

    return new Promise((resolve, reject) => {
        if (!reverse) {
            checkOrder.call(this, extension.subscribeYear, extension.subscribeOrg, extension.id).then(() => {
                action(resolve, reject)
            }).catch(reject)
        } else {
            action(resolve, reject)
        }
    })
}

function callApproval(map, expression, value, resolve, reject) {
    const loadingInstance = this.$loading({lock: true, text: '正在执行此项操作，请稍后...'})
    return service.update.call(this, service.models.subscription, map, expression, value).then(res => {
        if (typeof resolve === "function") {
            resolve(res)
        } else if (res === 1) {
            service.success.call(this, '此项操作执行完成！')
        } else {
            service.error.call(this, '此项操作执行出现错误！' + res)
        }
    }).catch((err) => {
        if (typeof reject === "function") {
            reject(err)
        } else {
            service.error.call(this, err)
        }
    }).finally(() => {
        if (loadingInstance)
            loadingInstance.close()
    })
}

export default {
    approval
}
