export default {
    model : 'com.rongji.egov.journal.service.model.Paper',
    form: {
        id: {
            default : ''
        },
        sortNo: {
            default : 0
        },
        publication: {
            default : '',
            validator: {
                required: true,
                maxLength: 256
            }
        },
        postalDisCode: {
            default : '',
            validator: {
                required: true
            }
        },
        journal: {
            default : '期刊',
            validator: {
                required: true,
            }
        },
        lang: {
            default : '中文',
            validator: {
                required: true,
            }
        },
        paperType: {
            default : ''
        },
        periodical: {
            default : '月刊',
            validator: {
                required: true,
            }
        },
        unitPrice: {
            default : 0,
            validator: {
                required: true,
            }
        },
        yearPrice: {
            default : 0,
            validator: {
                required: true,
            }
        },
        deliveryMethod: {
            default : '邮发',
            validator: {
                required: true,
            }
        },
        barcode: {
            default : ''
        },
        press: {
            default : ''
        },
        phone: {
            default : ''
        },
        pressAddress: {
            default : ''
        },
        programa: {
            default : ''
        },
        presentation: {
            default : ''
        },
        govExpense: {
            default : false,
            validator: {
                required: true,
            }
        },
        isValid: {
            default : true
        }
    }
}
