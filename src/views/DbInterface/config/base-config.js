import service from '../../../service';
import ajax from "@rongji/rjmain-fe/lib/ajax";

export const _ALL_CATEGORY_ = () => {
}

export const _ALL_CATEGORY_OPTION_ = {
    label: '全部',
    value: _ALL_CATEGORY_
}

export function deleteButton(model, config) {
    return Object.assign({
        label: '删除',
        title: '请选择需要删除的文件',
        type: 'danger',
        handle() {
            if (!Array.prototype.isPrototypeOf(this.selection) || this.selection.length < 1) {
                return service.warning.call(this, '请选择需要删除的文档 ！')
            }
            service.confirm.call(this, '确定要永久性删除选择的' + this.selection.length + '份文档？').then((res) => {
                if (res) {
                    let expression, value
                    if (typeof criteria === 'function') {
                        let where = criteria.call(this, this.selection)
                        if (!(where && (expression = where.expression)))
                            return
                        value = where.value
                    } else {
                        expression = []
                        value = this.selection.map(o => {
                            expression.push('id = ?')
                            return o.id
                        })
                        expression = expression.join(' OR ')
                    }
                    service.delete.call(this, model, expression, value).then((res) => {
                        service.success.call(this, '删除完成')  //(res === expression.length ? '删除完成，' : '') + '此操作共计删除' + res + '份文件 ！')
                        this.refresh()
                    }).catch((err) => {
                        service.error.call(this, err)
                    })
                }
            });
        }
    }, {
        criteria: undefined
    }, config)
}

export function newButton(component, props) {
    return {
        label: '登记',
        title: '登记',
        type: 'primary',
        handle() {
            service.openForm.call(this, '', component, Object.assign({docId: ''}, props))
        }
    }
}

export function rowClick(component) {
    return function (row) {
        service.openForm.call(this, row.id, component, {docId: row.id})
    }
}

export function isManager() {
    let roles = this.$store.state.user.roles
    for (let role of service.managers) {
        if (roles.indexOf(role) > -1)
            return true
    }
    return false
}

export function searchOptions(search, beforeRequest) {
    let requests = [], origin = [],
        config = service.extend(true, [], search),
        action = col => {
            if(typeof col.options === 'function'){
                col.options=col.options.call(this, col)
            }
            let remote = col.remote
            if (!(remote && remote.expression))
                return
            if (!remote.alias)
                remote.alias = 'label'
            let fields = [{
                expression: remote.expression,
                alias: remote.alias,
                value: remote.value
            }]
            requests.push(beforeRequest.call(this, {
                fields,
                order: [`${col.remote.alias} ${col.remote.desc ? 'DESC' : 'ASC'}`],
                limit: [0, 1000],
                group: col.remote.group ? col.remote.group : fields[0]
            }, undefined, true))
            origin.push(col)
        }
    config.forEach(row =>
        Array.prototype.isPrototypeOf(row) ? row.forEach(action) : action(row))

    ajax.post(service.apis.queries(), requests).then(res => {
        res.forEach((item, index) => {
            let col = origin[index],
                alias = service.underscoreToLowerCamel(col.remote.alias)
            if (item) item.forEach(o => {
                col.options.push({label: o ? (o.hasOwnProperty(alias) ? o[alias] : o[alias]) : o})
            })
        })
    }).catch(err => {
        service.error.call(this, err)
    })
    return config
}

export default {
    deleteButton,
    newButton,
    rowClick,
    isManager,
    _ALL_CATEGORY_,
    _ALL_CATEGORY_OPTION_,
    searchOptions
}
