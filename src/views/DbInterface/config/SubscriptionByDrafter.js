import service from '/src/service'

export default function () {
    return {
        ...service.viewUrl('Subscription'),
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
        buttons: [{
            label: '登记',
            title: '登记',
            type: 'primary',
            handle() {
                service.openForm.call(this, '', this.$views.journal.SubscriptionForm, {docId: ''})
            }
        }],
        rowClick(row) {
            service.openForm.call(this, row.id, this.$views.journal.SubscriptionForm, {docId: row.id})
        },
        beforeRequest(query, category, isCategory) {
            console.log(query)
            debugger;
        }
    }
}
