import {
    deleteButton,
    newButton,
    rowClick,
    _ALL_CATEGORY_,
    _ALL_CATEGORY_OPTION_,
    searchOptions,
    isManager
} from './base-config'
import service from '../../../service'
import form from '../../form'
import { callViewApproval } from "../../form/subscription-form/approval";

export const page = form.SubscriptionForm
export const model = service.models.subscription
export const tableAlias = 'subscription.'
export const orderAlias = 'order.'
export const paperAlias = 'paper.'

export function beforeRequest (query, category, isCategory, forceJoin) {
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

    if (!isCategory) {
        let val = [], exp = this.columns.filter(item => !/sum|group|count|avg|wm_concat/i.test(item.expression)).map(item => {
            let { expression, value } = item.group ? item.group : item
            if (/\?/.test(expression))
                val.splice(val.length, 0, value)
            return expression
        }).join(', ')
        service.sql(query, exp, val, undefined, 'group')
    }

    let gov = service.url.getUrlHashParam("govExpense")
    if (gov) {
        service.sql(query, `${tableAlias}govExpense = ${/true/i.test(gov) ? 'TRUE' : 'FALSE'}`)
    }
    return query
}

function buttons () {
    let view = service.url.getUrlHashParam('view'),    //window.location.hash.match(/(^|&|\?|\#)view=([^&]*)(&|$)/i),
        mode = parseInt(service.url.getUrlHashParam('type'))

    return mode === 0 ? [newButton(page), deleteButton(model)] : [newButton(page)].concat(!isManager.call(this) || !/^SubscriptionNonJoin$/i.test(view) ? [] : (
        mode === 1 ? [{
            label: '通过审核',
            title: '通过审核',
            type: 'primary',
            handle () {
                callViewApproval.call(this, mode, false)
            }
        }, {
            label: '不通过审核',
            title: '不通过审核',
            type: 'primary',
            handle () {
                callViewApproval.call(this, mode, true)
            }
        }] : [{
            label: '取消审核',
            title: '取消审核',
            type: 'primary',
            handle () {
                callViewApproval.call(this, mode, true)
            }
        }]
    ))
}

function category () {
    return !/subscription/i.test(service.url.getUrlHashParam('view')) || /^0$/i.test(service.url.getUrlHashParam('type')) ? [] : [
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
            criteria (item) {
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

function replaceComma (value) {
    return typeof value === 'string' ? value.replace(/,/g, '、') : ''
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
            },
            ...(mode === 0 ? [{
                expression: tableAlias + 'subscribeYear',
                label: '订阅年度',
                width: '120',
                sortable: 'DESC',
            }] : [
                {
                    expression: tableAlias + 'subscribeYear',
                    alias: service.camelToUpperUnderscore('subscribeYear'),
                    hidden: true
                }, {
                    expression: tableAlias + 'subscribeOrgNo',
                    alias: service.camelToUpperUnderscore('subscribeOrgNo'),
                    hidden: true
                }, {
                    expression: tableAlias + 'subscribeTime',
                    alias: service.camelToUpperUnderscore('subscribeTime'),
                    label: '订阅时间',
                    width: '180',
                    sortable: 'DESC',
                    format (option, item) {
                        return service.formatStringDate(item.subscribeTime, 'yyyy-MM-dd hh:mm')
                    }
                }
            ]
            ), {
                expression: 'subscribeOrg',
                alias: service.camelToUpperUnderscore('subscribeOrg'),
                label: '订阅处室',
                width: '120',
            }, {
                expression: `group_concat(${paperAlias}publication)`,
                alias: 'publication',
                label: '报刊名称',
                minWidth: '120',
                format (option, item) {
                    return replaceComma(item.publication);
                }
            }, /*{
                expression: `group_concat(${paperAlias}postalDisCode)`,
                alias: service.camelToUpperUnderscore('postalDisCode'),
                label: '邮发代号',
                minWidth: '120',
                format(option, item) {
                    return replaceComma(item.postalDisCode);
                }
            }, */{
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
                format (option, item) {
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
                label: '订阅年份',
                value: _ALL_CATEGORY_,
                width: '340px',
                labelWidth: '90px',
                criteria (item) {
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
            },
            {
                label: '订阅类型',
                value: _ALL_CATEGORY_,
                width: '340px',
                criteria (item) {
                    return item.value && item.value !== _ALL_CATEGORY_ ? {
                        expression: `${tableAlias}govExpense=${item.value === '公费' ? 'TRUE' : 'FALSE'}`
                    } : null
                },
                type: 'radio',
                options: [_ALL_CATEGORY_OPTION_, { label: '自费' }, { label: '公费' }]
            },
            {
                label: '订阅处室',
                value: _ALL_CATEGORY_,
                width: 'calc(100% - 680px)',
                style:{
                    'max-width': '600px'
                },
                criteria (item) {
                    return item.value && item.value !== _ALL_CATEGORY_ ? {
                        expression: `${tableAlias}subscribeOrg=?`,
                        value: item.value
                    } : null
                },
                type: 'select',   //date, number, select, radio, checkbox, other
                options: [_ALL_CATEGORY_OPTION_],
                remote: {
                    expression: `${tableAlias}subscribeOrg`,
                    desc: true,
                }
            },
            {
                label: '报刊名称',
                width: '340px',
                labelWidth: '90px',
                criteria (item) {
                    return item.value ? {
                        expression: `${paperAlias}publication LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '邮发代号',
                width: '340px',
                criteria (item) {
                    return item.value ? {
                        expression: `${paperAlias}postalDisCode LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '订阅日期',
                width: 'calc(100% - 680px)',
                style:{
                    'max-width': '600px'
                },
                value: undefined,
                criteria (item) {
                    if (!item.value || item.value.length < 1)
                        return null
                    const template = [{ operator: '>=', format: 'yyyy-MM-dd 00:00:00' }, { operator: '<=', format: 'yyyy-M-d 23:59:59' }]
                    let expression = [], value = []
                    item.value.forEach((dateTime, index) => {
                        if (!!(dateTime = service.string2Date(dateTime))) {
                            expression.push(`${tableAlias}subscribeTime ${template[index].operator} ?`)
                            value.push(service.formatDate(dateTime, template[index].format))
                        }
                    })
                    return {
                        expression: expression.join(' AND '),
                        value: value
                    }
                },
                type: 'date',
            }
        ], beforeRequest),
        buttons: buttons.call(this),
        rowClick: rowClick(page),
        beforeRequest (query, category, isCategory) {
            beforeRequest.call(this, query, category, isCategory)
            if (this.$attrs.type) {
                service.sql(query, 'verifyStatus = ?', this.$attrs.type)
            }
        }
    }
}
