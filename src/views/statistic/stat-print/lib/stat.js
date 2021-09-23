import service from '../../../../service'
import {tableAlias} from "../../../DbInterface/config/Subscription";

export const paper = service.models.paper
export const subscription = service.models.subscription
export const order = service.models.order
export const paperAlias = service.modelAlias(paper.model)
export const subscriptionAlias = service.modelAlias(subscription.model)
export const orderAlias = service.modelAlias(order.model)

const fields = [
    {
        expression: paperAlias + '.postalDisCode',
        label: '邮发代号',
        width: '100',
    }, {
        expression: paperAlias + '.publication',
        label: '报刊名称',
        minWidth: '140',
    }, {
        expression: 'LTRIM(subscribeYear) + ? + LTRIM(subscribeMonthBegin) + ? + LTRIM(subscribeMonthEnd) + ?',
        value: ['年 ', '月 - ', '月'],
        label: '起止订期',
        width: '200',
        sortable: true,
    }, {
        expression: `sum(${orderAlias}.subscribeCopies)`,
        label: '份数',
        width: '80',
        sortable: true,
    }, {
        expression: `sum(${paperAlias}.yearPrice * ${orderAlias}.subscribeCopies)`,
        label: '总金额',
        width: '80',
    }
]
const modeConfig = {
    "送邮局清单": {
        fields,
        group: {
            expression: `${paperAlias}.postalDisCode, ${paperAlias}.publication, subscribeYear, subscribeMonthBegin, subscribeMonthBegin, subscribeMonthEnd`
        }
    },
    "报纸+期刊订阅明细表": {
        fields: [
            ...fields, {
                expression: `CASE ${subscriptionAlias}.govExpense WHEN TRUE THEN ${subscriptionAlias}.subscribeOrg ELSE ${subscriptionAlias}.subscribeUser END`,
                label: '订阅处室或人',
                minWidth: '130',
            }
        ],
        group: {
            expression: `${paperAlias}.postalDisCode,
                        ${paperAlias}.publication, subscribeYear,
                        subscribeMonthBegin,
                        subscribeMonthBegin,
                        subscribeMonthEnd,
                        CASE ${subscriptionAlias}.govExpense WHEN TRUE THEN ${subscriptionAlias}.subscribeOrg ELSE ${subscriptionAlias}.subscribeUser END`
        }
    },
    "报纸+期刊订阅明细总表": {
        fields: [{
            expression: paperAlias + '.postalDisCode',
            label: '邮发代号',
            width: '100',
        }, {
            expression: paperAlias + '.publication',
            label: '报刊名称',
            minWidth: '140',
        }, {
            expression: `sum(${orderAlias}.subscribeCopies)`,
            label: '份数',
            width: '80',
            sortable: true,
        }],
        group: {
            expression: `${paperAlias}.postalDisCode, ${paperAlias}.publication`
        }
    },
    "总报刊金额汇总表": {
        fields: [{
            expression: paperAlias + '.postalDisCode',
            label: '邮发代号',
            width: '100',
        }, {
            expression: paperAlias + '.publication',
            label: '报刊名称',
            minWidth: '140',
        }, {
            expression: `sum(${orderAlias}.subscribeCopies)`,
            label: '份数',
            width: '80',
            sortable: true,
        }, {
            expression: `sum(${paperAlias}.yearPrice * ${orderAlias}.subscribeCopies)`,
            label: '总金额',
            width: '80',
        }],
        group: {
            expression: `${paperAlias}.postalDisCode, ${paperAlias}.publication`
        }
    },
    "各部门金额汇总表": {
        fields: [{
            expression: `${subscriptionAlias}.subscribeOrg`,
            label: '订阅处室',
            minWidth: '130',
        }, {
            expression: `count(${paperAlias}.postalDisCode)`,
            label: '报刊种类',
            minWidth: '140',
        }, {
            expression: `sum(${orderAlias}.subscribeCopies)`,
            label: '份数',
            width: '80',
            sortable: true,
        }, {
            expression: `sum(${paperAlias}.yearPrice * ${orderAlias}.subscribeCopies)`,
            label: '总金额',
            width: '80',
        }],
        group: {
            expression: `${subscriptionAlias}.subscribeOrg`
        },
        extend: {

        }
    }
}

export function query(request, mode, callback) {
    let config = modeConfig[mode]
    if (!config) {
        return service.error.call(this, '参数错误！can not find mode of ' + mode)
    }
    Object.assign(request, config, {
        fields: config.fields.filter(o => o && o.expression).map((item, index) => {
            if (!item.alias)
                item.alias = 'item' + index
            return {
                expression: item.expression,
                alias: item.alias,
                value: item.value
            }
        }),
        extend: undefined
    })
    this.$utils.ajax.post(service.apis.query(), request).then(response => {
        if (typeof callback === 'function') callback(response, config.fields, mode)
    }).catch(err => {
        service.error.call(this, err)
    })
}

export default {
    query
}
