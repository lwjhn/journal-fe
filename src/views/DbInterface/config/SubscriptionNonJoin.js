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
    let gov = service.url.getUrlHashParam("govExpense")
    if(gov){
        service.sql(query, `${tableAlias}govExpense = ${/true/i.test(gov) ? 'TRUE' : 'FALSE'}`)
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
    let view = service.url.getUrlHashParam('view'),    //window.location.hash.match(/(^|&|\?|\#)view=([^&]*)(&|$)/i),
        mode = parseInt(service.url.getUrlHashParam('type'))
    return mode === 0 ? [newButton(page), deleteButton(model)] : [newButton(page)].concat(!/^SubscriptionNonJoin$/i.test(view) ? [] : (
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

function category() {
    return !/^subscription$/i.test(service.url.getUrlHashParam('view')) ? [] : [
        {
            expression: 'subscribeYear',
            label: '年度',
            width: '90px',
            desc: true,
            defaultValue: new Date().getFullYear()
        },
        {
            expression: 'subscribeOrg',
            label: '订阅处室',
            width: '130px',
            desc: true
        },
        {
            expression: `CASE ${tableAlias}govExpense WHEN TRUE THEN ? ELSE ? END`,
            value: ['公费', '自费'],
            label: '费用类型',
            width: '100px',
            desc: true,
            criteria(item) {
                return {
                    expression: `${item.group.expression} = ${item.value === '公费' ? 'TRUE' : 'FALSE'}`
                }
            },
            group: {
                expression: `${tableAlias}govExpense`
            }
        }
    ]
}

export default function () {
    let mode = parseInt(this.$attrs.type)
    return {
        ...service.viewUrl(model),
        selection: true,
        category: category.call(this),
        columns: [
            {
                expression: tableAlias + 'id',
                alias: 'id',
                hidden: true
            }, {
                ...(mode === 0 ? {
                    expression: tableAlias + 'subscribeYear',
                    label: '订阅年度',
                    minWidth: '120',
                    sortable: 'DESC',
            } : {
                    expression: tableAlias + 'subscribeTime',
                    alias: 'subscribe_Time',
                    label: '订阅时间',
                    minWidth: '180',
                    sortable: 'DESC',
                    format(option, item) {
                        return (item.subscribeTime ? service.formatDate(
                            new Date(item.subscribeTime.replace(/[-T]|(\..*\+)/gi, c => c === '-' ? '/' : (/T/i.test(c) ? ' ' : ' GMT+'))),
                            'yyyy-MM-dd hh:mm') : '')
                    }
                })
            }, {
                expression: 'subscribeOrg',
                label: '订阅处室',
                width: '120',
            }, {
                expression: 'subscribeUser',
                label: '订阅人',
                width: '120',
            }, {
                expression: `sum(${orderAlias}subscribeCopies)`,
                label: '份数',
                width: '80',
                sortable: true,
            }, {
                expression: `sum(${paperAlias}yearPrice * ${orderAlias}subscribeCopies)`,
                label: '总金额',
                width: '80',
            }, {
                expression: `CASE ${tableAlias}govExpense WHEN TRUE THEN ? ELSE ? END`,
                value: ['公费', '自费'],
                label: '费用类型',
                width: '100',
                group: {
                    expression: `${tableAlias}govExpense`
                }
            }, {
                expression: 'verifyStatus',
                alias: service.camelToUpperUnderscore('verifyStatus'),
                label: '状态',
                width: '100',
                format(option, item) {
                    let status;
                    return item.hasOwnProperty(option.expression)
                        ? ((status = item[option.expression]) === 1 ? '待审核' : (status === 2 ? '已审核' : '草稿')) : '草稿'
                },
                hidden: !isNaN(parseInt(service.url.getUrlHashParam('type')))
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
            if(!isCategory){
                let val=[], exp = this.columns.filter(item=>!/sum/i.test(item.expression)).map(item=>{
                    let {expression, value} = item.group ? item.group : item
                    if(/\?/.test(expression))
                        val.splice(val.length, 0, value)
                    return expression
                }).join(', ')
                service.sql(query, exp, val, undefined, 'group')
                console.log(query.group)
                debugger
            }
            if (this.$attrs.type) {
                service.sql(query, 'verifyStatus = ?', this.$attrs.type)
            }
        }
    }
}
