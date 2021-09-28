function format(value, format){
    return this.formatStringDate(value, format)
}

export default {
    model: 'com.rongji.egov.journal.service.model.OrderLimit',
    form: {
        id: {
            default: ''
        },
        subscribeYear: {
            default: (new Date()).getFullYear(),
            validator: {
                required: true
            }
        },
        subscribeBegin: {
            default: new Date(),
            validator: {
                required: true
            },
            format
        },
        subscribeEnd: {
            default: new Date(`${(new Date()).getFullYear()}/${(new Date()).getMonth()+3}/${(new Date()).getDate()}`),
            validator: {
                required: true
            },
            format
        },
        limitCount: {
            default: 0,
            validator: {
                required: true
            }
        },
        limitCopies: {
            default: 0,
            validator: {
                required: true
            }
        },
        limitAmount: {
            default: 0,
            validator: {
                required: true
            }
        },
        company: {
            default: '',
            validator: {
                required: true,
                maxLength: 100
            }
        },
    }
}
