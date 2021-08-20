import service from '/src/service'

export default function () {
    return {
        ...service.viewUrl(service.models.paper),
        selection: true,
        category: [],
        columns: [
            {
                expression: 'id',
                alias: 'id',
                hidden: true
            }, {
                expression: 'publication',
                label: '报刊名称',
                minWidth: '140',
            }, {
                expression: 'postalDisCode',
                label: '邮发代号',
                width: '130',
                sortable: true
            }, {
                expression: 'journal',
                label: '报纸/期刊',
                width: '130',
            }, {
                expression: 'periodical',
                label: '刊期',
                width: '100',
            }, {
                expression: 'unitPrice',
                label: '单价',
                width: '100',
            }, {
                expression: 'yearPrice',
                label: '年价',
                width: '100',
            }, {
                expression: 'deliveryMethod',
                label: '订阅路径',
                minWidth: '140',
            }, {
                expression: 'press',
                label: '出版社',
                minWidth: '150',
            }, {
                expression: 'CASE govExpense WHEN TRUE THEN ? ELSE ? END',
                value: ['公费', '自费'],
                label: '公费刊物',
                width: '100',
            }, {
                expression: 'sortNo',
                label: '排序号',
                width: '100',
                sortable: true
            }, {
                expression: 'updateTime',
                alias: service.camelToUpperUnderscore('updateTime'),
                label: '修改时间',
                width: '180',
                sortable: 'DESC',
                format(option, item) {
                    return (item.updateTime ? service.formatDate(
                        new Date(item.updateTime.replace(/[-T]|(\..*\+)/gi, c => c === '-' ? '/' : (/T/i.test(c) ? ' ' : ' GMT+'))),
                        'yyyy-MM-dd hh:mm') : '')
                }
            }
        ],
        keyword: 'publication LIKE ? OR postalDisCode LIKE ? OR journal LIKE ? OR periodical LIKE ? OR deliveryMethod LIKE ? OR press LIKE ? OR govExpense LIKE ?',
        search: [
            {
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
                label: '出版社',
                criteria(item) {
                    return item.value ? {
                        expression: `press LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }
        ],
        buttons: [{
            label: '登记',
            title: '登记',
            type: 'primary',
            handle() {
                service.openForm.call(this, '', this.$views.journal.PaperForm, {docId: ''})
            }
        }, {
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
                        service.delete.call(this, service.models.paper, expression.join(' OR '), value).then((res) => {
                            service.success.call(this, (res === expression.length ? '删除完成，' : '') + '此操作共计删除' + res + '份文件 ！')
                            this.refresh()
                        }).catch((err) => {
                            service.error.call(this, err)
                        })
                    }
                });
            }
        }],
        rowClick(row) {
            service.openForm.call(this, row.id, this.$views.journal.PaperForm, {docId: row.id})
        },
        beforeRequest(query, category, isCategory) {

        }
    }
}
