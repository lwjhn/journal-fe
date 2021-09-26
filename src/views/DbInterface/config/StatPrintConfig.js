import {deleteButton, newButton, rowClick, isManager} from './base-config'
import service from '../../../service'
import form from '../../form'

const page = form.StatPrintConfig
const model = service.models.statPrintConfig

export default function () {
    return {
        ...service.viewUrl(model),
        selection: true,
        category: [],
        columns: [
            {
                expression: 'id',
                alias: 'id',
                hidden: true
            }, {
                expression: 'company',
                label: '单位名称',
                minWidth: '140',
            }, {
                expression: 'transactor',
                label: '经办人',
                width: '130',
                sortable: true
            }, {
                expression: 'postalCode',
                label: '邮编',
                width: '130',
            }, {
                expression: 'phoneNo',
                label: '电话',
                width: '130',
            }, {
                expression: 'sortNo',
                label: '排序号',
                width: '100',
            }, {
                expression: 'address',
                label: '通信地址',
                minWidth: '100',
            }
        ],
        keyword: 'Company LIKE ? OR transactor LIKE ? OR postalCode LIKE ? OR phoneNo LIKE ? OR address LIKE ?',
        search: [
            {
                label: '单位名称',
                criteria(item) {
                    return item.value ? {
                        expression: `Company LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                },
                width: '400px',
            }, {
                label: '经办人',
                criteria(item) {
                    return item.value ? {
                        expression: `transactor LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                }
            }, {
                label: '通信地址',
                criteria(item) {
                    return item.value ? {
                        expression: `address LIKE ?`,
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
