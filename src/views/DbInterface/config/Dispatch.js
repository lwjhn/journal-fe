import service from '../../../service'
import form from '../../form'
import callDispatch from "./dispatchCode";

export const page = form.SubscriptionForm
export const model = service.models.subscription
export const tableAlias = 'subscription.'
export const orderAlias = 'order.'
export const paperAlias = 'paper.'


const config = [
    {label: '报刊名称', name: 'publication'},
    {label: '邮发代号', name: 'postalDisCode'},
    {label: '类  型', name: 'journal'},
    {label: '语言种类', name: 'lang'},
    {label: '单  价', name: 'unitPrice'},
    {label: '年  价', name: 'yearPrice'},
    {
        label: '类  型', name: 'paperType', format(row) {
            return row.paperType ? JSON.parse(row.paperType).join('、') : ''
        }
    },
    {label: '条 码 号', name: 'barcode'},
    {label: '出 版 社', name: 'pressAddress'},
    {label: '分发刊期', name: 'period', disabled: false, required: true}
]

function generateHtml() {
    const DISPATCH_CACHE_KEY = '_journal_dispatch_cache_' + this.$attrs.postalDisCode

    let rows = [], col
    for (let i = 0, conf; i < config.length; i++) {
        conf = config[i]
        if (i % 2 === 0) {
            rows.push(col = [])
        }
        col.push(`<div class="el-col el-col-12">
            <div class="el-form-item ${conf.required ? 'is-required' : ''} el-form-item--small">
                <label class="el-form-item__label" style="width: 110px;">${conf.label}:</label>
                <div class="el-form-item__content" style="margin-left: 110px;">
                    <div class="el-input el-input--small ${conf.disabled === false ? '' : 'is-disabled'}">
                        <input type="text" ${conf.name === 'period' ? 'style="width: calc(100% - 70px)"' : ''} ${conf.disabled === false ? '' : 'disabled'} name="${conf.name}" class="el-input__inner" value="">
                        ${conf.name === 'period' ? `<button type=button class="dispatch el-button el-button--primary el-button--small"><span>确定</span></button>` : ''}
                    </div>
                </div>
            </div>
        </div>`)
    }

    service.selects.call(this, [
        {
            fields: service.queryFields(service.models.paper.form),
            model: service.models.paper.model,
            where: {
                expression: `postalDisCode = ?`,
                value: [this.$attrs.postalDisCode]
            },
            order: {
                expression: `isValid DESC , createTime DESC`
            },
            limit: [0, 1]
        }
    ].concat(this.$attrs.panelUrl ? [] : [{
        fields: [{expression: 'panelUrl', alias: service.camelToUpperUnderscore('panelUrl')}],
        model: service.models.dbConfig.model,
        limit: [0, 1]
    }]))
        .then(responses => {
            window.__journal_dispatch_url__ = responses.length > 1 && responses[1] && responses[1].length > 0 ? responses[1][0].panelUrl : undefined

            let response = responses[0]
            if (response.length < 1) {
                return service.error.call(this, '未找到相关刊物信息！' + this.$attrs.postalDisCode)
            }
            response = response[0]
            this.$nextTick(() => {
                let value, dom
                config.forEach(item => {
                    if (!!(dom = document.querySelector(`input[name=${item.name}]`))) {
                        dom.value = typeof item.format === 'function' ? item.format.call(this, response) : ((value = response[item.name]) ? value : '')
                    }
                })
            })
        }).catch((err) => {
        service.error.call(this, err)
    }).finally(() => {
        this.$nextTick(() => {
            document.querySelector('.journal_dispatch_box button.dispatch').addEventListener('click', () => {
                callDispatch.call(this, this.$attrs.panelUrl ? this.$attrs.panelUrl : window.__journal_dispatch_url__)
            })
        })
    })
    this.$nextTick(() => {
        let dom = this.journal_view_stat_box = document.createElement('div')
        dom.setAttribute('journal', 'journal_stat_box')
        dom.innerHTML = '共 0 个单位，0 份'
        this.$el.appendChild(dom)
    })

    return {
        template: `
            <div class="journal_dispatch_box">
            <div v-html="embedStyle"></div>
            <div class="el-row"> ${rows.join('</div><div class="el-row">')}</div>
            <div class="el-row">
                <div class="el-col el-col-24">
                    <div class="el-form-item el-form-item--small" style="margin-top: 5px;">
                        <label class="el-form-item__label" style="width: 110px;">分发处室:</label>
                        <div class="el-form-item__content" style="margin-left: 110px; display: flex;"
                             title="格式：处室（订阅数），以，；、或空字符分隔。例：处室A（2）、处室B（1）">
                            <el-autocomplete class="journal_dispatch_company" style="flex-grow: 1;"
                                             popper-class="journal_dispatch_company_autocomplete" :clearable="true"
                                             v-model="value" :fetch-suggestions="querySearch" @select="handleSelect"
                                             placeholder="请输入分发处室" type="textarea"
                                             :autosize="{ minRows: 1, maxRows: 8}">
                                <template slot-scope="{ item, index }">
                                    <span :title="item">{{ item }}</span>
                                </template>
                            </el-autocomplete>
                            <el-button type="primary" title="选择分发处室" @click="selectOrg">选择</el-button>
                            <el-button type="primary" plain title="删除缓存" @click="delCache">删除</el-button>
                            <el-button type="primary" plain title="缓存到当前刊型中" @click="cacheOptions">缓存</el-button>
                        </div>
                    </div>
                </div>
            </div>
            </div>`,
        props: {embedStyle: String},
        data() {
            return {
                value: '',
                options: []
            }
        },
        methods: {
            querySearch(queryString, cb) {
                cb(this.options)    //cb(queryString ? this.options.filter(item => queryString.toLowerCase().indexOf(item.toLowerCase())) : this.options)
            },
            handleSelect(item) {
                this.value = item
            },
            selectOrg() {
                // let origin = this.value.split(/[,;，；、]\s|[,;，；、\s]/g).filter(o=>o.trim()).map(o=>{
                //     let label = o.replace(/\s*[(（\[][\d]*[)）\]]*$/g,'')
                //     return {label, id: label}
                // })
                let expandTreeNode = {
                    //org: origin, user: origin
                }
                this.$multiTree({
                    request: {
                        org: {
                            url: '/user/rjUser/getTrees',
                            param: {treeType: 'org', isAll: true},
                            text: '组织'
                        },
                        user: {
                            url: '/user/rjUser/getTrees',
                            param: {treeType: 'user', isAll: true},
                            text: '人员'
                        },
                    },
                    tree: {
                        title: '选择分发处室',
                        multiplePattern: true,
                        props: {
                            expandTreeNode,
                            orgInfos: {},
                            orgRelatedParam: {},
                            isLocatedByUser: false,
                            isLocatedByMixedformat: false,
                            isExistSameNodeInDiffTree: true,
                            notAutoExpand: undefined,
                            isSelectName: undefined,
                            isScrollbarBotttom: undefined,
                            defaultActiveTabIndex: undefined,
                            deleteDisabled: undefined
                        },
                        treeField: undefined,
                        unique: false,
                        chkboxType: undefined,
                        area: undefined,
                        titleFontSize: undefined
                    },
                    targetOrder: 'default',
                    core: false,
                    singleChoiceResultType: 'array',
                    sysConditionRequestParam: undefined,
                    isElTabsHeader: false,
                    isFgwExTree: false
                }).then(response => {
                    this.value = (response ? response : []).map(item => item.label + '（1）').join('、')
                })
            },
            cacheOptions() {
                let value = this.value
                if (value && (value = value.trim()) && this.options.findIndex(o => o === value) < 0) {
                    this.options.push(value)
                    localStorage.setItem(DISPATCH_CACHE_KEY, JSON.stringify(this.options))
                }
            },
            delCache() {
                let i = this.options.findIndex(o => o === this.value)
                if (i > 0) {
                    this.options.splice(i, 1)
                    localStorage.setItem(DISPATCH_CACHE_KEY, JSON.stringify(this.options))
                }
                this.value = ''
            }
        },
        created() {
            try {
                let caches = JSON.parse(localStorage.getItem(DISPATCH_CACHE_KEY))
                if (Array.isArray(caches)) {
                    this.options = caches
                }
            } finally {
                //this.options = ['处室A（2）、处室B（1）、处室C（2）']
            }
        },
        bind: {
            embedStyle: `<style>.header-top__right { display: none; } .el-form-item--small.el-form-item {margin-bottom: 2px;}
        .header-top__buttons{ width: 100%; margin-top: 5px; }
        .journal_dispatch_box .el-input input{color: black !important;}
        .pagination-table .pagination-table__header .header-top {padding-bottom: 5px;}
        div[name=journal_dispatch_table]>div[journal=journal_stat_box] { width: 50%; position: relative; top: -30px;padding: 5px 10px; }
        .journal_dispatch_box .el-select__tags {flex-wrap: nowrap;overflow: hidden;}
        .journal_dispatch_box button { width: 60px; float: right; margin-left: 5px;}
    </style>`
        }
    }
}

