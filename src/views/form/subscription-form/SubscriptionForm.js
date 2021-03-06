import {mapState} from 'vuex'
import service from '../../../service'
import baseForm from "../base-form";
import OrderForm from "./OrderForm";
import {approval} from "./approval";

const model = service.models.subscription

export default {
    name: 'SubscriptionForm',
    components: {OrderForm},
    props: {
        docId: {
            type: String
        },
        moduleId: {
            type: String,
            default: () => {
                return service.project;
            }
        },
        isSelfPay: {
            type: Boolean,
            default: () => {
                return false;
            }
        }
    },
    component: {
        OrderForm
    },
    data() {
        return {
            ...baseForm.data.call(this, model),
            loading: false,
            orgNoList: '',
            forceEdit: false,
        }
    },
    computed: {
        ...mapState(['user', 'system']),
        currentUserInfo() {
            return this.system.extraUserinfo
                ? Object.assign({}, this.user, this.system.extraUserinfo)
                : this.user;
        },
        isEdit() {
            return !this.form.id || (!/^(1|2)$/.test(this.form.verifyStatus) && (this.form.draftUserNo === this.currentUserInfo.username)) || (this.forceEdit && this.isManager);
        },
        isManager() {
            let roles = this.currentUserInfo.roles
            for (let role of service.managers) {
                if (roles.indexOf(role) > -1)
                    return true
            }
            return false
        },
        menuBarSetting() {
            return {
                docId: this.form.id,
                module: this.moduleId,
                form: this.form,
                buttons: {
                    'close': {
                        handle: this.onClose.bind(this)
                    },
                    'i-deldoc': {
                        text: '删除',
                        icon: 'toolbar01 cancel',
                        handle: this.onDelete.bind(this),
                        show: this.isEdit && !!this.form.id && !/^(1|2)$/.test(this.form.verifyStatus)
                    },
                    'i-bc': {
                        text: '保存',
                        icon: 'main-iconfont main-icon-baocun',
                        handle: this.beforeSubmit.bind(this),
                        show: this.isEdit
                    },
                    'i-forceEdit': {
                        text: this.forceEdit ? '取消修改' : '修改',
                        icon: 'main-iconfont main-icon-xiugai',
                        handle: ()=>{this.forceEdit = !this.forceEdit},
                        show: /^(1)$/.test(this.form.verifyStatus) && this.isManager
                    },
                    'i-approval': {
                        text: '送审核',
                        icon: 'main-iconfont main-icon-fasong',
                        handle: () => {
                            this.saveAndApproval()
                        },
                        show: !this.forceEdit && this.isEdit && !!this.form.id && !/^(1|2)$/.test(this.form.verifyStatus)
                    },
                    'i-cancel': {
                        text: /^(2)$/.test(this.form.verifyStatus) ? '取消审核' : (this.form.draftUserNo === this.currentUserInfo.username ? '撤回' : '不通过审核'),
                        icon: 'main-iconfont main-icon-cheban',
                        handle: () => {
                            this.callApproval(true, /^(2)$/.test(this.form.verifyStatus) ? '取消审核' : (this.form.draftUserNo === this.currentUserInfo.username ? '撤回' : '退回'))
                        },
                        show: !this.forceEdit && !!this.form.id && ((/^[1]$/.test(this.form.verifyStatus) && (this.form.draftUserNo === this.currentUserInfo.username || this.isManager))
                            || (/^[2]$/.test(this.form.verifyStatus) && this.isManager))
                    },
                    'i-checked': {
                        text: '通过审核',
                        icon: 'main-iconfont main-icon-banbi',
                        handle: () => {
                            this.callApproval()
                        },
                        show: !this.forceEdit && !!this.form.id && (/^(1)$/.test(this.form.verifyStatus) && this.isManager)
                    }
                }
            }
        },
        subscribeYearComputed: {
            get() {
                return new Date(this.form.subscribeYear + '/1/1')
            },
            set(value) {
                this.form.subscribeYear = value.getFullYear()
            }
        },
        rootOrgNo() {
            return this.orgNoList ? this.orgNoList.replace(/(^\/)|(\/[^/]*)|([^\/]*=)/g, '') : ''
        },
    },
    // 由于使用mapState造成system未能在form初始化前完全加载，添加以下方法处理。
    watch: {
        currentUserInfo(){
            if(!this.form.id){
                this.initSubscribeOrg();
                this.$refs.form.snapshot();
            }
        }
    },
    created() {
        this.form.id = this.docId
        this.initOrgInfo()
    },
    mounted() {
        this.loadComponent()
    },
    methods: {
        yearFocus(){
            setTimeout(()=>{
                let begin = $('.journal-year-picker .el-year-table tr:nth-of-type(1)>td:nth-of-type(1)>.cell').text();
                let end = $('.journal-year-picker .el-year-table tr:nth-last-of-type(1)>td:nth-of-type(2)>.cell').text();
                let title = begin + '-' + end;
                //console.log(title,'标题');
                $('.journal-year-picker .el-date-picker__header-label:nth-of-type(1)').text(title);
                $('.journal-year-picker .el-year-table tr:nth-last-of-type(1)>td:nth-of-type(4)').remove()
                $('.journal-year-picker .el-year-table tr:nth-last-of-type(1)>td:nth-of-type(3)').remove()
            },10)
        },
        initOrgInfo() {
            if (!this.currentUserInfo.orgNo)
                return
            this.$utils.ajax(`/user/umsOrg/getUmsOrg4Page?systemNo=&offset=0&limit=1&orgNo=${this.currentUserInfo.orgNo}`).then(res => {
                if ((res = res.list).length > 0) {
                    this.orgNoList = res[0]['orgNoList']
                }
            })
        },
        initSubscribeOrg() {
            this.form.subscribeOrgNo = this.currentUserInfo.orgNo
            this.form.subscribeOrg = this.currentUserInfo.orgName
            this.form.subscribeUserNo = this.form.draftUserNo = this.currentUserInfo.username
            this.form.subscribeUser = this.currentUserInfo.userName
        },
        loadComponent() {
            if (this.form.id) {
                Promise.all([this.onloadForm()]).then(() => {
                    this.loading = false;
                    this.$refs.form.snapshot();
                });
            } else {
                this.initSubscribeOrg()
                this.loading = false;
                this.$refs.form.snapshot();
            }
        },
        ...baseForm.methods,
        saveAndApproval() {  //送审并保存
            let verify = parseInt(this.form.verifyStatus)
            if (verify !== 1 && verify !== 2) {
                this.beforeSubmit(this.callApproval)
            } else {
                this.callApproval()
            }
        },
        callApproval(reverse, actionName) {
            approval.call(this, this.form.verifyStatus, reverse, (verifyStatus, reverse, message) => {
                if (verifyStatus > 0) {
                    let orders = this.$refs.refOrder.orders
                    let ct = 0, sum = 0
                    orders.forEach(o => {
                        if (!o.id) {
                            ct++
                        } else (o.pid && o.paperId)
                        {
                            sum += o.subscribeCopies
                        }
                    })
                    if (ct > 0 || sum < 1)
                        return {
                            msg: service.error.call(this, ct > 0
                                ? `刊物信息列表尚未保存（${ct}），请保存后再执行此项操作`
                                : '请先添加报刊订阅信息，再送审核！')//`不允许执行此项操作，注意至少需要1条刊物信息！`)
                        }
                }
                return {
                    expression: 'id = ?', value: this.form.id
                }
            }, {
                subscribeYear: this.form.subscribeYear,
                subscribeOrg: this.form.subscribeOrg,
                id: this.form.id,
                subscribeUser: this.form.subscribeUser,
                subscribeOrgNo: this.form.subscribeOrgNo ? this.form.subscribeOrgNo : this.form.subscribeOrg,
                govExpense: this.form.govExpense
            }, false, actionName).then(res => {
                if (res === undefined)
                    return
                if (res === 1) {
                    service.success.call(this, '执行成功！')
                } else {
                    service.error.call(this, '执行出现错误！' + res)
                }
                this.$refs.form.snapshot()
                this.loadComponent()
            }).catch(err => {
                service.error.call(this, err)
            })
        },
        beforeSubmit(__submit_callback) {
            this.__submit_callback = __submit_callback

            if (!this.form.subscribeOrgNo) {
                this.form.subscribeOrgNo = this.form.subscribeOrg
            }
            if (!(this.form.subscribeUser)) {
                this.form.subscribeUser = this.currentUserInfo.userName
                this.form.subscribeUserNo = this.currentUserInfo.username
            }
            /*if(!this.form.govExpense){
                this.form.subscribeOrgNo = this.form.subscribeUserNo
                this.form.subscribeOrg = this.form.subscribeUser
            }*/

            try {
                let $order = this.$refs.refOrder
                $order.checkOrders(true)

                //保存摘要
                Object.assign(this.form, {
                    publicationBrief: $order.summaries.publication.join(', '),
                    subscribeCopiesBrief: $order.summaries.subscribeCopies,
                    amountBrief: $order.summaries.yearPrice
                })
            } catch (err) {
                return service.error.call(this, Error.prototype.isPrototypeOf(err) ? err.message : err)
            }
            this.onSubmit()
        },
        afterSubmit() {
            if (this.form.id) {
                this.$nextTick(() => {
                    this.$refs.refOrder.submit(() => {
                        if (typeof this.__submit_callback === 'function') {
                            return this.__submit_callback.call(this)
                        }
                        service.success.call(this, '保存成功！')
                        return this.$refs.form.snapshot()
                    })
                })
            } else {
                if (typeof this.__submit_callback === 'function') {
                    return this.__submit_callback.call(this)
                }
                service.success.call(this, '保存成功！')
                return this.$refs.form.snapshot()
            }
        }
    }
}
