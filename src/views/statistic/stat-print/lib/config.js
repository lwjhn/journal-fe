import {
    _ALL_CATEGORY_,
    _ALL_CATEGORY_OPTION_
} from './base'

import service from '../../../../service'

export const paper = service.models.paper
export const subscription = service.models.subscription
export const order = service.models.order
export const paperAlias = service.modelAlias(paper.model)
export const subscriptionAlias = service.modelAlias(subscription.model)
export const orderAlias = service.modelAlias(order.model)

export function beforeRequest(request) {
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

export function generateRequest() {
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

const config = {
    where: [
        [
            {
                label: '所属年份',
                span: 8,
                value: _ALL_CATEGORY_,
                criteria(item) {
                    return item.value && item.value !== _ALL_CATEGORY_ ? {
                        expression: `${subscriptionAlias}.subscribeYear=?`,
                        value: item.value
                    } : null
                },
                type: 'select',   //date, number, select, radio, checkbox, other
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
                criteria(item) {
                    return item.value && item.value !== _ALL_CATEGORY_ ? {
                        expression: `${paperAlias}.deliveryMethod=?`,
                        value: item.value
                    } : null
                },
                type: 'select',   //date, number, select, radio, checkbox, other
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
                criteria(item) {
                    return item.value && item.value !== _ALL_CATEGORY_ ? {
                        expression: `${subscriptionAlias}.subscribeOrg=?`,
                        value: item.value
                    } : null
                },
                type: 'select',   //date, number, select, radio, checkbox, other
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
                criteria(item) {
                    return item.value ? {
                        expression: `${paper}.publication=?`,
                        value: item.value
                    } : null
                },
                type: 'other'
            },
            {
                label: '订阅类型',
                width: '150px',
                value: '公费',
                criteria(item) {
                    return item.value && item.value !== _ALL_CATEGORY_ ? {
                        expression: `${subscriptionAlias}.govExpense=${item.value === '公费' ? 'TRUE' : '自费'}`
                    } : null
                },
                type: 'radio',
                options: [_ALL_CATEGORY_OPTION_, {label: '自费'}, {label: '公费'}]
            },
            {
                label: '报纸/期刊',
                span: 8,
                value: _ALL_CATEGORY_,
                criteria(item) {
                    return item.value && item.value !== _ALL_CATEGORY_ ? {
                        expression: `${paperAlias}.journal=?`,
                        value: item.value
                    } : null
                },
                type: 'select',   //date, number, select, radio, checkbox, other
                remote: {
                    expression: `${paperAlias}.journal`,
                    //value:[],   //expresion参数
                    //group: 'subscribeYear', //可选
                    desc: true,
                },
                options: [_ALL_CATEGORY_OPTION_]
            },
        ],
        [{
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
        },],
        [{
            label: '统计类型',
            span: 24,
            value: '送邮局清单',
            type: 'radio',
            options: '送邮局清单 报纸+期刊订阅明细表 报纸+期刊订阅明细总表 总报刊金额汇总表 各部门金额汇总表'.split(/\s/g).map(label => ({label}))
        },]
    ],
}

export default function () {
    let requests = [], origin = [],
        conf = service.extend(true, {}, config)
    conf.where.forEach(row => {
        row.forEach(col => {
            let remote = col.remote
            if (!(remote && remote.expression))
                return
            if (!remote.alias)
                remote.alias = 'label'
            let fields = [{
                expression: remote.expression,
                alias: remote.alias,
                value: remote.value
            }]
            requests.push(beforeRequest({
                fields,
                order: [`${col.remote.alias} ${col.remote.desc ? 'DESC' : 'ASC'}`],
                limit: [0, 1000],
                group: col.remote.group ? col.remote.group : fields[0]
            }))
            origin.push(col)
        })
    })

    this.$utils.ajax.post(service.apis.queries(), requests).then(res => {
        res.forEach((item, index) => {
            let col = origin[index],
                alias = col.remote.alias
            if (item) item.forEach(o => {
                col.options.push({label: o ? (o.hasOwnProperty(alias) ? o[alias] : o[alias]) : o})
            })
        })
    }).catch(err => {
        service.error.call(this, err)
    })
    return conf
}
