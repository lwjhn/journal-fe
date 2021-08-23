import {deleteButton, newButton, rowClick} from './base-config'
import service from '../../../service'
import form from '../../form'

export const page = form.SubscriptionForm
export const model = service.models.subscription
export const tableAlias = 'subscription.'
export const paperAlias = 'paper.'

export function beforeRequest(query, category, isCategory, forceJoin) {
    query.tableAlias = tableAlias.replace(/\./, '')
    if (forceJoin || !isCategory) {    //年价
        query.join = [{
            type: 'LEFT',
            model: service.models.paper.model,
            tableAlias: paperAlias.replace(/\./, ''),
            on: {
                expression: `${tableAlias}postalDisCode = ${paperAlias}postalDisCode and ${paperAlias}isValid = TRUE`
            }
        }]
    }
}


function buttons() {
    return parseInt(this.$attrs.type) === 0 ? [newButton(page), deleteButton(model)] : [newButton(page)]
}

export default function () {
    return {
        ...service.viewUrl(model),
        selection: true,
        category: [],
        columns: [
            {
                expression: tableAlias + 'id',
                alias: 'id',
                hidden: true
            }, {
                expression: 'LTRIM(subscribeYear) + ? + LTRIM(subscribeMonthBegin) + ? + LTRIM(subscribeMonthEnd) + ?',
                value: ['年 ', '月 - ', '月'],
                label: '起止订期',
                width: '200',
                sortable: true,
            }, {
                expression: 'subscribeOrg',
                label: '订阅处室',
                width: '120',
            }, {
                expression: 'subscribeUser',
                label: '订阅人',
                width: '120',
            }, {
                expression: tableAlias + 'publication',
                label: '报刊名称',
                minWidth: '140',
            }, {
                expression: tableAlias + 'postalDisCode',
                label: '邮发代号',
                width: '100',
            }, {
                expression: `CASE ${tableAlias}govExpense WHEN TRUE THEN ? ELSE ? END`,
                value: ['公费', '自费'],
                label: '类型',
                width: '80',
            }, {
                expression: `${paperAlias}yearPrice`,
                label: '年价',
                width: '80',
            }, {
                expression: `${paperAlias}yearPrice * subscribeCopies`,
                label: '总金额',
                width: '80',
            }, {
                expression: 'subscribeCopies',
                label: '份数',
                width: '80',
                sortable: true,
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
                expression: tableAlias + 'updateTime',
                alias: 'update_time',
                label: '更新时间',
                width: '180',
                sortable: 'DESC',
                format(option, item) {
                    return (item.updateTime ? service.formatDate(
                        new Date(item.updateTime.replace(/[-T]|(\..*\+)/gi, c => c === '-' ? '/' : (/T/i.test(c) ? ' ' : ' GMT+'))),
                        'yyyy-MM-dd hh:mm') : '')
                }
            }
        ],
        keyword: `${tableAlias}publication LIKE ? OR ${tableAlias}postalDisCode LIKE ? OR subscribeUser LIKE ? OR subscribeOrg LIKE ?`,
        search: [
            {
                label: '订阅类型',
                criteria(item) {
                    return item.value ? {
                        expression: `${tableAlias}govExpense = ` + (item.value === '公费' ? 'TRUE' : 'FALSE')
                    } : null
                }
            }, {
                label: '报刊名称',
                criteria(item) {
                    return item.value ? {
                        expression: `${tableAlias}publication LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '邮发代号',
                criteria(item) {
                    return item.value ? {
                        expression: `${tableAlias}postalDisCode LIKE ?`,
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
        rowClick: rowClick(page),
        beforeRequest(query, category, isCategory) {
            beforeRequest.call(this, query, category, isCategory)

            if (this.$attrs.type) {
                service.sql(query, 'verifyStatus = ?', this.$attrs.type)
            }
        }
    }
}
