import {deleteButton, newButton, rowClick, isManager} from './base-config'
import service from '../../../service'
import form from '../../form'

const page = form.OrderLimitForm
const model = service.models.orderLimit

export default function () {
    return {
        ...service.viewUrl(model),
        selection: true,
        category: [
            {
                expression: 'subscribeYear',
                label: '年度',
                width: '90px',
                desc: true,
                defaultValue: new Date().getFullYear()
            }
        ],
        columns: [
            {
                expression: 'id',
                alias: 'id',
                hidden: true
            }, {
                expression: 'company',
                label: '单位名称',
                minWidth: '140',
                sortable: true
            }, {
                expression: 'subscribeBegin',
                label: '起始日期',
                minWidth: '160',
                sortable: true,
                alias: service.camelToUpperUnderscore('subscribeBegin'),
                format(option, item) {
                    return service.formatStringDate(item.subscribeBegin, 'yyyy-MM-dd')
                }
            }, {
                expression: 'subscribeEnd',
                label: '截止日期',
                minWidth: '160',
                sortable: true,
                alias: service.camelToUpperUnderscore('subscribeEnd'),
                format(option, item) {
                    return service.formatStringDate(item.subscribeEnd, 'yyyy-MM-dd')
                }
            }, {
                expression: 'subscribeYear',
                label: '订阅年度',
                width: '130',
                sortable: true
            }, {
                expression: 'limitCount',
                label: '刊数',
                width: '130',
                sortable: true
            }, {
                expression: 'limitCopies',
                label: '报数',
                width: '130',
                sortable: true
            }, {
                expression: 'limitAmount',
                label: '总金额',
                width: '130',
                sortable: true
            }
        ],
        keyword: 'Company LIKE ?',
        search: [
            {
                label: '单位名称',
                criteria(item) {
                    return item.value ? {
                        expression: `Company LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                },
                width: '260px',
            }, {
                label: '订阅年度',
                type: 'number',
                width: '120px',
                value: (new Date()).getFullYear(),
                criteria(item) {
                    return item.value && item.value!==0 ? {
                        expression: `transactor = ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '刊数',
                type: 'number',
                width: '120px',
                criteria(item) {
                    return item.value && item.value!==0 ? {
                        expression: `limitCount = ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '报数',
                type: 'number',
                width: '120px',
                criteria(item) {
                    return item.value && item.value!==0 ? {
                        expression: `limitCopies = ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '总金额(>=)',
                type: 'number',
                width: '120px',
                criteria(item) {
                    return item.value && item.value!==0 ? {
                        expression: `limitAmount >= ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '总金额(<=)',
                type: 'number',
                criteria(item) {
                    return item.value && item.value!==0 ? {
                        expression: `limitAmount <= ?`,
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
