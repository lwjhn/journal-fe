import service from '/src/service'

const model = service.models.subscription
const newButton = {
    label: '登记',
    title: '登记',
    type: 'primary',
    handle() {
        service.openForm.call(this, '', this.$views.journal.SubscriptionForm, {docId: ''})
    }
}
const delButton = {
    label: '删除',
    title: '请选择删除',
    type: 'danger',
    handle() {
        if (!Array.prototype.isPrototypeOf(this.selection) || this.selection.length < 1) {
            return service.warning.call(this, '请选择需要删除的文档 ！')
        }
        service.confirm.call(this, '确定要永久性删除选择的' + this.selection.length + '份文档？共计').then((res) => {
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

function buttons() {
    return parseInt(this.$attrs.type) === 0 ? [newButton, delButton] : [newButton]
}

export default function () {
    return {
        ...service.viewUrl(model),
        selection: true,
        category: [],
        columns: [
            {
                expression: 'id',
                alias: 'id',
                hidden: true
            }, {
                expression: 'subscribeOrg',
                label: '订阅处室',
                width: '120',
            }, {
                expression: 'subscribeUser',
                label: '订阅人',
                width: '120',
            }, {
                expression: 'publication',
                label: '报刊名称',
                minWidth: '140',
            }, {
                expression: 'postalDisCode',
                label: '邮发代号',
                width: '100',
            }, {
                expression: 'LTRIM(subscribeYear) + ? + LTRIM(subscribeMonthBegin) + ? + LTRIM(subscribeMonthEnd) + ?',
                value: ['年 ', '月 - ', '月'],
                label: '起止订期',
                width: '160',
                sortable: true,
            }, {
                expression: 'CASE govExpense WHEN TRUE THEN ? ELSE ? END',
                value: ['公费', '自费'],
                label: '订阅类型',
                width: '120',
            }, {
                expression: 'subscribeCopies',
                label: '订阅份数',
                width: '120',
                sortable: true,
            }, {
                expression: 'clearingForm',
                label: '结算方式',
                width: '120',
            }, {
                expression: 'verifyStatus',
                alias: this.$rj.camelToUpperUnderscore('verifyStatus'),
                label: '状态',
                width: '100',
                format(option, item) {
                    let status;
                    return item.hasOwnProperty(option.expression)
                        ? ((status = item[option.expression]) === 1 ? '待审核' : (status === 2 ? '已审核' : '草稿')) : '草稿'
                }
            }, {
                expression: 'updateTime',
                alias: 'update_time',
                label: '更新时间',
                width: '180',
                sortable: 'DESC',
            }
        ],
        keyword: 'publication LIKE ? OR postalDisCode LIKE ? OR subscribeUser LIKE ? OR subscribeOrg LIKE ?',
        search: [
            {
                label: '订阅类型',
                criteria(item) {
                    return item.value ? {
                        expression: `rssType LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '报刊名称',
                criteria(item) {
                    return item.value ? {
                        expression: `publication LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '邮发代号',
                criteria(item) {
                    return item.value ? {
                        expression: `postalDisCode LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '订阅年份',
                criteria(item) {
                    return item.value ? {
                        expression: `subscribeYear = ?`,
                        value: item.value
                    } : null
                }
            }
        ],
        buttons: buttons.call(this),
        rowClick(row) {
            service.openForm.call(this, row.id, this.$views.journal.SubscriptionForm, {docId: row.id})
        },
        beforeRequest(query, category, isCategory) {
            if (this.$attrs.type) {
                service.sql(query, 'verifyStatus = ?', this.$attrs.type)
            }
        }
    }
}
