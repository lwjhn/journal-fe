export default {
    model: 'com.rongji.egov.journal.service.model.Paper',
    form: {
        id: {
            default: ''
        },
        sortNo: {
            default: 0
        },
        publication: {
            default: '',
            validator: {
                required: true,
                maxLength: 256
            }
        },
        postalDisCode: {
            default: '',
            validator: {
                required: true
            }
        },
        journal: {
            default: '期刊',
            validator: {
                required: true
            }
        },
        lang: {
            default: '中文',
            validator: {
                required: true,
            }
        },
        paperType: {
            default: [],
            parse(value) {
                return value ? JSON.parse(value) : []
            },
            /*
            format(value){
                return this.formatStringDate(value)
            },
            validator:{
                required: true,
                validator(rule, value, callback){
                    callback(value.length>0 ? undefined : new Error('类型不允许为空！'))
                }
            }*/
        },
        periodical: {
            default: '月刊',
        },
        unitPrice: {
            default: 0,
            validator: {
                required: true,
            }
        },
        yearPrice: {
            default: 0,
            validator: {
                required: true,
            }
        },
        deliveryMethod: {
            default: '邮发',
            validator: {
                required: true,
            }
        },
        barcode: {
            default: ''
        },
        press: {
            default: ''
        },
        phone: {
            default: ''
        },
        pressAddress: {
            default: ''
        },
        programa: {
            default: ''
        },
        presentation: {
            default: ''
        },
        govExpense: {
            default: true,
            validator: {
                required: true,
            }
        },
        isValid: {
            default: true
        },
        requisite: {
            default: false,
            validator: {
                required: true
            }
        },
        productId: {
            default: ''
        },
        memo: {
            default: ''
        }
    }
}
