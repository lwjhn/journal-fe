import {tableAlias, beforeRequest, orderAlias, paperAlias, search, category} from "./Subscription";
import service from '../../../service'
import {apis} from "../../../service/apis";
import view from "../index";
import {dispatchHandle} from "./DispatchView"

export default function () {
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
            }
        ],
        columns: [
            {
                expression: `min(${paperAlias}publication)`,
                label: '报刊名称',
                minWidth: '140',
            },
            {
                expression: `${paperAlias}postalDisCode`,
                alias: service.camelToUpperUnderscore('postalDisCode'),
                label: '邮发代号',
                width: '150'
            }, {
                expression: `min(${paperAlias}journal)`,
                label: '类型',
                width: '120'
            }, {
                expression: `min(${paperAlias}yearPrice)`,
                label: '年价',
                width: '80',
            },{
                expression: `${tableAlias}subscribeYear`,
                alias: service.camelToUpperUnderscore('subscribeYear'),
                label: '订阅年度',
                width: '120',
                sortable: 'DESC',
            }, {
                expression: `sum(${orderAlias}subscribeCopies)`,
                label: '订阅总份数',
                width: '80'
            }
        ],
        keyword: `${paperAlias}publication LIKE ? OR ${paperAlias}postalDisCode LIKE ?`,
        search: search.call(this),
        rowClick: dispatchHandle,
        buttons: [{
            label: '分发',
            type: 'primary',
            handle: dispatchHandle
        }],
        beforeRequest(query, category, isCategory) {
            beforeRequest.call(this, query, category, isCategory, true)
            service.sql(query, `${tableAlias}verifyStatus = 2`)
            if(!isCategory){
                query.group = {
                    expression: `${tableAlias}subscribeYear , ${paperAlias}postalDisCode`
                }
            }
        }
    }
}
