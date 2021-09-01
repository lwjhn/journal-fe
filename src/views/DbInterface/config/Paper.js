import {deleteButton, newButton, rowClick, isManager} from './base-config'
import service from '../../../service'
import form from '../../form'
import {tableAlias} from "./Subscription";

const page = form.PaperForm
const model = service.models.paper

export default function () {
    return {
        ...service.viewUrl(model),
        selection: true,
        category: [
            {
                expression: `CASE isValid WHEN TRUE THEN ? ELSE ? END`,
                value: ['有效', '废弃'],
                label: '状态',
                width: '100px',
                desc: true,
                defaultValue: '有效',
                criteria(item) {
                    return {
                        expression: `${item.group.expression} = ${item.value === '有效' ? 'TRUE' : 'FALSE'}`
                    }
                },
                group: {
                    expression: `isValid`
                }
            },
        ],
        columns: [
            {
                expression: 'id',
                alias: 'id',
                hidden: true
            }, {
                expression: 'publication',
                label: '报刊名称',
                minWidth: '140',
            }, {
                expression: 'postalDisCode',
                label: '邮发代号',
                width: '130',
                sortable: true
            }, {
                expression: 'journal',
                label: '报纸/期刊',
                width: '130',
            }, {
                expression: 'periodical',
                label: '刊期',
                width: '100',
            }, {
                expression: 'unitPrice',
                label: '单价',
                width: '100',
            }, {
                expression: 'yearPrice',
                label: '年价',
                width: '100',
            }, {
                expression: 'deliveryMethod',
                label: '订阅路径',
                minWidth: '140',
            }, {
                expression: 'press',
                label: '出版社',
                minWidth: '150',
            }, {
                expression: 'CASE govExpense WHEN TRUE THEN ? ELSE ? END',
                value: ['公费', '自费'],
                label: '公费刊物',
                width: '100',
            }, {
                expression: 'sortNo',
                label: '排序号',
                width: '100',
                sortable: true
            }, {
                expression: 'updateTime',
                alias: service.camelToUpperUnderscore('updateTime'),
                label: '修改时间',
                width: '180',
                sortable: 'DESC',
                format(option, item) {
                    return (item.updateTime ? service.formatDate(
                        new Date(item.updateTime.replace(/[-T]|(\..*\+)/gi, c => c === '-' ? '/' : (/T/i.test(c) ? ' ' : ' GMT+'))),
                        'yyyy-MM-dd hh:mm') : '')
                }
            }
        ],
        keyword: 'publication LIKE ? OR postalDisCode LIKE ? OR journal LIKE ? OR periodical LIKE ? OR deliveryMethod LIKE ? OR press LIKE ? OR govExpense LIKE ?',
        search: [
            {
                label: '报刊名称',
                criteria(item) {
                    return item.value ? {
                        expression: `publication LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                },
                width: '400px',
            }, {
                label: '邮发代号',
                criteria(item) {
                    return item.value ? {
                        expression: `postalDisCode LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '出版社',
                criteria(item) {
                    return item.value ? {
                        expression: `press LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }
        ],
        buttons: isManager.call(this) ? [newButton(page), deleteButton(model)] : [],
        rowClick: rowClick(page),
        beforeRequest(query, category, isCategory) {

        }
    }
}
