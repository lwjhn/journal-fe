import service from '../../../../service'
import {tableAlias} from "../../../DbInterface/config/Subscription";

export const paper = service.models.paper
export const subscription = service.models.subscription
export const order = service.models.order
export const paperAlias = service.modelAlias(paper.model)
export const subscriptionAlias = service.modelAlias(subscription.model)
export const orderAlias = service.modelAlias(order.model)

const modeConfig = {
    "本处室订阅统计": {
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
        })
    })
    this.$utils.ajax.post(service.apis.query(), request).then(response => {
        if (typeof callback === 'function') callback(response, config.fields, mode)
    }).catch(err => {
        service.error.call(this, err)
    })
}


export function footTable(response, request){
    let count = 0,copies = 0, prices = 0
    response.forEach(item=>{
        count++
        copies+=item.copies
        prices+=item.prices
    })
    return `<tr><td>${count+1}</td><td>总计：${count}类</td><td>总计：${copies}份</td><td>总金额：${prices}</td></tr>`
}

export default {
    query
}