/*
SELECT count(SUBSCRIBE_ORG) FROM
(SELECT SUBSCRIBE_ORG FROM EGOV_JOURNAL_SUBSCRIPTION
GROUP BY SUBSCRIBE_ORG)
 */
function stat(request) {
    let data = [
        {
            fields: [{
                expression: `count(${service.camelToUpperUnderscore('subscribeOrg')})`,
                alias: 'count'
            }],
            table: Object.assign({}, request, {
                fields: [{
                    expression: `${tableAlias}subscribeOrg`,
                    alias: service.camelToUpperUnderscore('subscribeOrg'),
                }],
                group: {
                    expression: `${tableAlias}subscribeOrg`
                },
                order: undefined,
                limit: undefined
            })
        },
        Object.assign({}, request, {
            fields: [{
                expression: `sum(${orderAlias}subscribeCopies)`,
                alias: 'count',
            }],
            group: undefined,
            order: undefined,
            limit: undefined
        })
    ]
    service.selects.call(this, data).then(response => {
        this.journal_view_stat_box.innerHTML = `共 ${response[0][0].count} 个订阅单位，${response[1][0].count ? response[1][0].count : 0} 份`
    }).catch(e => {
        this.journal_view_stat_box.innerHTML = '共 0 个单位，0 份'
    })
}


