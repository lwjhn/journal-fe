import service from '../../../../service'
import {tableAlias} from "../../../DbInterface/config/Subscription";
import {_ALL_CATEGORY_} from "../../../DbInterface/config/base-config";

export const paper = service.models.paper
export const subscription = service.models.subscription
export const order = service.models.order
export const paperAlias = service.modelAlias(paper.model)
export const subscriptionAlias = service.modelAlias(subscription.model)
export const orderAlias = service.modelAlias(order.model)

//join orderLimit table to sort by the org
export const orderLimit = service.models.orderLimit
export const orderLimitAlias = service.modelAlias(orderLimit.model)


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
        width: '100',
        sortable: true,
    }, {
        expression: `sum(${paperAlias}.yearPrice * ${orderAlias}.subscribeCopies)`,
        alias: 'amount',
        label: '总金额',
        width: '100',
    }
]

function extension(resolve) {
    let page = parseInt(this.refWhere.page.value)
    this.result.page = page < 1 ? (this.result.data.length < 1 ? 1 : this.result.data.length) : page

    let html = ['<td width="80px">序号</td>']
    this.result.columns.forEach(item => {
        if (!item.hidden) html.push(`<td>${item.label}</td>`)
    })
    return `<tr>${(typeof resolve === 'function'? resolve(html) : html).join('')}</tr>`
}

function resultTitle(apply) {
    let year = this.refWhere.year
    year = year.value && year.value !== _ALL_CATEGORY_ ? (year.value + '年') : ''
    return `<tr><td class="stat-result-title none-border-has-bottom" colspan="${this.result.columns.length + 1}">${
        typeof apply === 'function' ? apply(this.refWhere.statType.value, year) : (year + this.refWhere.statType.value)
    }</td></tr>`
}

