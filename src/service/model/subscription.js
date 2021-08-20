export default {
    model: 'com.rongji.egov.journal.service.model.Subscription',
    form: {
        id: {
            default: ''
        },
        govExpense: {
            default: false,
            validator: {
                required: true,
            }
        },
        publication: {
            default: '',
            validator: {
                required: true,
                maxLength: 256
            }
        },
        postalDisCode: {
            default: ''
        },
        subscribeUser: {
            default: ''
        },
        subscribeUserNo: {
            default: ''
        },
        subscribeOrg: {
            default: ''
        },
        subscribeOrgNo: {
            default: ''
        },
        subscribeTime: null,
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
        subscribeCopies: {
            default: 1,
            validator: {
                required: true,
            }
        },
        clearingForm: {
            default: '支票',
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
        verifyTime: null,
        draftUserNo: null
    }
}
