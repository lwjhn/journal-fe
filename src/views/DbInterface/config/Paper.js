import {newButton, rowClick, isManager, _ALL_CATEGORY_, _ALL_CATEGORY_OPTION_} from './base-config'
import service from '../../../service'
import form from '../../form'
import {tableAlias} from "./Subscription";

const page = form.PaperForm
const model = service.models.paper


function deleteButton(model, config) {
    let {label, title, type, criteria} = config ? config : {}
    return {
        label: label ? label : '作废',
        title: title ? title : '请选择需要作废的文件',
        type: type ? type : 'danger',
        handle() {
            if (!Array.prototype.isPrototypeOf(this.selection) || this.selection.length < 1) {
                return service.warning.call(this, '请选择需要作废的文档 ！')
            }
            service.confirm.call(this, '确定要作废除选择的' + this.selection.length + '份文档？').then((res) => {
                if (res) {
                    let expression, value
                    if (typeof criteria === 'function') {
                        let where = criteria.call(this, this.selection)
                        if (!(where && (expression = where.expression)))
                            return
                        value = where.value
                    } else {
                        expression = []
                        value = this.selection.map(o => {
                            expression.push('id = ?')
                            return o.id
                        })
                        expression = expression.join(' OR ')
                    }

                    service.update.call(this, model, {
                        isValid: false
                    }, expression, value).then((res) => {
                        service.success.call(this, '此操作共计有' + res + '份文件作废 ！')
                        this.refresh()
                    }).catch((err) => {
                        service.error.call(this, err)
                    })
                }
            });
        }
    }
}

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
                label: '订阅途径',
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
                expression: 'CASE requisite WHEN TRUE THEN ? ELSE ? END',
                value: ['必选', '非必选'],
                label: '必选刊物',
                width: '120',
                sortable: true
            }, {
                expression: 'sortNo',
                label: '排序号',
                width: '120',
                sortable: true
            }, {
                expression: 'updateTime',
                label: '修改时间',
                width: '180',
                sortable: 'DESC',
                alias: service.camelToUpperUnderscore('updateTime'),
                format(option, item) {
                    return service.formatStringDate(item.updateTime, 'yyyy-MM-dd hh:mm')
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
            }, {
                label: '必选刊物',
                value: _ALL_CATEGORY_,
                criteria(item) {
                    return item.value && item.value !== _ALL_CATEGORY_ ? {
                        expression: `requisite is ${item.value === '必选' ? 'TRUE' : 'FALSE'}`
                    } : null
                },
                type: 'radio',
                options: [_ALL_CATEGORY_OPTION_, {label: '必选'}, {label: '非必选'}]
            }
        ],
        buttons: isManager.call(this) ? [newButton(page), deleteButton(model)] : [],
        rowClick: rowClick(page),
        beforeRequest(query, category, isCategory) {

        }
    }
}
