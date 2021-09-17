import {deleteButton, newButton, rowClick, _ALL_CATEGORY_, _ALL_CATEGORY_OPTION_, searchOptions} from './base-config'
import service from '../../../service'
import form from '../../form'
import {approval} from "../../form/subscription-form/approval";

export const page = form.SubscriptionForm
export const model = service.models.subscription
export const tableAlias = 'subscription.'
export const orderAlias = 'order.'
export const paperAlias = 'paper.'

export function beforeRequest(query, category, isCategory, forceJoin) {
    query.tableAlias = tableAlias.replace(/\./, '')
    query.model = model.model
    if (forceJoin || !isCategory) {
        query.join = [{
            type: 'LEFT',
            model: service.models.order.model,
            tableAlias: orderAlias.replace(/\./, ''),
            on: {
                expression: `${tableAlias}id = ${orderAlias}pid`
            },
            join: [{
                type: 'LEFT',
                model: service.models.paper.model,
                tableAlias: paperAlias.replace(/\./, ''),
                on: {
                    expression: `${orderAlias}paperId = ${paperAlias}id`
                }
            }]
        }]
    }
    return query
}

function callApproval(verifyStatus, reverse) {
    let msg = `请选择需要${verifyStatus == 1 ? (reverse ? '撤回' : '送审核') : (verifyStatus == 2 ? (reverse ? '取消审核' : '通过审核') : '操作')}的文档 ！`
    if (!Array.prototype.isPrototypeOf(this.selection) || this.selection.length < 1) {
        return service.warning.call(this, msg)
    }
    let expression = [],
        value = this.selection.map(o => {
            expression.push('id = ?')
            return o.id
        })
    approval.call(this, verifyStatus, reverse, (verifyStatus, message) => {
        return {
            expression: expression.join(' OR '), value
        }
    }).then(res => {
        if (res === undefined)
            return
        service.success.call(this, (res === expression.length ? msg + '完成，' : '') + '此操作共计' + msg + res + '份文件 ！')
        this.refresh()
    })
}

function buttons() {
    let view = window.location.hash.match(/(^|&|\?|\#)view=([^&]*)(&|$)/i),
        mode = parseInt(this.$attrs.type)
    return mode === 0 ? [newButton(page), deleteButton(model), deleteButton(service.models.order, {
        label: '删除订阅',
        title: '仅删除订阅信息',
        type: 'info',
        criteria() {
            let expression = [],
                value = this.selection.filter(o => o.orderId).map(o => {
                    expression.push('id = ?')
                    return o.orderId
                })
            if (expression.length < 1) {
                service.warning('未找到需要删除的订阅信息！')
                return null
            }
            expression = expression.join(' OR ')
            return {
                expression,
                value
            }
        }
    })] : [newButton(page)].concat(!/^subscription$/i.test(view ? view[2] : '') ? [] : (
        mode === 1 ? [{
            label: '通过审核',
            title: '通过审核',
            type: 'primary',
            handle() {
                callApproval.call(this, mode, false)
            }
        }, {
            label: '不通过审核',
            title: '不通过审核',
            type: 'info',
            handle() {
                callApproval.call(this, mode, true)
            }
        }] : [{
            label: '取消审核',
            title: '取消审核',
            type: 'info',
            handle() {
                callApproval.call(this, mode, true)
            }
        }]
    ))
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
                expression: orderAlias + 'id',
                alias: 'order_id',
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
                expression: paperAlias + 'publication',
                label: '报刊名称',
                minWidth: '140',
            }, {
                expression: paperAlias + 'postalDisCode',
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
                expression: `${paperAlias}yearPrice * ${orderAlias}subscribeCopies`,
                label: '总金额',
                width: '80',
            }, {
                expression: `${orderAlias}subscribeCopies`,
                label: '份数',
                width: '80',
                sortable: true,
            }, {
                expression: 'verifyStatus',
                alias: service.camelToUpperUnderscore('verifyStatus'),
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
        keyword: `${paperAlias}publication LIKE ? OR ${paperAlias}postalDisCode LIKE ? OR ${tableAlias}subscribeUser LIKE ? OR ${tableAlias}subscribeOrg LIKE ?`,
        search: searchOptions.call(this, [
            {
                label: '订阅类型',
                value: _ALL_CATEGORY_,
                criteria(item) {
                    return item.value && item.value !== _ALL_CATEGORY_ ? {
                        expression: `${tableAlias}govExpense=${item.value === '公费' ? 'TRUE' : 'FALSE'}`
                    } : null
                },
                type: 'radio',
                options: [_ALL_CATEGORY_OPTION_, {label: '自费'}, {label: '公费'}]
            }, {
                label: '报刊名称',
                width: '400px',
                criteria(item) {
                    return item.value ? {
                        expression: `${paperAlias}publication LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '邮发代号',
                criteria(item) {
                    return item.value ? {
                        expression: `${paperAlias}postalDisCode LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '订阅年份',
                value: _ALL_CATEGORY_,
                criteria(item) {
                    return item.value && item.value !== _ALL_CATEGORY_ ? {
                        expression: `${tableAlias}subscribeYear=?`,
                        value: item.value
                    } : null
                },
                type: 'select',   //date, number, select, radio, checkbox, other
                options: [_ALL_CATEGORY_OPTION_],
                remote: {
                    expression: `${tableAlias}subscribeYear`,
                    //value:[],   //expresion参数
                    //group: 'subscribeYear', //可选
                    desc: true,
                }
            }
        ], beforeRequest),
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
