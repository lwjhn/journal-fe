import {
    isManager
} from './base-config'
import service from '../../../service'
import form from '../../form'
import callDispatch from "./dispatchCode";
import {selects} from "../../../service/query";

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
    let rows = [], col
    for (let i = 0, conf, disabled; i < config.length; i++) {
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
                        ${conf.name === 'period' ? `<button type=button class="el-button el-button--primary el-button--small" style="width:60px;float: right;"><span>确定</span></button>` : ''}
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
                expression: `isValid is TRUE and postalDisCode = ?`,
                value: [this.$attrs.postalDisCode]
            },
            limit: [0, 1]
        }
    ].concat(this.$attrs.panelUrl ? [] : [{
        fields: [{expression: 'panelUrl', alias: service.camelToUpperUnderscore('panelUrl')}],
        model: service.models.dbConfig.model,
        limit: [0, 1]
    }]))
        .then(responses => {
            let response = responses[0]
            window.__journal_dispatch_url__= responses.length>1 && responses[1] && responses[1].length>0 ? responses[1][0].panelUrl : undefined

            if (response.length < 1) {
                return service.error.call(this, '未找到相关刊物信息！' + this.$attrs.postalDisCode)
            }
            response = response[0]
            let value, dom
            config.forEach(item => {
                if (!!(dom = document.querySelector(`input[name=${item.name}]`))) {
                    dom.value = typeof item.format === 'function' ? item.format.call(this, response) : ((value = response[item.name]) ? value : '')
                }
            })
        }).catch((err) => {
        service.error.call(this, err)
    }).finally(() => {
        document.querySelector('.table-extension-html button').addEventListener('click', () => {
            callDispatch.call(this, this.$attrs.panelUrl ? this.$attrs.panelUrl : window.__journal_dispatch_url__)
        })
    })
    return `<style>.header-top__right { display: none; } .el-form-item--small.el-form-item {margin-bottom: 2px;}
        .header-top__buttons{ width: 100%; margin-top: 5px; }
        .pagination-table .pagination-table__header .header-top {padding-bottom: 5px;}
    </style>  <div class="el-row"> ${rows.join('</div><div class="el-row">')} </div>`
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
        selection: true,
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
            if (!this.$attrs.postalDisCode) {
                throw new Error('参数错误！postalDisCode is undefined .')
            }
            beforeRequest.call(this, query, category, isCategory)
            service.sql(query, `${orderAlias}dispatched is FALSE and ${paperAlias}postalDisCode = ? and ${tableAlias}verifyStatus = 2`, [this.$attrs.postalDisCode])
            if (this.$attrs.orderId) {
                service.sql(`${orderAlias}.id`, this.$attrs.orderId)
            }
            debugger
        },
        html: generateHtml.call(this)
    }
}
