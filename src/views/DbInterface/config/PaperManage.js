import {newButton, deleteButton, isManager, searchOptions, _ALL_CATEGORY_OPTION_, _ALL_CATEGORY_} from './base-config'

import Paper, {page, model, deleteButton as setInvalidButton} from "./Paper"
import service from '../../../service'

const subscriptionAlias = 'subscription.'
const orderAlias = 'order.'
const paperAlias = 'paper.'

import form from "../../form";

/*
 SELECT * FROM EGOV_JOURNAL_PAPER AS Paper
 LEFT JOIN
 (
 SELECT Order.PAPER_ID AS PaperId, Subscription.SUBSCRIBE_YEAR AS SubscribeYear
 FROM EGOV_JOURNAL_SUBSCRIPTION AS Subscription LEFT JOIN EGOV_JOURNAL_ORDER AS Order ON Subscription.ID = Order.PID
 GROUP BY Order.PAPER_ID, Subscription.SUBSCRIBE_YEAR
 ) AS History ON History.PaperId = Paper.id
 */

/*const deleteButtonId = 'view-btn-delete'

function showDeleteButton(value) {
    $(`[modeType=${deleteButtonId}]`).attr('hidden', !/无效/.test(value))
}*/

function category() {
    return /^null$/i.test(service.url.getUrlHashParam("type")) ? [] : [
        {
            expression: 'CASE History.PaperId WHEN NULL THEN ? ELSE TO_CHAR(History.SubscribeYear) END',
            alias: '_DEF_CAT_0',
            value: ['未使用'],
            label: '年度',
            width: '110px',
            desc: true,
            defaultValue(data, option, defaultValue) {
                let o
                return data.length < 1 ? defaultValue : (
                    (o = data.length > 1 ? data[1] : data[0]) ? (o.hasOwnProperty(option.name) ? o[option.name] : o[option.alias]) : o
                )
            },
            beforeCreate(data){
                data.splice(1, 0, {
                    label: '已使用', value: '已使用'
                })
            },
            criteria(item) {
                return item.value && item.value !== _ALL_CATEGORY_ ? {
                    expression: /使用/.test(item.value) ? `History.PaperId IS ${ /未使用/.test(item.value) ? '' : 'NOT ' }NULL` : `History.SubscribeYear = ${item.value}`
                } : null
            },
            group: '_DEF_CAT_0',
            /*            on: {
                            change: function (value) {
                                showDeleteButton(value)
                            }.bind(this)
                        }*/
        }, {
            expression: `CASE isValid WHEN TRUE THEN ? ELSE ? END`,
            value: ['启用', '废弃'],
            label: '状态',
            width: '110px',
            desc: true,
            defaultValue: '启用',
            criteria(item) {
                return {
                    expression: `${item.group.expression} = ${item.value === '启用' ? 'TRUE' : 'FALSE'}`
                }
            },
            group: {
                expression: `isValid`
            }
        }
    ]
}

function beforeRequest(query, category, isCategory) {
    let noGroupByYear = !isCategory && (!category || category.length<1 || isNaN(Number(category[0].value)))
    Object.assign(query, {
        model: model.model,
        tableAlias: paperAlias.replace(/\./, ''),
        join: [{
            type: 'LEFT',
            table: {
                fields: [
                    {
                        expression: `${orderAlias}paperId`,
                        alias: 'paperId'
                    },
                    ...(noGroupByYear ? [] : [{
                        expression: `${subscriptionAlias}subscribeYear`,
                        alias: 'subscribeYear'
                    }])
                ],
                model: service.models.subscription.model,
                tableAlias: subscriptionAlias.replace(/\./, ''),
                join: [{
                    type: 'LEFT',
                    model: service.models.order.model,
                    tableAlias: orderAlias.replace(/\./, ''),
                    on: {
                        expression: `${subscriptionAlias}id = ${orderAlias}pid`
                    }
                }],
                group: {
                    expression: `${noGroupByYear ? '' : `${subscriptionAlias}subscribeYear, `}${orderAlias}paperId`
                }
            },
            tableAlias: 'History',
            on: {
                expression: `History.paperId = ${paperAlias}id`
            }
        }]
    })
    let type = service.url.getUrlHashParam("type")
    if (type && !/all/i.test(type)) {
        service.sql(query, `History.paperId IS${/^null$/.test(type) ? '' : ' NOT'} NULL`)
    }
    return query
}

function appSearch(PaperView){
    const appSearch=searchOptions.call(this, [
        {
            label: '年  度',
            width: '400px',
            labelWidth: '110px',
            type: 'select',
            value: _ALL_CATEGORY_,
            options: [_ALL_CATEGORY_OPTION_, {label: '已使用'}],
            criteria(item) {
                return item.value && item.value !== _ALL_CATEGORY_ ? {
                    expression: /使用/.test(item.value) ? `History.PaperId IS ${ /未使用/.test(item.value) ? '' : 'NOT ' }NULL` : `History.SubscribeYear = ${item.value}`
                } : null
            },
            remote: {
                expression: 'CASE History.PaperId WHEN NULL THEN ? ELSE TO_CHAR(History.SubscribeYear) END',
                alias: '_DEF_CAT_0',
                value: ['未使用'],
                desc: true,
                group: '_DEF_CAT_0',
            }
        },
    ], beforeRequest);

    PaperView.search.splice(PaperView.search.length, 0, appSearch[0], {
        label: '状  态',
        width: '400px',
        labelWidth: '110px',
        type: 'radio',
        value: _ALL_CATEGORY_,
        options: [_ALL_CATEGORY_OPTION_, {label: '启用'}, {label: '废弃'}],
        criteria(item) {
            return item.value && item.value !== _ALL_CATEGORY_ ? {
                expression: `isValid = ${item.value === '启用' ? 'TRUE' : 'FALSE'}`
            } : null
        }
    })
    debugger
}

export default function () {
    const PaperView = Paper.call(this)
    PaperView.columns[PaperView.columns.length - 1] = {
        expression: 'CASE isValid WHEN TRUE THEN ? ELSE ? END',
        value: ['启用', '废弃'],
        label: '状态',
        width: '100',
        sortable: true
    }
    appSearch.call(this, PaperView)
    return {
        ...PaperView,
        buttons: isManager.call(this) ? [{
            label: '导入',
            title: '刊物信息导入',
            type: 'primary',
            handle() {
                service.openForm.call(this, '', form.UploadForm, {})
            }
        }, newButton(page), deleteButton(model), setInvalidButton(model), setInvalidButton(model, {label: '取消作废'}, true)] : [],
        category: category.call(this),
        beforeRequest
    }
}
