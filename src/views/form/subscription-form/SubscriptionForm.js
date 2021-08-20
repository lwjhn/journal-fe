import {mapState} from 'vuex'
import service from '/src/service'
import baseForm from "../base-form";

const model = service.models.paper

export default {
    name: 'SubscriptionForm',
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
        menuBarSetting: function () {
            return {
                docId: this.form.id,
                module: this.moduleId,
                form: this.form,
                buttons: {
                    'close': {
                        handle: this.onClose.bind(this)
                    },
                    'deldoc': {
                        text: '删除',
                        icon: 'toolbar01 cancel',
                        handle: this.onDelete.bind(this),
                        show: true
                    },
                    'bc': {
                        text: '保存',
                        icon: 'toolbar03 save',
                        handle: this.onSubmit.bind(this),
                        show: true
                    }
                }
            }
        },
        isEdit: function () {
            return !this.form.id || (!/^(1|2)$/.test(this.form.verifyStatus) && (this.form.draftUserNo === this.currentUserInfo.username));
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

    },
    mounted() {
        this.form.id = this.docId
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


        enabledMenuToolBar: function () {
            this.menuBarSetting = null
            this.$nextTick(() => (this.menuBarSetting = {
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
                        handle: this.onSubmit.bind(this),
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
                        text: /^(2)$/.test(this.form.verifyStatus) ? '撤办' : '撤回',
                        icon: 'main-iconfont main-icon-cheban',
                        handle: () => {
                            this.callApproval(true)
                        },
                        show: !!this.form.id && ((/^(1)$/.test(this.form.verifyStatus) && this.form.draftUserNo == this.currentUserInfo.username)
                            || (/^(2)$/.test(this.form.verifyStatus) && this.form.verifyUserNo == this.currentUserInfo.username))
                    },
                    'i-checked': {
                        text: '已审核',
                        icon: 'main-iconfont main-icon-banbi',
                        handle: () => {
                            this.callApproval()
                        },
                        show: !!this.form.id && (/^(1)$/.test(this.form.verifyStatus) && this.isMoudleManager)
                    }
                }
            }))
        },
        callApproval(reverse) {
            let verifyStatus = /^(1|2)$/.test(this.form.verifyStatus) ? this.form.verifyStatus : 0;
            reverse ? --verifyStatus : ++verifyStatus;
            if (verifyStatus < 0) {
                return this.$message.error('此文件已在草稿中！');
            } else if (verifyStatus > 2) {
                return this.$message.error('此文件已是已审核状态！');
            }
            let cmd = {
                verifyStatus
            }, message = reverse ? '确认要撤回文件？' : ('确认' + (verifyStatus == 1 ? '送报刊管理员进行审核？' : '此文通过审核？'))
            switch (verifyStatus) {
                case 1:
                    Object.assign(cmd, {
                        verifyUser: '',
                        verifyUserNo: '',
                        verifyTime: null,
                        subscribeTime: new Date()
                    })
                    break;
                case 2:
                    Object.assign(cmd, {
                        verifyUser: this.currentUserInfo.userName,
                        verifyUserNo: this.currentUserInfo.username,
                        verifyTime: new Date()
                    })
                    break;
                default:

            }
            if (message) {
                this.$confirm(message, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then((res) => {
                    if (!res) return
                    Object.assign(this.form, cmd)
                    this.onSubmit()
                })
            } else {
                Object.assign(this.form, cmd)
                this.onSubmit()
            }
        }
    }
};