function defaultExtend() {
    const title = resultTitle.call(this).replace('none-border-has-bottom"', 'none-border" style="padding-bottom: 5px!important"')
    const colTitle = extension.call(this)
    const len = this.result.columns.length
    const count = this.result.data.length
    const time = service.formatDate(new Date(), 'yyyy年MM月dd日')
    Object.assign(this.result, {
        thead(pIndex, page) {
            return [
                title,
                `<tr>
                     <td class="none-border-has-bottom" colspan="${len + 1}">
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

const commonConfig = {
    where: {
        expression: `${subscriptionAlias}.verifyStatus=2`
    }
}
const modeConfig = {
    "送邮局清单": {
        ...commonConfig,
        fields,
        group: {
            expression: `${paperAlias}.postalDisCode, ${paperAlias}.publication, subscribeYear, subscribeMonthBegin, subscribeMonthBegin, subscribeMonthEnd`
        },
        order: {
            expression: `max(${paperAlias}.sortNo) ASC`
        },
        extend: function () {
            const title = resultTitle.call(this)
            const colTitle = extension.call(this)
            const len = this.result.columns.length
            const count = this.result.data.length

            const option = {}
            for(let key in this.refWhere){
                option[key]=this.refWhere[key].value
            }
            Object.assign(this.result, {
                thead(pIndex, page) {
                    return [
                        title,
                        `<tr>
                            <td colspan="${len + 1}">
                                 <div class="text-align-left">
                                     <span style="min-width: 120px; ">户名：${option && option.company ? option.company : ''}</span>
                                     <span style="min-width: 120px; margin-left: 50px;">经手人：${option && option.transactor ? option.transactor : ''}</span>
                                     <span class="text-align-right" style="min-width: 120px; float: right;">共${Math.ceil(this.result.data.length / page)}页，第${pIndex}页</span>
                                 </div>
                                 <div class="text-align-left">
                                     <span style="min-width: 120px; ">地址：${option && option.address ? option.address : ''}</span>
                                     <span class="text-align-right" style="min-width: 120px; float: right;">电话：${option && option.phoneNo ? option.phoneNo : ''}</span>
                                 </div>
                            </td>
                        </tr>`,
                        colTitle
                    ].join('')
                },
                tfoot(pIndex, page) {
                    return `<tr>
                            <td colspan="${len + 1}">
                                 <div class="text-align-left"><span style="min-width: 150px; ">发行员：</span>
                                     <span style="min-width: 150px; margin-left: 70px;">日戳：</span>
                                     <span class="text-align-right" style="min-width: 120px; float: right;">本页小计：${(page * pIndex > count ? count : page * pIndex) - page * (pIndex - 1)}件</span>
                                 </div>
                                 <div class="text-align-right">共计：${count}件</div>
                                 <div class="text-align-left">附注：1.报纸、杂志应分单填写，填写一式两份。<br>&emsp;&emsp;&emsp;2.本单不作收据凭证、收款另以报刊费收据为凭。</div>
                            </td>
                        </tr>`
                }
            })
        }
    },
    "报纸期刊订阅明细表": {
        ...commonConfig,
        fields: [
            ...fields, {
                expression: `CASE REGEXP_LIKE(${subscriptionAlias}.subscribeOrgNo, ?, ?)
                                WHEN FALSE THEN ${subscriptionAlias}.subscribeUser ELSE ${subscriptionAlias}.subscribeOrg END`, //`${subscriptionAlias}.subscribeOrg`,
                value:['^[a-z][0-9]{5,6}$', 'i'],
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
                        ${subscriptionAlias}.subscribeOrg, ${subscriptionAlias}.subscribeOrgNo, ${subscriptionAlias}.subscribeUser`
        },
        order: {
            expression: `max(${orderLimitAlias}.sortNo) ASC, ${subscriptionAlias}.subscribeOrg, max(${paperAlias}.sortNo) ASC`
        },
        beforeRequest(request) {
            request.join.push({
                type: 'LEFT',
                tableAlias: orderLimitAlias,
                table: {
                    fields: [{expression: 'company', alias: 'company'}, {expression: 'max(sortNo)', alias: 'sortNo'}],
                    model: orderLimit.model,
                    group: {expression: 'company'}
                },
                on: {
                    expression: `${orderLimitAlias}.company = ${subscriptionAlias}.subscribeOrg`
                }
            })
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
                },
                tfoot(pIndex, page) {
                    let limit = page * pIndex > count ? count : page * pIndex,
                        sum = 0, data = this.result.data
                    for (let i = page * (pIndex - 1), val, item; i < limit; i++) {
                        if (!isNaN(val = parseInt(data[i].amount))) {
                            sum += val
                        }
                    }
                    return `<tr>
                            <td colspan="${len + 1}">
                                 <div class="text-align-left">
                                    <span style="min-width: 120px; ">本页合计金额：${sum}</span>
                                 </div>
                            </td>
                        </tr>`
                }
            })
        }
    },
    "报纸期刊订阅明细总表": {
        ...commonConfig,
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
            width: '100',
            sortable: true,
        }],
        group: {
            expression: `${paperAlias}.postalDisCode, ${paperAlias}.publication`
        },
        order: {
            expression: `max(${paperAlias}.sortNo) ASC`
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
                },
                tfoot(pIndex, page) {
                    return`<tr>
                         <td class="none-border" colspan="${len + 1}">
                              <div class="text-align-center">
                                   <span style="line-height: 2">第${pIndex}页，共${Math.ceil(this.result.data.length / page)}页</span>
                                  <!-- <span class="text-align-right" style="min-width: 120px; float: right;">打印时间：</span> -->
                              </div>
                         </td>
                    </tr>`
                }
            })
        }
    },
    "各报刊金额汇总表": {
        ...commonConfig,
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
            width: '120',
            sortable: true,
        }, {
            expression: `sum(${paperAlias}.yearPrice * ${orderAlias}.subscribeCopies)`,
            alias: 'amount',
            label: '总金额',
            width: '120',
        }],
        group: {
            expression: `${paperAlias}.postalDisCode, ${paperAlias}.publication`
        },
        order: {
            expression: `max(${paperAlias}.sortNo) ASC`
        },
        extend(){
            defaultExtend.call(this)
            const title = resultTitle.call(this)
            const colTitle = extension.call(this)
            const len = this.result.columns.length
            const count = this.result.data.length
            Object.assign(this.result, {
                tfoot(pIndex, page) {
                    let limit = page * pIndex > count ? count : page * pIndex,
                        sum = 0, data = this.result.data, copies = 0
                    for (let i = page * (pIndex - 1), val, item; i < limit; i++) {
                        copies++
                        if (!isNaN(val = parseInt(data[i].amount))) {
                            sum += val
                        }
                    }
                    return `<tr><td colspan="2" >本页小计：</td>
                            <td colspan="${len - 3}">${copies}份</td>
                            <td colspan="2">${sum}元</td>
                        </tr>`
                }
            })
        }
    },
    "各部门金额汇总表": {
        ...commonConfig,
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
            width: '100',
            sortable: true,
        }, {
            expression: `sum(${paperAlias}.yearPrice * ${orderAlias}.subscribeCopies)`,
            label: '总金额',
            width: '100',
        }, {
            label: '备注',
            width: '80',
        }],
        group: {
            expression: `${subscriptionAlias}.subscribeOrg`
        },
        order: {
            expression: `max(${orderLimitAlias}.sortNo) ASC`
        },
        beforeRequest(request) {
            request.join.push({
                type: 'LEFT',
                tableAlias: orderLimitAlias,
                table: {
                    fields: [{expression: 'company', alias: 'company'}, {expression: 'max(sortNo)', alias: 'sortNo'}],
                    model: orderLimit.model,
                    group: {expression: 'company'}
                },
                on: {
                    expression: `${orderLimitAlias}.company = ${subscriptionAlias}.subscribeOrg`
                }
            })
        },
        extend(){
            defaultExtend.call(this)
            const title = resultTitle.call(this)
            const colTitle = extension.call(this)
            const len = this.result.columns.length
            const count = this.result.data.length
            const time = service.formatDate(new Date(), 'yyyy年MM月dd日')

            Object.assign(this.result, {
                tfoot(pIndex, page) {
                    let limit = page * pIndex > count ? count : page * pIndex,
                        sum = 0, data = this.result.data, copies = 0
                    for (let i = page * (pIndex - 1), val, item; i < limit; i++) {
                        copies++
                        if (!isNaN(val = parseInt(data[i].amount))) {
                            sum += val
                        }
                    }
                    return `<tr><td colspan="2">本页小计：</td>
                            <td colspan="${len - 3}">${copies}份</td>
                            <td colspan="2" >
                                ${sum}元
                            </td>
                        </tr>`
                }
            })
        }
    }
}

export function query(request, callback) {
    let mode = this.refWhere.statType.value,
        config = modeConfig[mode]
    if (!config) {
        return service.error.call(this, '参数错误！can not find mode of ' + mode)
    }
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
    if (typeof config.beforeRequest === "function") {
        config.beforeRequest.call(this, request)
    }
    this.$utils.ajax.post(service.apis.query(), request).then(response => {
        if (typeof callback === 'function') callback(response, request, config)
    }).catch(err => {
        service.error.call(this, err)
    })
}

export default {
    query
}
