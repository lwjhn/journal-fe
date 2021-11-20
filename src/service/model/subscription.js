function format(value, format) {
    return value ? this.formatStringDate(value, format) : null
}

function getFirstItem(value) {
    return Array.prototype.isPrototypeOf(value) ? (value.length > 0 ? value[0] : undefined) : value
}

export default {
    model: 'com.rongji.egov.journal.service.model.Subscription',
    form: {
        id: {
            default: ''
        },
        govExpense: {
            default() {
                return !(this.docId || this.isSelfPay)
            },
            validator: {
                required: true,
            }
        },
        subscribeUser: {
            default: '',
            format: getFirstItem
        },
        subscribeUserNo: {
            default: '',
            format: getFirstItem
        },
        subscribeOrg: {
            default: '',
            validator: {
                required: true,
            },
            format: getFirstItem
        },
        subscribeOrgNo: {
            default: '',
            validator: {
                required: true,
            },
            format: getFirstItem
        },
        subscribeTime: {
            default: null,
            format
        },
        subscribeYear: {
            default: new Date().getFullYear() + 1,
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
            default() {
                return !(this.docId || this.isSelfPay) ? '支票' : '现金'
            },
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
        draftUserNo: null,
        publicationBrief: null,
        subscribeCopiesBrief: null,
        amountBrief: null
    }
}
