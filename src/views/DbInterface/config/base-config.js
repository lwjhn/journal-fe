import service from "/src/service";

export function deleteButton(model){
    return {
        label: '删除',
        title: '请选择删除',
        type: 'danger',
        handle() {
            if (!Array.prototype.isPrototypeOf(this.selection) || this.selection.length < 1) {
                return service.warning.call(this, '请选择需要删除的文档 ！')
            }
            service.confirm.call(this, '确定要永久性删除选择的' + this.selection.length + '份文档？').then((res) => {
                if (res) {
                    let expression = [],
                        value = this.selection.map(o => {
                            expression.push('id = ?')
                            return o.id
                        })
                    service.delete.call(this, model, expression.join(' OR '), value).then((res) => {
                        service.success.call(this, (res === expression.length ? '删除完成，' : '') + '此操作共计删除' + res + '份文件 ！')
                        this.refresh()
                    }).catch((err) => {
                        service.error.call(this, err)
                    })
                }
            });
        }
    }
}

export function newButton(component){
    return {
        label: '登记',
        title: '登记',
        type: 'primary',
        handle() {
            service.openForm.call(this, '', component, {docId: ''})
        }
    }
}

export function rowClick(component){
    return function (row) {
        service.openForm.call(this, row.id, component, {docId: row.id})
    }
}

export default {
    deleteButton,
    newButton,
    rowClick
}
