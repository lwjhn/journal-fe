function format(value, format){
    return value ?  this.formatStringDate(value, format) : null
}

export default {
    model: 'com.rongji.egov.journal.service.model.Subscription',
    form: {
        id: {
            default: ''
        },
        govExpense: {
            default(){
                console.log(this.docId, this.isSelfPay)
                debugger
                return !(this.docId || this.isSelfPay)
            },
            validator: {
                required: true,
            }
        },
        subscribeUser: {
            default: ''
        },
        subscribeUserNo: {
            default: ''
        },
        subscribeOrg: {
            default: '',
            validator: {
                required: true,
            }
        },
        subscribeOrgNo: {
            default: '',
            validator: {
                required: true,
            }
        },
        subscribeTime: {
            default : null,
            format
        },
        subscribeYear: {
            default: new Date().getFullYear(),
            validator: {
                required: true,
                maxLength: 32
            }
        },
        subscribeMonthBegin: {
            default: 1,
            validator: {
                required: true,
            }
        },
        subscribeMonthEnd: {
            default: 12,
            validator: {
                required: true,
            }
        },
        clearingForm: {
            //default: '支票',
            validator: {
                required: true,
            }
        },
        isLeaderProvince: {
            default: false,
            validator: {
                required: true,
            }
        },
        isLeaderHall: {
            default: false,
            validator: {
                required: true,
            }
        },
        consignee: {
            default: '处室收文',
            validator: {
                required: true,
            }
        },
        verifyStatus: {
            default: 0,
            validator: {
                required: true,
            }
        },
        verifyUser: {
            default: ''
        },
        verifyUserNo: {
            default: ''
        },
        verifyTime: {
            default: null,
            format
        },
        draftUserNo: null
    }
}