function before(query, category, isCategory) {
    if (!this.$attrs.postalDisCode) {
        throw new Error('参数错误！postalDisCode is undefined .')
    }
    beforeRequest.apply(this, arguments)
    service.sql(query, `${orderAlias}dispatched IS FALSE`)
    service.sql(query, `${paperAlias}postalDisCode = ? and ${tableAlias}verifyStatus = 2`, [this.$attrs.postalDisCode])
    if (this.$attrs.dispatched) {
        service.sql(query, `${orderAlias}dispatched is FALSE `)
    }
    if (this.$attrs.subscribeYear) {
        service.sql(query, `${tableAlias}subscribeYear=?`, this.$attrs.subscribeYear)
    }
    if (this.$attrs.orderId) {
        service.sql(query, `${orderAlias}id = ?`, this.$attrs.orderId)
    }
    try {
        stat.call(this, query)
    } finally {

    }
    return query
}

export function beforeRequest(query, category, isCategory, forceJoin) {
    query.tableAlias = tableAlias.replace(/\./, '')
    query.model = model.model
    if (forceJoin || !isCategory) {
        query.join = [{
            type: 'LEFT',
            model: service.models.order.model,
            tableAlias: orderAlias.replace(/\./, ''),
            on: {
                expression: `${tableAlias}id = ${orderAlias}pid`
            },
            join: [{
                type: 'LEFT',
                model: service.models.paper.model,
                tableAlias: paperAlias.replace(/\./, ''),
                on: {
                    expression: `${orderAlias}paperId = ${paperAlias}id`
                }
            }]
        }]
    }
    return query
}

export default function () {
    return {
        ...service.viewUrl(model),
        selection: [],
        columns: [
            {
                expression: tableAlias + 'id',
                alias: 'id',
                hidden: true
            }, {
                expression: orderAlias + 'id',
                alias: service.camelToUpperUnderscore('orderId'),
                hidden: true
            }, {
                expression: 'subscribeOrg',
                alias: service.camelToUpperUnderscore('subscribeOrg'),
                label: '订阅处室',
                minWidth: '120',
            }, {
                expression: 'subscribeUser',
                alias: service.camelToUpperUnderscore('subscribeUser'),
                label: '订阅人',
                minWidth: '120',
            }, {
                label: '期号',
                width: '100',
                format() {
                    return '1-12'
                }
            }, {
                expression: `${orderAlias}subscribeCopies`,
                alias: service.camelToUpperUnderscore('subscribeCopies'),
                label: '份数',
                width: '100',
                sortable: true,
            }, {
                expression: `${paperAlias}yearPrice * ${orderAlias}subscribeCopies`,
                label: '总金额',
                width: '100',
            }, {
                expression: tableAlias + 'subscribeYear',
                label: '订阅年份',
                width: '120',
                sortable: 'DESC',
            }
        ],
        beforeRequest(query, category, isCategory) {
            before.apply(this, arguments)
            if (typeof this._company_filter === 'function') {
                this._company_filter.apply(this, arguments)
            }
        },
        afterRequest(request, response, isCategory) {
            if (isCategory || !(response && response.list)) return
            try {
                this.$nextTick(() => this.$refs.refPagination.$refs.table.toggleAllSelection())
            } finally {
            }
        },
        html: generateHtml.call(this),
        bind: {
            name: 'journal_dispatch_table',
            pagination_pageSize: 1000,
            pagination_pageSizes: [10, 20, 50, 100, 1000, 2000],
        }
    }
}
