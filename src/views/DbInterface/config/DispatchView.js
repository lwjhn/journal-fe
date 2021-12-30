import {tableAlias, beforeRequest, orderAlias, paperAlias, search, category} from "./Subscription";
import service from '../../../service'
import {apis} from "../../../service/apis";
import view from "../index";


export function dispatchHandle(row) {
    if(!row && this.selection.length < 1){
        return service.warning.call(this, '请选择需要分发的刊物！')
    }
    if(!row){
        row = this.selection[0]
    }
    service.openForm.call(this, {
        id: row.postalDisCode,
        component: view.DbInterface,
        componentProps: Object.assign({
            view: 'Dispatch',
        }, row),
        isShowHeader: true,
        isMax: false,
        canRefresh: false,
        area: {
            width: Math.min(1000, document.body.clientWidth * 0.9),
            height: Math.min(800, document.body.clientHeight * 0.9)
        }
    }).then(() => {
        this.refresh();
    })
}

export default function () {
    const dispatched = service.url.getUrlHashParam('dispatched')
    return {
        ...service.viewUrl(),
        selection: [],
        category: [
            {
                expression: 'subscribeYear',
                label: '年度',
                width: '90px',
                desc: true,
                defaultValue(data, option, defaultValue) {
                    let o
                    return data.length < 1 ? defaultValue : (
                        (o = data[0]) ? (o.hasOwnProperty(option.name) ? o[option.name] : o[option.alias]) : o
                    )
                }
            }, {
                expression: 'subscribeOrg',
                label: '订阅处室',
                width: '210px',
                desc: true
            }
        ],
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
                expression: tableAlias + 'subscribeOrgNo',
                alias: service.camelToUpperUnderscore('subscribeOrgNo'),
                hidden: true
            }, {
                expression: tableAlias + 'subscribeYear',
                alias: service.camelToUpperUnderscore('subscribeYear'),
                label: '订阅年度',
                width: '120',
                sortable: 'DESC',
            }, {
                expression: 'subscribeOrg',
                alias: service.camelToUpperUnderscore('subscribeOrg'),
                label: '订阅处室',
                width: '120',
            }, {
                expression: 'subscribeUser',
                alias: service.camelToUpperUnderscore('subscribeUser'),
                label: '订阅人',
                width: '120',
            }, {
                expression: paperAlias + 'publication',
                alias: service.camelToUpperUnderscore('publication'),
                label: '报刊名称',
                minWidth: '140',
            }, {
                expression: `${paperAlias}postalDisCode`,
                alias: service.camelToUpperUnderscore('postalDisCode'),
                label: '邮发代号',
                minWidth: '100',
            }, {
                expression: `${orderAlias}subscribeCopies`,
                label: '份数',
                width: '80',
                sortable: true,
            }, {
                expression: `${paperAlias}yearPrice`,
                label: '年价',
                width: '80',
            }, {
                expression: `${paperAlias}yearPrice * ${orderAlias}subscribeCopies`,
                label: '总金额',
                width: '80',
            }, {
                expression: `CASE ${tableAlias}govExpense WHEN TRUE THEN ? ELSE ? END`,
                alias: service.camelToUpperUnderscore('govExpense'),
                value: ['公费', '自费'],
                label: '费用类型',
                width: '100',
            }, {
                expression: tableAlias + 'subscribeTime',
                alias: service.camelToUpperUnderscore('subscribeTime'),
                label: '订阅时间',
                width: '180',
                sortable: 'DESC',
                format(option, item) {
                    return service.formatStringDate(item.subscribeTime, 'yyyy-MM-dd hh:mm')
                }
            }
        ],
        keyword: `${paperAlias}publication LIKE ? OR ${paperAlias}postalDisCode LIKE ? OR ${tableAlias}subscribeUser LIKE ? OR ${tableAlias}subscribeOrg LIKE ?`,
        search: search.call(this),
        rowClick: dispatchHandle,
        buttons: (/^true$/i.test(dispatched) ? [] : [{
            label: '分发',
            type: 'primary',
            handle: dispatchHandle
        }]).concat(dispatched ? [{
            label: '筛除',
            type: 'primary',
            handle() {
                if(this.selection.length<1){
                    return service.warning.call(this, '请选择需要筛除的文件！')
                }
                let update = {
                    model: service.models.order.model,
                    values: {
                        dispatched: !/^true$/i.test(service.url.getUrlHashParam('dispatched'))
                    },
                    where: {
                        expression: `id IN (${this.selection.map(() => '?').join(', ')})`,
                        value: this.selection.map(item => item.orderId)
                    }
                }
                service.ajax.call(this, apis.update(), update).then(response => {
                    console.log(response)
                    try {
                        service.success.call(this, '筛除完成！')
                    } finally {
                        this.refresh()
                    }
                }).catch(e => {
                    console.log(e)
                })
            }
        }] : []),
        beforeRequest(query, category, isCategory) {
            beforeRequest.call(this, query, category, isCategory, true)
            service.sql(query, `${tableAlias}verifyStatus = 2`)
            if(dispatched){
                service.sql(query, `${orderAlias}dispatched is ${
                    /^true$/i.test(service.url.getUrlHashParam('dispatched')) ? 'TRUE' : 'FALSE'
                }`)
            }
        }
    }
}
