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
            type: String,
            request: true
        },
        moduleId: {
            type: String,
            default: () => {
                return service.project;
            }
        }
    },
    component: {
        OrderForm
    },
    data() {
        return {
            ...baseForm.data.call(this, model),
            loading: false
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
            return !this.form.id || (!/^(1|2)$/.test(this.form.verifyStatus) && (this.form.draftUserNo === this.currentUserInfo.username));
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
                        show: this.isEdit && !!this.form.id
                    },
                    'i-bc': {
                        text: '保存',
                        icon: 'main-iconfont main-icon-baocun',
                        handle: this.beforeSubmit.bind(this),
                        show: this.isEdit
                    },
                    'i-approval': {
                        text: '送审核',
                        icon: 'main-iconfont main-icon-fasong',
                        handle: () => {
                            this.callApproval()
                        },
                        show: this.isEdit && !!this.form.id
                    },
                    'i-cancel': {
                        text: /^(2)$/.test(this.form.verifyStatus) ? '取消审核' : '撤回',
                        icon: 'main-iconfont main-icon-cheban',
                        handle: () => {
                            this.callApproval(true)
                        },
                        show: !!this.form.id && ((/^(1)$/.test(this.form.verifyStatus) && this.form.draftUserNo === this.currentUserInfo.username)
                            || (/^(2)$/.test(this.form.verifyStatus) && this.form.verifyUserNo === this.currentUserInfo.username))
                    },
                    'i-checked': {
                        text: '通过审核',
                        icon: 'main-iconfont main-icon-banbi',
                        handle: () => {
                            this.callApproval()
                        },
                        show: !!this.form.id && (/^(1)$/.test(this.form.verifyStatus) && this.isManager)
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
        }
    },
    created() {
        this.form.id = this.docId
    },
    mounted() {
        this.loadComponent()
    },
    methods: {
        loadComponent() {
            if (this.form.id) {
                Promise.all([this.onloadForm()]).then(() => {
                    this.loading = false;
                    this.$refs.form.snapshot();
                });
            } else {
                this.form.subscribeOrgNo = this.currentUserInfo.orgNo
                this.form.subscribeOrg = this.currentUserInfo.orgName
                this.form.subscribeUserNo = this.form.draftUserNo = this.currentUserInfo.username
                this.form.subscribeUser = this.currentUserInfo.userName
                this.loading = false;
                this.$refs.form.snapshot();
            }
        },
        ...baseForm.methods,

        callApproval(reverse) {
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
                                : `不允许执行此项操作，注意至少需要1条刊物信息！(${sum})`)
                        }
                }
                return {
                    expression: 'id = ?', value: this.form.id
                }
            }).then(res => {
                if(res===undefined)
                    return
                if (res === 1) {
                    service.success.call(this, '此项操作执行完成！')
                } else {
                    service.error.call(this, '此项操作执行出现错误！' + res)
                }
                this.$refs.form.snapshot()
                this.loadComponent()
            })
        },
        beforeSubmit() {
            if(!this.form.subscribeOrgNo){
                this.form.subscribeOrgNo = this.form.subscribeOrg
            }
            if(!this.form.subscribeUserNo){
                this.form.subscribeUserNo = this.form.subscribeUser
            }

            this.onSubmit()
        },
        afterSubmit() {
            if (this.form.id) {
                this.$nextTick(() => {
                    this.$refs.refOrder.submit(() => {
                        service.success.call(this, '此文档保存成功！')
                        return this.$refs.form.snapshot()
                    })
                })
            } else {
                service.success.call(this, '此文档保存成功！')
                return this.$refs.form.snapshot()
            }
        }
    }
}
