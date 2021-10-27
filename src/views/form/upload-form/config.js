import service from '../../../service'

export const form = {
    sheet: {
        index: 0, labelWidth: '140px', width: '33%', type: 'number',
        label: '工 作 表',
        value: 0,
    },
    beginRow: {
        index: 1, labelWidth: '140px', width: '33%', type: 'number',
        label: '起 始 行',
        value: 3
    },
    endRow: {
        index: 2, labelWidth: '140px', width: '33%', type: 'number',
        label: '截 止 行',
        value: 1000
    },
    postalDisCode: {
        index: 3, labelWidth: '140px', width: '33%', type: 'number',
        label: '邮发代号',
        value: 4
    },
    publication: {
        index: 4, labelWidth: '140px', width: '33%', type: 'number',
        label: '报刊名称',
        value: 7
    },
    journal: {
        index: 5, labelWidth: '140px', width: '33%', type: 'number',
        label: '类  别',
        value: 6
    },
    lang: {
        index: 6, labelWidth: '140px', width: '33%', type: 'number',
        label: '文  别',
        value: 13
    },
    paperType: {
        index: 7, labelWidth: '140px', width: '33%', type: 'number',
        label: '产品分类',
        value: 33
    },
    periodical: {
        index: 8, labelWidth: '140px', width: '33%', type: 'number',
        label: '刊  期',
        value: 12
    },
    unitPrice: {
        index: 9, labelWidth: '140px', width: '33%', type: 'number',
        label: '订阅单价',
        value: 24
    },
    yearPrice: {
        index: 10, labelWidth: '140px', width: '33%', type: 'number',
        label: '年  价',
        value: 26
    },
    deliveryMethod: {
        index: 11, labelWidth: '140px', width: '33%', type: 'number',
        label: '邮发标志',
        value: 15
    },
    barcode: {
        index: 12, labelWidth: '140px', width: '33%', type: 'number',
        label: '产品条码',
        value: 31
    },
    press: {
        index: 13, labelWidth: '140px', width: '33%', type: 'number',
        label: '出 版 社',
        value: 32
    },
    presentation: {
        index: 14, labelWidth: '140px', width: '33%', type: 'number',
        label: '产品简介',
        value: 35
    },
    productId: {
        index: 15, labelWidth: '140px', width: '33%', type: 'number',
        label: '产品编号',
        value: 2
    },
    memo: {
        index: 16, labelWidth: '140px', width: '33%', type: 'number',
        label: '备  注',
        value: 39
    }
}

export const request = {
    sheet: 0,
    beginRow: 3,
    endRow: 3,
    model: "com.rongji.egov.journal.service.model.Paper",
    values: {
        id: {
            expression: "regexp_replace(NEWID(), ?, ?)",
            value: [
                "-",
                ""
            ]
        },
        postalDisCode: {
            value: undefined
        },
        sortNo: {
            expression: "REPLACE(LEFT(?, instr(?, ?)),?,?) + RIGHT(REPLACE(?,?,?),5)",
            value(cell) {
                cell = this.form.postalDisCode.value
                return [
                    cell, cell,
                    "-",
                    "-",
                    "",
                    cell,
                    "-",
                    "-00000"
                ]
            }
        },
        publication: {
            value: undefined
        },
        journal: {
            value: undefined
        },
        lang: {
            value: undefined
        },
        paperType: {
            expression: "? + REGEXP_REPLACE(?, ?, ?) + ?",
            value(cell) {
                return [
                    "[\"",
                    cell,
                    "[\"\\\\]",
                    "",
                    "\"]"
                ]
            }
        },
        periodical: {
            value: undefined
        },
        unitPrice: {
            value: undefined
        },
        yearPrice: {
            value: undefined
        },
        deliveryMethod: {
            value: undefined
        },
        barcode: {
            value: undefined
        },
        press: {
            value: undefined
        },
        phone: {
            value: [
                ''
            ]
        },
        pressAddress: {
            value: [
                ''
            ]
        },
        programa: {
            value: [
                ''
            ]
        },
        presentation: {
            value: undefined
        },
        govExpense: {
            value: [true]
        },
        isValid: {
            value: [true]
        },
        requisite: {
            value: [false]
        },
        productId: {
            value: undefined
        },
        memo: {
            value: undefined
        }
    }
}

export function query() {
    let req = service.extend(true, {}, request), obj
    for (let key in req) {
        if (!!(obj = form[key])) {
            req[key] = obj.value
        }
    }
    let values = req.values, val
    for (let key in values) {
        obj = values[key]
        val = (val = form[key]) ? val.value : undefined
        obj.value = typeof (obj.value) === 'function'
            ? obj.value.call(this, val)
            : (form.hasOwnProperty(key) ? [val] : obj.value)
    }
    return req
}
