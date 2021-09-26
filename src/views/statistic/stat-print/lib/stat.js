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
    let page = parseInt(this.where[this.where.length - 1][0].value)
    this.result.page = page < 1 ? (this.result.data.length < 1 ? 1 : this.result.data.length) : page

    let html = ['<td width="80px">序号</td>']
    this.result.columns.forEach(item => {
        if (!item.hidden) html.push(`<td>${item.label}</td>`)
    })
    return `<tr>${html.join('')}</tr>`
}

function resultTitle() {
    return `<tr><td class="stat-result-title none-border-has-bottom" colspan="${this.result.columns.length + 1}">${this.where[this.where.length - 2][0].value}</td></tr>`
}

function defaultExtend() {
    const colTitle = extension.call(this)
    const len = this.result.columns.length
    const count = this.result.data.length
    const time = service.formatDate(new Date(), 'yyyy年mm月dd日')
    Object.assign(this.result, {
        thead(pIndex, page) {
            return [
                `<tr><td class="stat-result-title none-border" style="padding-bottom: 5px!important" colspan="${this.result.columns.length + 1}">${this.where[this.where.length - 2][0].value}</td></tr>`,
                `<tr>
                     <td class="none-border-has-bottom" colspan="${len+1}">
                          <div class="text-align-left">
                               <span style="min-width: 120px; ">第${pIndex}页&emsp;共${Math.ceil(this.result.data.length / page)}页</span>
                               <span class="text-align-right" style="min-width: 120px; float: right;">打印时间：${time}</span>
                          </div>
                     </td>
                </tr>`,
                colTitle
            ].join('')
        }
    })
}

const modeConfig = {
    "送邮局清单": {
        fields,
        group: {
            expression: `${paperAlias}.postalDisCode, ${paperAlias}.publication, subscribeYear, subscribeMonthBegin, subscribeMonthBegin, subscribeMonthEnd`
        },
        extend: function () {
            const title = resultTitle.call(this)
            const colTitle = extension.call(this)
            const len = this.result.columns.length
            const count = this.result.data.length
            Object.assign(this.result, {
                thead(pIndex, page) {
                    return [
                        title,
                        `<tr>
                            <td colspan="${len+1}">
                                 <div class="text-align-left">
                                     <span style="min-width: 120px; ">户名：XXX单位/人 (对应查询里的订阅单位)</span>
                                     <span style="min-width: 120px; margin-left: 50px;">经手人：当前登录用户</span>
                                     <span class="text-align-right" style="min-width: 120px; float: right;">共${Math.ceil(this.result.data.length / page)}页，第${pIndex}页</span>
                                 </div>
                                 <div class="text-align-left">
                                     <span style="min-width: 120px; ">地址：XXXXXX</span>
                                     <span class="text-align-right" style="min-width: 120px; float: right;">电话：1560591XXXX</span>
                                 </div>
                            </td>
                        </tr>`,
                        colTitle
                    ].join('')
                },
                tfoot(pIndex, page){
                    return `<tr>
                            <td colspan="${len+1}">
                                 <div class="text-align-left"><span style="min-width: 150px; ">发行员：</span>
                                     <span style="min-width: 150px; margin-left: 70px;">日戳：</span>
                                     <span class="text-align-right" style="min-width: 120px; float: right;">本页小计：${(page * pIndex > count ? count : page * pIndex) - page * (pIndex-1)}件</span>
                                 </div>
                                 <div class="text-align-right">共计：${count}件</div>
                                 <div class="text-align-left">附注：1.报纸、杂志应分单填写，填写一式两份。<br>&emsp;&emsp;&emsp;2.本单不作收据凭证、收款另以报刊费收据为凭。</div>
                            </td>
                        </tr>`
                }
            })
        }
    },
    "报纸+期刊订阅明细表": {
        fields: [
            ...fields, {
                expression: `CASE ${subscriptionAlias}.govExpense WHEN TRUE THEN ${subscriptionAlias}.subscribeOrg ELSE ${subscriptionAlias}.subscribeUser END`,
                alias: 'org',
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
        },
        order: ['org DESC'],
        extend: function () {
            const title = resultTitle.call(this)
            const colTitle = extension.call(this)
            const len = this.result.columns.length
            const count = this.result.data.length
            Object.assign(this.result, {
                thead(pIndex, page) {
                    return [
                        title,
                        colTitle
                    ].join('')
                },
                tfoot(pIndex, page){
                    let limit = page * pIndex > count ? count : page * pIndex,
                        sum = 0, data=this.result.data
                    for(let i=page * (pIndex-1), val, item; i < limit; i++){
                        if(!isNaN(val=parseInt(data[i].amount))){
                            sum+=val
                        }
                    }
                    return `<tr>
                            <td colspan="${len+1}">
                                 <div class="text-align-left">
                                    <span style="min-width: 120px; ">本页合计金额：${sum}</span>
                                 </div>
                            </td>
                        </tr>`
                }
            })
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
        },
        extend: function () {
            const title = resultTitle.call(this)
            const colTitle = extension.call(this)
            const len = this.result.columns.length
            const count = this.result.data.length
            Object.assign(this.result, {
                thead(pIndex, page) {
                    return [
                        title,
                        colTitle
                    ].join('')
                }
            })
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
        },
        extend: defaultExtend
    },
    "各部门金额汇总表": {
        fields: [{
            expression: `${subscriptionAlias}.subscribeOrg`,
            alias: 'org',
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
        order: ['org DESC'],
        extend: defaultExtend
    }
}

export function query(request, callback) {
    let mode = this.where[this.where.length - 2][0].value,
        config = modeConfig[mode]
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
        if (typeof callback === 'function') callback(response, request, config)
    }).catch(err => {
        service.error.call(this, err)
    })
}

export default {
    query
}
