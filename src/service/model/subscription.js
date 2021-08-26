import service from "../index";
function format(value){  //update
        console.log(this)
        debugger;
        return !value ? null : this.formatDate(Date.prototype.isPrototypeOf(value) ? value :
            new Date(value.replace(/[-T]|(\..*\+)/gi, c => c === '-' ? '/' : (/T/i.test(c) ? ' ' : ' GMT+'))),
            'yyyy-MM-dd hh:mm:ss')
    }

export default {
    model: 'com.rongji.egov.journal.service.model.Subscription',
    form: {
        id: {
            default: ''
        },
        govExpense: {
            default: true,
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
            default: ''
        },
        subscribeOrgNo: {
            default: ''
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
        verifyTime: {
            default: null,
            format
        },
        draftUserNo: null
    }
}
