import {newButton, deleteButton, isManager} from './base-config'

import Paper, {page, model} from "./Paper"
import service from '../../../service'

const subscriptionAlias = 'subscription.'
const orderAlias = 'order.'
const paperAlias = 'paper.'

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
            value: ['无效'],
            label: '年度',
            width: '90px',
            desc: true,
            defaultValue(data, option, defaultValue) {
                let o
                return data.length < 1 ? defaultValue : (
                        (o = data.length>1 ? data[1] : data[0]) ? (o.hasOwnProperty(option.name) ? o[option.name] : o[option.alias]) : o
                    )
            },
            criteria(item) {
                return {
                    expression: /无效/.test(item.value) ? 'History.PaperId IS NULL' : `History.SubscribeYear = ${item.value}`
                }
            },
            group: {
                expression: 'History.SubscribeYear, History.PaperId IS NULL',
            },
/*            on: {
                change: function (value) {
                    showDeleteButton(value)
                }.bind(this)
            }*/
        }, {
            expression: `CASE isValid WHEN TRUE THEN ? ELSE ? END`,
            value: ['启用', '废弃'],
            label: '状态',
            width: '100px',
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

export default function () {
    const PaperView = Paper.call(this)
    PaperView.columns[PaperView.columns.length-1] = {
        expression: 'CASE isValid WHEN TRUE THEN ? ELSE ? END',
        value: ['启用', '废弃'],
        label: '状态',
        width: '100',
        sortable: true
    }
    return {
        ...PaperView,
        buttons: isManager.call(this) ? [newButton(page), deleteButton(model)] : [],
        category: category.call(this),
        beforeRequest(query, category, isCategory) {
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
                            {
                                expression: `${subscriptionAlias}subscribeYear`,
                                alias: 'subscribeYear'
                            }
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
                            expression: `${subscriptionAlias}subscribeYear, ${orderAlias}paperId`
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
        }
    }
}
