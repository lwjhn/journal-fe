import {deleteButton, newButton, rowClick, isManager, _ALL_CATEGORY_OPTION_, _ALL_CATEGORY_} from './base-config'
import service from '../../../service'
import form from '../../form'

const page = form.OrderLimitForm
const model = service.models.orderLimit

export default function () {
    return {
        ...service.viewUrl(model),
        selection: true,
        category: [
            /*{
                expression: 'subscribeYear',
                label: '年度',
                width: '90px',
                desc: true,
                defaultValue: new Date().getFullYear()
            }*/
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
            },
/*            {
                expression: 'subscribeYear',
                label: '订阅年度',
                width: '130',
                sortable: true
            }, */
            {
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
            }, {
                expression: 'sortNo',
                label: '排序号',
                width: '130',
                sortable: 'ASC'
            }, {
                expression: 'case isValid when true then ? else ? end',
                value: ['限额','不限额'],
                label: '是否限额',
                width: '130',
                sortable: true
            }, {
                expression: 'case requisite when true then ? else ? end',
                value: ['验证','不验证'],
                label: '是否必选',
                width: '130',
                sortable: true
            }
        ],
        keyword: 'company LIKE ?',
        search: [
            {
                label: '单位名称',
                criteria(item) {
                    return item.value ? {
                        expression: `company LIKE ?`,
                        value: `%${item.value}%`
                    } : null
                },
                width: '60%',
            },
/*            {
                label: '订阅年度',
                type: 'number',
                width: '120px',
                value: (new Date()).getFullYear(),
                criteria(item) {
                    return item.value && item.value!==0 ? {
                        expression: `transactor = ?`,
                        value: `${item.value}`
                    } : null
                }
            }, */
            {
                label: '刊  数',
                labelWidth: '140px',
                type: 'number',
                width: '20%',
                bind:{controls: false},
                criteria(item) {
                    return item.value && item.value!==0 ? {
                        expression: `limitCount = ?`,
                        value: `${item.value}`
                    } : null
                }
            }, {
                label: '报  数',
                labelWidth: '140px',
                type: 'number',
                width: '20%',
                bind:{controls: false},
                criteria(item) {
                    return item.value && item.value!==0 ? {
                        expression: `limitCopies = ?`,
                        value: `${item.value}`
                    } : null
                }
            },
            {
                label: '是否限额',
                width: '30%',
                value: _ALL_CATEGORY_,
                criteria(item) {
                    return item.value && item.value !== _ALL_CATEGORY_ ? {
                        expression: `isValid is ${item.value === '是' ?  'TRUE' : 'FALSE'}`
                    } : null
                },
                type: 'radio',
                options: [_ALL_CATEGORY_OPTION_, {label: '是'}, {label: '否'}],
            },
            {
                label: '是否必选',
                width: '30%',
                value: _ALL_CATEGORY_,
                criteria(item) {
                    return item.value && item.value !== _ALL_CATEGORY_ ? {
                        expression: `requisite is ${item.value === '是' ?  'TRUE' : 'FALSE'}`
                    } : null
                },
                type: 'radio',
                options: [_ALL_CATEGORY_OPTION_, {label: '是'}, {label: '否'}],
            },{
                label: '总金额(>)',
                labelWidth: '140px',
                width: '20%',
                type: 'number',
                bind:{controls: false},
                criteria(item) {
                    return item.value && item.value!==0 ? {
                        expression: `limitAmount > ?`,
                        value: `${item.value}`
                    } : null
                }
            }, {
                label: '总金额(<)',
                labelWidth: '140px',
                width: '20%',
                type: 'number',
                bind:{controls: false},
                criteria(item) {
                    return item.value && item.value!==0 ? {
                        expression: `limitAmount < ?`,
                        value: `${item.value}`
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
