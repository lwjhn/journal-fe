import {
    isManager
} from './base-config'
import service from '../../../service'
import form from '../../form'

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
    {label: '分发刊期', name: 'period'}
]

function generateHtml() {
    let rows = [], col
    for (let i = 0, conf; i < config.length; i++) {
        conf = config[i]
        if (i % 2 === 0) {
            rows.push(col = [])
        }
        col.push(`<div class="el-col el-col-12">
            <div class="el-form-item el-form-item--small">
                <label class="el-form-item__label" style="width: 110px;">${conf.label}:</label>
                <div class="el-form-item__content" style="margin-left: 110px;">
                    <div class="el-input el-input--small is-disabled"><input type="text" name="${conf.name}" disabled="disabled" class="el-input__inner" value=""></div>
                </div>
            </div>
        </div>`)
    }
    service.selectOne.call(this, service.models.paper, `postalDisCode = ?`, this.$attrs.postalDisCode)
        .then(response => {
            if (response.length < 1) {
                return service.error.call(this, '未找到相关刊物信息！' + this.$attrs.postalDisCode)
            }
            response = response[0]
            let value
            config.forEach(item => {
                if (document.getElementsByName(item.name).length > 0) {
                    document.getElementsByName(item.name)[0].value = typeof item.format === 'function' ? item.format.call(this, response) : ((value = response[item.name]) ? value : '')
                }
            })
        }).catch((err) => {
        service.error.call(this, err)
    })
    return `<style>.header-top__buttons{ width: 100%; margin-top: 20px; } .header-top__right { display: none; }</style>  <div class="el-row"> ${rows.join('</div><div class="el-row">')} </div>`
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
            service.sql(query, `${paperAlias}postalDisCode = ? and ${tableAlias}verifyStatus = 2`, [this.$attrs.postalDisCode])
            if (this.$attrs.orderId) {
                service.sql(`${orderAlias}.id`, this.$attrs.orderId)
            }
            debugger
        },
        html: generateHtml.call(this)
    }
}
