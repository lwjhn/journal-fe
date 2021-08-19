export default {
    model : 'com.rongji.egov.journal.service.model.Subscription',
    form: {
        id: '',
        govExpense: false,
        publication: '',
        postalDisCode: '',
        subscribeUser: '',
        subscribeUserNo: '',
        subscribeOrg: '',
        subscribeOrgNo: '',
        subscribeTime: null,
        subscribeYear: new Date().getFullYear(),
        subscribeMonthBegin: 1,
        subscribeMonthEnd: 12,
        subscribeCopies: 1,
        clearingForm: '支票',
        isLeaderProvince: false,
        isLeaderHall: false,
        consignee: '处室收文',
        verifyStatus: 0,
        verifyUser: '',
        verifyUserNo: '',
        verifyTime: null
    }
}
