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
import {callViewApproval} from "../../form/subscription-form/approval";

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
    if (gov) {
        service.sql(query, `${tableAlias}govExpense = ${/true/i.test(gov) ? 'TRUE' : 'FALSE'}`)
    }
    return query
}

export function search(){
    return searchOptions.call(this, [
        {
            label: '订阅年份',
            value: _ALL_CATEGORY_,
            width: '340px',
            labelWidth: '90px',
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
        },
        {
            label: '订阅类型',
            value: _ALL_CATEGORY_,
            width: '340px',
            criteria(item) {
                return item.value && item.value !== _ALL_CATEGORY_ ? {
                    expression: `${tableAlias}govExpense=${item.value === '公费' ? 'TRUE' : 'FALSE'}`
                } : null
            },
            type: 'radio',
            options: [_ALL_CATEGORY_OPTION_, {label: '自费'}, {label: '公费'}]
        },
        {
            label: '订阅处室',
            value: _ALL_CATEGORY_,
            width: 'calc(100% - 680px)',
            style: {
                'max-width': '600px'
            },
            criteria(item) {
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
            criteria(item) {
                return item.value ? {
                    expression: `${paperAlias}publication LIKE ?`,
                    value: `%${item.value}%`
                } : null
            }
        }, {
            label: '邮发代号',
            width: '340px',
            criteria(item) {
                return item.value ? {
                    expression: `${paperAlias}postalDisCode LIKE ?`,
                    value: `%${item.value}%`
                } : null
            }
        }, {
            label: '订阅日期',
            width: 'calc(100% - 680px)',
            style: {
                'max-width': '600px'
            },
            value: undefined,
            criteria(item) {
                return service.date2Criteria(`${tableAlias}subscribeTime`, item.value)
            },
            type: 'date',
        }
    ], beforeRequest)
}

function buttons() {
    let view = service.url.getUrlHashParam('view'),    //window.location.hash.match(/(^|&|\?|\#)view=([^&]*)(&|$)/i),
        mode = parseInt(service.url.getUrlHashParam('type'))
    return mode === 0 ? [newButton(page, {
        isSelfPay : /false/i.test(service.url.getUrlHashParam("govExpense"))
    }), deleteButton(model), deleteButton(service.models.order, {
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
    })] : [newButton(page, {
        isSelfPay : /false/i.test(service.url.getUrlHashParam("govExpense"))
    })].concat(!isManager.call(this) || !/^subscription$/i.test(view) ? [] : (
        mode === 1 ? [{
            label: '通过审核',
            title: '通过审核',
            type: 'primary',
            handle() {
                callViewApproval.call(this, mode, false)
            }
        }, {
            label: '不通过审核',
            title: '不通过审核',
            type: 'primary',
            handle() {
                callViewApproval.call(this, mode, true)
            }
        }] : [{
            label: '取消审核',
            title: '取消审核',
            type: 'primary',
            handle() {
                callViewApproval.call(this, mode, true)
            }
        }]
    ))
}

export function category() {
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
            width: '180px',
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
        selection: [],
        category: category.call(this),
        columns: [
            {
                expression: tableAlias + 'id',
                alias: 'id',
                hidden: true
            }, {
                expression: orderAlias + 'id',
                alias: service.camelToUpperUnderscore('orderId'),
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
                        format(option, item) {
                            return service.formatStringDate(item.subscribeTime, 'yyyy-MM-dd hh:mm')
                        }
                    }
                ]
            )
            , {
                expression: 'subscribeOrg',
                alias: service.camelToUpperUnderscore('subscribeOrg'),
                label: '订阅处室',
                width: '120',
            }, {
                expression: 'subscribeUser',
                alias: service.camelToUpperUnderscore('subscribeUser'),
                label: '订阅人',
                width: '120',
            }, {
                expression: paperAlias + 'publication',
                label: '报刊名称',
                minWidth: '140',
            }, {
                expression: `${paperAlias}journal`,
                label: '类型',
                width: '100',
            }, {
                expression: `${orderAlias}subscribeCopies`,
                label: '份数',
                width: '80',
                sortable: true,
            }, {
                expression: `${paperAlias}yearPrice`,
                label: '年价',
                width: '80',
            }, {
                expression: `${paperAlias}yearPrice * ${orderAlias}subscribeCopies`,
                label: '总金额',
                width: '80',
            }, {
                expression: `CASE ${tableAlias}govExpense WHEN TRUE THEN ? ELSE ? END`,
                alias: service.camelToUpperUnderscore('govExpense'),
                value: ['公费', '自费'],
                label: '费用类型',
                width: '100',
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
        search: search.call(this),
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
