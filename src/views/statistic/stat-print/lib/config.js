import service from '../../../../service'
import {searchOptions, _ALL_CATEGORY_, _ALL_CATEGORY_OPTION_} from "../../../DbInterface/config/base-config";

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
    this.where.forEach(item => {
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

    return beforeRequest(criteria.expression.length > 0 ? {
            where: {
                expression: criteria.expression.join(' and '),
                value: criteria.value
            }
        } : null
    )
}

function searchConfig() {
    const ___this = this
    return [
        {
            ref: 'year',
            label: '所属年份',
            labelWidth: '140px',
            width: '33%',
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
            label: '订阅类型',
            labelWidth: '140px',
            width: '33%',
            value: _ALL_CATEGORY_,
            criteria(item) {
                return item.value && item.value !== _ALL_CATEGORY_ ? {
                    expression: `${subscriptionAlias}.govExpense=${item.value === '公费' ? 'TRUE' : 'FALSE'}`
                } : null
            },
            type: 'select',
            options: [_ALL_CATEGORY_OPTION_, {label: '自费'}, {label: '公费'}]
        },
        {
            label: '订阅途经',
            labelWidth: '140px',
            width: '34%',
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
            labelWidth: '140px',
            width: '33%',
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
        },
        {
            label: '订 阅 人',
            labelWidth: '140px',
            width: '33%',
            value: _ALL_CATEGORY_,
            criteria(item) {
                return item.value && item.value !== _ALL_CATEGORY_ ? {
                    expression: `${subscriptionAlias}.subscribeUser=?`,
                    value: item.value
                } : null
            },
            type: 'select',   //date, number, select, radio, checkbox, other
            remote: {
                expression: `${subscriptionAlias}.subscribeUser`,
                desc: true,
            },
            options(option) {
                return [_ALL_CATEGORY_OPTION_]
            },
        },
        {
            label: '报纸/期刊',
            labelWidth: '140px',
            width: '33%',
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
        {
            label: '报刊名称',
            labelWidth: '140px',
            width: '100%',
            value: '',
            criteria(item) {
                return item.value ? {
                    expression: `${paperAlias}.publication like ?`,
                    value: `%${item.value}%`
                } : null
            },
            type: 'other',
        },
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
        {
            ref: 'statType',
            label: '统计类型', labelWidth: '140px', width: '100%',
            value: '送邮局清单',
            type: 'radio',
            options: '送邮局清单 报纸期刊订阅明细表 报纸期刊订阅明细总表 各报刊金额汇总表 各部门金额汇总表'.split(/\s/g).map(label => ({label}))
        },
        {
            ref: 'page',
            label: '统计分页', labelWidth: '140px', width: '100%',
            value: 15,
            type: 'select',
            allowCreate: true,
            options: [0, 6, 10, 15, 20, 30, 50].map(value => new Object({
                value,
                label: value === 0 ? '无' : `${value}条/页`
            }))
        },
        {
            width: '100%',
            type(createElement) {
                return createElement("div",
                    {
                        domProps: {
                            style: 'border-bottom: 1px dashed #e4e7ed;margin: 15px 0 10px 40px;'
                        }
                    }
                )
            },
        },
        createPrintConfig(___this, {
            ref: 'company',
            label: '户  名', labelWidth: '140px', width: '33%',
            value: '',
        }),
        createPrintConfig(___this, {
            ref: 'address',
            label: '地  址', labelWidth: '140px', width: '33%',
            value: ''
        }),
        createPrintConfig(___this, {
            ref: 'phoneNo',
            label: '电  话', labelWidth: '140px', width: 'calc(34% - 80px)',
            value: ''
        }),
        {
            width: '80px',
            type(createElement, config) {
                return createElement("el-button",
                    {
                        props: {
                            type: "primary",
                        },
                        domProps: {
                            // style: 'margin-left: 20px;',
                            innerHTML: '保存'
                        },
                        on: {
                            click: function () {
                                console.log(this)
                                debugger
                                alert(11)
                            }.bind(___this)
                        }
                    }
                )
            }
        },
        {
            ref: 'transactor',
            label: '经 手 人', labelWidth: '140px', width: '100%',
            value: this.$store.state.system.extraUserinfo.userName,
            type: 'input',
        },
    ]
}

function createPrintConfig(___this, extension, expressionFn, labelFn) {
    if (typeof expressionFn !== 'function') {
        expressionFn = (value => ({expression: value ? `${extension.ref} LIKE ?` : null, value}))
    }
    if (typeof labelFn !== 'function') {
        labelFn = (option => `${option.company} ${option.address} ${option.phoneNo}`)
    }
    return Object.assign({
        type(createElement, config) {
            return createElement("el-autocomplete",
                {
                    props: {
                        value: config.value,
                        placeholder: '请输入搜索内容',
                        fetchSuggestions: function (queryString, cb) {
                            let {expression, value} = expressionFn(queryString)
                            service.select.call(this, service.models.statPrintConfig, expression, value, 0, 100, query => {
                                query.order = [`${service.camelToUpperUnderscore('sortNo')} ASC`]
                            }).catch(err => {
                                service.error.call(this, err)
                            }).then(response => {
                                cb(response.map(option => ({value: labelFn(option), option})))
                            })
                        }.bind(___this)
                    },
                    domProps: {},
                    on: {
                        input(value) {
                            config.value = value
                        },
                        select: function (item) {
                            ['company', 'address', 'phoneNo'].forEach(key => {
                                this.refWhere[key].value = item.option[key]
                            })
                        }.bind(___this)
                    }
                }
            )
        },
    }, extension)
}

function statConfigData(expression, value) {
    return service.select.call(this, service.models.statPrintConfig, expression, value, 0, 100, query => {
        query.order = [`${service.camelToUpperUnderscore('sortNo')} ASC`]
    }).catch(err => {
        service.error.call(this, err)
    })
}

export default function () {
    const where = searchOptions.call(this, searchConfig.call(this), beforeRequest)
    const refWhere = {}
    where.forEach(o => refWhere[o.ref] = o)
    return {
        where,
        refWhere
    }
}
