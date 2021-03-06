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
export const orderLimitAlias = 'orderLimit.'

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
        }, {
            type: 'LEFT',
            tableAlias: orderLimitAlias.replace(/\./, ''),
            table: {
                fields: [{expression: 'company', alias: 'company'}, {expression: 'max(sortNo)', alias: 'sortNo'}],
                model: service.models.orderLimit.model,
                group: {expression: 'company'}
            },
            on: {
                expression: `${orderLimitAlias}company = ${tableAlias}subscribeOrg`
            }
        }]
        if (
            !((Array.prototype.isPrototypeOf(query.order) && query.order.length > 0)
                || (typeof query.order === 'string' && query.order)
                || (query.order && query.expression))
        ) {
            query.order = {
                expression: `max(${orderLimitAlias}sortNo) ASC`
            }
        }
    }
    if (!isCategory) {
        let val = [],
            exp = this.columns.filter(item => !/sum|group|count|avg|wm_concat/i.test(item.expression)).map(item => {
                let {expression, value} = item.group ? item.group : item
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

function buttons() {
    let view = service.url.getUrlHashParam('view'),    //window.location.hash.match(/(^|&|\?|\#)view=([^&]*)(&|$)/i),
        mode = parseInt(service.url.getUrlHashParam('type'))

    return mode === 0 ? [newButton(page), deleteButton(model)] : [newButton(page)].concat(!isManager.call(this) || !/^SubscriptionNonJoin$/i.test(view) ? [] : (
        mode === 1 ? [{
            label: '????????????',
            title: '????????????',
            type: 'primary',
            handle() {
                callViewApproval.call(this, mode, false)
            }
        }, {
            label: '???????????????',
            title: '???????????????',
            type: 'primary',
            handle() {
                callViewApproval.call(this, mode, true)
            }
        }] : [{
            label: '????????????',
            title: '????????????',
            type: 'primary',
            handle() {
                callViewApproval.call(this, mode, true)
            }
        }]
    ))
}

function category() {
    return !/subscription/i.test(service.url.getUrlHashParam('view')) || /^0$/i.test(service.url.getUrlHashParam('type')) ? [] : [
        {
            expression: 'subscribeYear',
            label: '??????',
            width: '90px',
            desc: true,
            defaultValue(data, option, defaultValue) {
                let o
                return data.length < 1 ? defaultValue : (
                    (o = data[0]) ? (o.hasOwnProperty(option.name) ? o[option.name] : o[option.alias]) : o
                )
            }
        },
        {
            expression: 'subscribeOrg',
            label: '????????????',
            width: '210px',
            desc: true
        },
        {
            expression: `CASE ${tableAlias}govExpense WHEN TRUE THEN ? ELSE ? END`,
            value: ['??????', '??????'],
            label: '????????????',
            width: '100px',
            desc: true,
            criteria(item) {
                return {
                    expression: `${item.group.expression} = ${item.value === '??????' ? 'TRUE' : 'FALSE'}`
                }
            },
            group: {
                expression: `${tableAlias}govExpense`
            }
        }
    ]
}

function replaceComma(value) {
    return typeof value === 'string' ? value.replace(/,/g, '???') : ''
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
            },
            ...(mode === 0 ? [{
                    expression: tableAlias + 'subscribeYear',
                    label: '????????????',
                    width: '120',
                    sortable: true,
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
                        label: '????????????',
                        width: '180',
                        sortable: true,
                        format(option, item) {
                            return service.formatStringDate(item.subscribeTime, 'yyyy-MM-dd hh:mm')
                        }
                    }
                ]
            ), {
                expression: 'subscribeOrg',
                alias: service.camelToUpperUnderscore('subscribeOrg'),
                label: '????????????',
                width: '180',
            }, {
                // expression: `group_concat(to_char(${orderAlias}sortNo)+?+${paperAlias}publication)`,
                // value: [String.fromCharCode(6)],
                expression: 'publicationBrief',
                alias: 'publication',
                label: '????????????',
                minWidth: '120',
                // format(option, item) {
                //     return !item.publication ? '' : item.publication.split(/,\s|,/g)
                //         .sort((a, b) =>
                //             Number(a.substring(0, a.indexOf(String.fromCharCode(6))))
                //             - Number(b.substring(0, b.indexOf(String.fromCharCode(6)))))
                //         .map(item => item.replace(/^.*[\u0006]/, '')).join('???')
                // },
                bind: {
                    type: 'one-line-words'
                }
            }, /*{
                expression: `group_concat(${paperAlias}postalDisCode)`,
                alias: service.camelToUpperUnderscore('postalDisCode'),
                label: '????????????',
                minWidth: '120',
                format(option, item) {
                    return replaceComma(item.postalDisCode);
                }
            }, */{
                expression: 'subscribeUser',
                alias: service.camelToUpperUnderscore('subscribeUser'),
                label: '?????????',
                width: '120',
            }, {
                expression: 'subscribeCopiesBrief', //`sum(${orderAlias}subscribeCopies)`,
                label: '??????',
                width: '80',
                sortable: true,
            }, {
                expression: 'amountBrief', //`sum(${paperAlias}yearPrice * ${orderAlias}subscribeCopies)`,
                label: '?????????',
                width: '80',
            }, {
                expression: `CASE ${tableAlias}govExpense WHEN TRUE THEN ? ELSE ? END`,
                alias: service.camelToUpperUnderscore('govExpense'),
                value: ['??????', '??????'],
                label: '????????????',
                width: '100',
                group: {
                    expression: `${tableAlias}govExpense`
                }
            }, {
                expression: 'verifyStatus',
                alias: service.camelToUpperUnderscore('verifyStatus'),
                label: '??????',
                width: '100',
                format(option, item) {
                    let status;
                    return item.hasOwnProperty(option.expression)
                        ? ((status = item[option.expression]) === 1 ? '?????????' : (status === 2 ? '?????????' : '??????')) : '??????'
                },
                hidden: !isNaN(parseInt(service.url.getUrlHashParam('type')))
            }
        ],
        keyword: `${paperAlias}publication LIKE ? OR ${paperAlias}postalDisCode LIKE ? OR ${tableAlias}subscribeUser LIKE ? OR ${tableAlias}subscribeOrg LIKE ?`,
        search: searchOptions.call(this, [
            {
                label: '????????????',
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
                    //value:[],   //expresion??????
                    //group: 'subscribeYear', //??????
                    desc: true,
                }
            },
            {
                label: '????????????',
                value: _ALL_CATEGORY_,
                width: '340px',
                criteria(item) {
                    return item.value && item.value !== _ALL_CATEGORY_ ? {
                        expression: `${tableAlias}govExpense=${item.value === '??????' ? 'TRUE' : 'FALSE'}`
                    } : null
                },
                type: 'radio',
                options: [_ALL_CATEGORY_OPTION_, {label: '??????'}, {label: '??????'}]
            },
            {
                label: '????????????',
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
                label: '????????????',
                width: '340px',
                labelWidth: '90px',
                criteria(item) {
                    return item.value ? {
                        expression: `${paperAlias}publication LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '????????????',
                width: '340px',
                criteria(item) {
                    return item.value ? {
                        expression: `${paperAlias}postalDisCode LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '????????????',
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
        ], beforeRequest),
        buttons: buttons.call(this),
        rowClick: rowClick(page),
        beforeRequest(query, category, isCategory) {
            beforeRequest.call(this, query, category, isCategory)
            if (this.$attrs.type) {
                service.sql(query, 'verifyStatus = ?', this.$attrs.type)
            }
        },
        html: `<style>
            .cell>div[type=one-line-words] {
                overflow: hidden;
                /*line-height: 23px;*/
                position: relative;
                height: 23px;
                padding-right: 10px;
            }
            .cell>div[type=one-line-words]:after {
                content: '...';
                text-align: right;
                position: absolute;
                bottom: 0;
                right: 0;
                width: 20px;
                /*height: 1.8em;
                background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 50%);*/
            }
        </style>`
    }
}
