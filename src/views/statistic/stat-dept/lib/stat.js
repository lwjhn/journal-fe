import service from '../../../../service'
import {tableAlias} from "../../../DbInterface/config/Subscription";
import {_ALL_CATEGORY_} from "../../../DbInterface/config/base-config";

export const paper = service.models.paper
export const subscription = service.models.subscription
export const order = service.models.order
export const paperAlias = service.modelAlias(paper.model)
export const subscriptionAlias = service.modelAlias(subscription.model)
export const orderAlias = service.modelAlias(order.model)

const fields = [
    {
        expression: paperAlias + '.postalDisCode',
        label: '报刊代号',
        width: '100',
    }, {
        expression: paperAlias + '.publication',
        label: '报刊名称',
        minWidth: '140',
    }, {
        expression: 'LTRIM(subscribeYear) + ? + LTRIM(subscribeMonthBegin) + ? + LTRIM(subscribeMonthEnd) + ?',
        value: ['(', '-', ')'],
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
        alias: 'amount',
        label: '总金额',
        width: '80',
    }
]

function extension() {
    let page = 0    //parseInt(this.where[this.where.length - 1][0].value)
    this.result.page = page < 1 ? (this.result.data.length < 1 ? 1 : this.result.data.length) : page

    let html = ['<td width="80px">序号</td>']
    this.result.columns.forEach(item => {
        if (!item.hidden) html.push(`<td>${item.label}</td>`)
    })
    return `<tr>${html.join('')}</tr>`
}


const commonConfig = {
    where: {
        expression: `${subscriptionAlias}.verifyStatus=2`
    }
}
const modeConfig = {
    "本处室订阅统计": {
        ...commonConfig,
        fields: [{
            expression: paperAlias + '.publication',
            label: '报刊名称',
            minWidth: '140',
        }, {
            expression: `sum(${orderAlias}.subscribeCopies)`,
            alias:'copies',
            label: '份数',
            minWidth: '80',
            sortable: true,
        }, {
            expression: `sum(${paperAlias}.yearPrice * ${orderAlias}.subscribeCopies)`,
            alias: 'prices',
            label: '总金额',
            minWidth: '80',
        }],
        group: {
            expression: `${paperAlias}.publication`
        },
        extend() {
            const title = `<tr><td class="stat-result-title none-border-has-bottom" style="padding-bottom: 5px!important" colspan="${this.result.columns.length + 1}">本处室订阅统计</td></tr>`
            const colTitle = extension.call(this)
            Object.assign(this.result, {
                thead(pIndex, page) {
                    return [title, colTitle].join('')
                },
                tfoot(pIndex, page) {
                    let limit = page * pIndex > count ? count : page * pIndex,
                        data = this.result.data
                    let count = 0,copies = 0, prices = 0
                    for (let i = page * (pIndex - 1), item; i < limit; i++) {
                        item = data[i]
                        count++
                        copies+=item.copies
                        prices+=item.prices
                    }
                    return `<tr><td>${count+pIndex}</td><td>总计：${count}类</td><td>总计：${copies}份</td><td>总金额：${prices}</td></tr>`
                }
            })
        }
    }
}

export function query(request, callback) {
    let config = modeConfig['本处室订阅统计']
    if (config.where) {
        service.sql(request, config.where.expression, config.where.value)
    }
    Object.assign(request, config, {
        where: request.where,
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
        if (typeof callback === 'function') callback(response, request, config)
    }).catch(err => {
        service.error.call(this, err)
    })
}

export default {
    query
}
