import service from '../../../../service'
import { searchOptions, _ALL_CATEGORY_, _ALL_CATEGORY_OPTION_ } from "../../../DbInterface/config/base-config";

export const paper = service.models.paper
export const subscription = service.models.subscription
export const order = service.models.order
export const paperAlias = service.modelAlias(paper.model)
export const subscriptionAlias = service.modelAlias(subscription.model)
export const orderAlias = service.modelAlias(order.model)

export function beforeRequest (request) {
    return Object.assign(request ? request : {}, {
        model: subscription.model,
        tableAlias: subscriptionAlias,
        join: [{
            type: 'LEFT',
            model: order.model,
            tableAlias: orderAlias,
            on: {
                expression: `${subscriptionAlias}.id = ${orderAlias}.pid`
            },
            join: [{
                type: 'LEFT',
                model: paper.model,
                tableAlias: paperAlias,
                on: {
                    expression: `${orderAlias}.paperId = ${paperAlias}.id`
                }
            }]
        }]
    })
}

export function generateRequest () {
    let criteria = {
        expression: [],
        value: []
    }
    this.where.forEach(row => {
        row.forEach(item => {
            let expression, value
            if (typeof item.criteria === 'function' && ({
                expression,
                value
            } = ((value = item.criteria(item)) ? value : {})) && expression) {
            } else if (/\?/g.test(expression = item.expression)) {
                value = item.value
            } else
                return

            service.criteria(criteria, expression, value)
        })
    })
    return beforeRequest(criteria.expression.length > 0 ? {
        where: {
            expression: criteria.expression.join(' and '),
            value: criteria.value
        }
    } : null
    )
}

const searchConfig = [
    [
        {
            label: '所属年份',
            span: 8,
            value: _ALL_CATEGORY_,
            criteria (item) {
                return item.value && item.value !== _ALL_CATEGORY_ ? {
                    expression: `${subscriptionAlias}.subscribeYear=?`,
                    value: item.value
                } : null
            },
            type: 'select',   //date, number, select, radio, checkbox, other
            width: '100%',
            remote: {
                expression: `${subscriptionAlias}.subscribeYear`,
                //value:[],   //expresion参数
                //group: 'subscribeYear', //可选
                desc: true,
            },
            options: [_ALL_CATEGORY_OPTION_]
        },
        {
            label: '订阅途经',
            span: 8,
            value: _ALL_CATEGORY_,
            criteria (item) {
                return item.value && item.value !== _ALL_CATEGORY_ ? {
                    expression: `${paperAlias}.deliveryMethod=?`,
                    value: item.value
                } : null
            },
            type: 'select',   //date, number, select, radio, checkbox, other
            width: '100%',
            remote: {
                expression: `${paperAlias}.deliveryMethod`,
                //value:[],   //expresion参数
                //group: 'subscribeYear', //可选
                desc: true,
            },
            options: [_ALL_CATEGORY_OPTION_]
        },
        {
            label: '订阅单位',
            span: 8,
            value: _ALL_CATEGORY_,
            criteria (item) {
                return item.value && item.value !== _ALL_CATEGORY_ ? {
                    expression: `${subscriptionAlias}.subscribeOrg=?`,
                    value: item.value
                } : null
            },
            type: 'select',   //date, number, select, radio, checkbox, other
            width: '100%',
            remote: {
                expression: `${subscriptionAlias}.subscribeOrg`,
                //value:[],   //expresion参数
                //group: 'subscribeYear', //可选
                desc: true,
            },
            options: [_ALL_CATEGORY_OPTION_]
        }
    ],
    [
        {
            label: '报刊名称',
            span: 8,
            value: '',
            criteria (item) {
                return item.value ? {
                    expression: `${paperAlias}.publication=?`,
                    value: item.value
                } : null
            },
            type: 'other',
            width: '100%',
        },
        {
            label: '订阅类型',
            value: _ALL_CATEGORY_,
            span: 8,
            width: '100%',
            criteria (item) {
                return item.value && item.value !== _ALL_CATEGORY_ ? {
                    expression: `${subscriptionAlias}.govExpense=${item.value === '公费' ? 'TRUE' : 'FALSE'}`
                } : null
            },
            type: 'select',
            options: [_ALL_CATEGORY_OPTION_, { label: '自费' }, { label: '公费' }]
        },
        {
            label: '报纸/期刊',
            span: 8,
            value: _ALL_CATEGORY_,
            criteria (item) {
                return item.value && item.value !== _ALL_CATEGORY_ ? {
                    expression: `${paperAlias}.journal=?`,
                    value: item.value
                } : null
            },
            type: 'select',   //date, number, select, radio, checkbox, other
            width: '100%',
            remote: {
                expression: `${paperAlias}.journal`,
                //value:[],   //expresion参数
                //group: 'subscribeYear', //可选
                desc: true,
            },
            options: [_ALL_CATEGORY_OPTION_]
        },
    ],
    /*[{
        label: '是否审核',
        span: 24,
        value: '已审核',
        criteria(item) {
            return {
                expression: `${subscriptionAlias}.verifyStatus${item.value === '已审核' ? '=2' : (item.value === '待审核' ? '=1' : '>0')}`
            }
        },
        type: 'radio',
        options: [_ALL_CATEGORY_OPTION_, {label: '已审核'}, {label: '待审核'}]
    }],*/
    [{
        label: '统计类型',
        span: 24,
        value: '送邮局清单',
        type: 'radio',
        options: '送邮局清单 报纸期刊订阅明细表 报纸期刊订阅明细总表 总报刊金额汇总表 各部门金额汇总表'.split(/\s/g).map(label => ({ label }))
    }],
    [{
        label: '统计分页',
        span: 8,
        width: '100%',
        value: '15条/页',
        type: 'select',
        options: [{
            label: '无',
            value: 0
        }, {
            label: '6条/页',
            value: 6
        }, {
            label: '15条/页',
            value: 15
        }, {
            label: '25条/页',
            value: 25
        }, {
            label: '50条/页',
            value: 50
        }]
    }, {
        label: '户名/经手人',
        span: 16,
        value: -1,
        type: 'select',
        width: '100%',
        options: [{
            label: '无',
            value: -1
        }]
    }],
]

function statConfigData (config) {
    service.select.call(this, service.models.statPrintConfig, null, null, 0, 1000, query => {
        query.order = [`${service.camelToUpperUnderscore('sortNo')} ASC`]
    }).then(response => {
        const options = config.options
        options.splice(1, options.length - 1)
        response.forEach((item, index) => {
            options.push({
                label: `${item.company}（${item.transactor}）${item.address} ${item.phoneNo}`,
                value: index
            })
        })
        Object.assign(config, {
            response,
            value: options[options.length > 1 ? 1 : 0].value
        })
    }).catch(err => {
        service.error.call(this, err)
    })
}

export default function () {
    const where = searchOptions.call(this, searchConfig, beforeRequest)
    statConfigData.call(this, where[where.length - 1][1])
    return {
        where
    }
}
