import service from "../../../service";
import checkOrder from "./checkOrder";

export function approval(verifyStatus, reverse, beforeHandle, extension = {}, noConfirm, actionName) {
    verifyStatus = /^[12]$/.test(verifyStatus) ? verifyStatus : 0;
    reverse ? --verifyStatus : ++verifyStatus;

    actionName = actionName ? actionName : (reverse ? `${verifyStatus === 1 ? '取消审核' : '退回'}` : (verifyStatus ===1 ? '送报刊管理员进行审核' : '通过审核'))
    let cmd = {
            verifyStatus
        },
        message = `确认要${actionName}？`   //reverse ? `确认要${verifyStatus == 1 ? '取消审核' : '退回'}文件？` : ('确认' + (verifyStatus == 1 ? '送报刊管理员进行审核？' : '要通过审核？'))

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
        if (message && !noConfirm) {
            service.confirm.call(this, message).then((res) => {
                if (!res) return
                callApproval.call(this, cmd, expression, value, resolve, reject)
            })
        } else {
            callApproval.call(this, cmd, expression, value, resolve, reject)
        }
    }

    return new Promise((resolve, reject) => {
        if(extension){
            for(let key of ['subscribeYear','subscribeOrg','id','subscribeUser']){
                if(extension[key]===undefined){
                    return reject(`extension.${key} is undefined !`)
                }
            }
        }
        if (!reverse && !(extension && !extension.govExpense)) {     //if (!reverse && verifyStatus === 1) {   //送审
            checkOrder.call(this, extension.subscribeYear, extension.subscribeOrg, extension.id, extension.subscribeUser).then(() => {
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
            service.success.call(this, '执行成功！')
        } else {
            service.error.call(this, '执行出现错误！' + res)
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



export function callViewApproval(verifyStatus, reverse, actionName) {
    let mode = actionName ? actionName : (reverse ? `${verifyStatus == 2 ? '取消审核' : '退回'}` : (verifyStatus != 1 && verifyStatus != 2 ? '送审核' : '审核')),
        msg = `请选择需要${mode}的文档 ！`
    if (!Array.prototype.isPrototypeOf(this.selection) || this.selection.length < 1) {
        return service.warning.call(this, msg)
    }
    let options = {}, forms = []
    this.selection.forEach(o => {
        if (!o.id && options[o.id])
            return
        options[o.id] = forms.push({
            id: o.id,
            subscribeOrg: o.subscribeOrg,
            subscribeOrgNo: o.subscribeOrgNo,
            subscribeYear: o.subscribeYear,
            govExpense: o.govExpense,
            subscribeUser: typeof o.subscribeUser === 'string' ? /公费|true/i.test(o.subscribeUser) : o.subscribeUser,
        })
    })

    let status = verifyStatus
    status = /^(1|2)$/.test(status) ? status : 0;
    reverse ? --status : ++status;
    service.confirm.call(this,
        reverse ? `确认要${status == 1 ? '取消审核' : '退回'}所有选中的文件？` : ('确认将所有选中的文件' + (status == 1 ? '送报刊管理员进行审核？' : '通过审核？'))
    ).then((res) => {
        if (!res) return

        doApproval.call(this, forms, verifyStatus, reverse, () => {
            service.success.call(this, mode + '完成 ！')
            this.refresh()
        }, (err, form) => {
            service.error.call(this, '此项操作执行出现错误！' + err)
            this.refresh()
        })
    })
}

function doApproval(forms, verifyStatus, reverse, resolve, reject) {
    if (forms.length < 1)
        return resolve()
    let form = forms.pop()
    approval.call(this, verifyStatus, reverse, (verifyStatus, reverse, message) => {
        return {
            expression: 'id = ?', value: form.id
        }
    }, form, true).then(res => {
        if (res === undefined || res === 1) {
            doApproval.call(this, forms, verifyStatus, reverse, resolve, reject)
        } else {
            reject(res, form)
        }
    }).catch(err => {
        reject(err)
    })
}

export default {
    approval
}
