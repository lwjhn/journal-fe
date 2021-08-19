import {
    mapState,
    mapGetters
} from 'vuex';
import qs from 'qs';

export default {
    name: 'SubscriptionForm',
    props: {
        id: String, // 文档ID
        docId: { //文档ID
            type: String,
            request: true
        },
        moduleId: {
            type: String,
            default: () => {
                return 'subscribeNewspaper';
            }
        }
    },
    data() {
        return {
            // 模块配置表单结构
            form: {
                "id": "",
                "rssType": "自费",
                "publication": "",
                "postalDisCode": "",
                "subscribeUser": "",
                "subscribeUserNo": "",
                "subscribeOrg": "",
                "subscribeOrgNo": "",
                "subscribeTime": null,
                "subscribeYear": new Date().getFullYear(),
                "subscribeMonthBegin": 1,
                "subscribeMonthEnd": 12,
                "subscribeCopies": 1,
                "clearingForm": "支票",
                "isLeaderProvince": false,
                "isLeaderHall": false,
                "consignee": "处室收文",
                "verifyStatus": 0,
                "verifyUser": "",
                "verifyUserNo": "",
                "verifyTime": null,
                "draftUser": "",
                "draftUserNo": "",
                "draftOrg": "",
                "draftOrgNo": "",
                "systemNo": "",
                "createTime": "",
                "updateTime": ""
            },
            subscribeYearTemp: new Date('1980/1/1'),
            loading: false,
            // 规则配置
            rules: this.$utils.validator({
                publication: {
                    required: true,
                    maxLength: 256
                },
                postalDisCode: {
                    required: true
                },
                rssType: {
                    required: true
                },
                subscribeOrg: {
                    required: true
                },
                subscribeYear: {
                    required: true,
                    maxLength: 32
                },
                subscribeMonthBegin: {
                    required: true
                },
                subscribeMonthEnd: {
                    required: true
                },
                subscribeCopies: {
                    required: true
                },
                clearingForm: {
                    required: true
                }
            }),
            systemNo: this.$store.getters['user/systemNo'], // 系统编码
            isMoudleManager: false,
            menuBarSetting: {}
        };
    },
    created() {

    },
    mounted() {
        this.loadComponent();
    },
    computed: {
        // 按钮名称
        submitText() {
            return '保存';
        },
        // 提示消息
        message() {
            return '保存成功';
        },
        /**
         * 判断当前状态下是否可编辑
         * 文档为待办且在流程中设置为可编辑时
         */
        isEdit: function () {
            return !/^(1|2)$/.test(this.form.verifyStatus) && (this.form.draftUserNo == this.currentUserInfo.username);    //this.form.status === '1'
        },
        ...mapState(['user', 'system']),
        currentUserInfo() {
            return this.system.extraUserinfo
                ? Object.assign({}, this.user, this.system.extraUserinfo)
                : this.user;
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
    methods: {
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
        // 关闭窗口
        onClose() {
            this.$refs.form.check().then(() => {
                this.$confirm('您有修改的数据未保存,请确认是否关闭!', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then((res) => {
                    if (res) {
                        this.$message.closeAll();
                        this.$emit('popBoxCloseEvent'); // 触发关闭弹窗
                        return;
                    }
                }).catch(() => {
                    return;
                });
            }).catch(() => { // 数据未修改
                this.$message.closeAll();
                this.$emit('popBoxCloseEvent'); // 触发关闭弹窗
            });
        },
        // 提交表单
        onSubmit() {
            // 验证通过
            this.$refs.form.validate().then(res => {
                const loadingInstance = this.$loading({
                    lock: true,
                    text: '保存文件中'
                });
                //this.loading = true;
                this.$utils.ajax.post('/subscribenewspaper/rss/updateByPrimaryKeySelective?', this.form).then((res) => {
                    this.form = res;

                    this.$message({
                        type: 'success',
                        message: this.message
                    });
                    this.enabledMenuToolBar();

                    if (loadingInstance) {
                        loadingInstance.close();
                    }
                    this.$refs.form.snapshot(); //为当前数据记录快照
                    this.$parent.popBoxTitle && (this.$parent.popBoxTitle = '编辑');
                    this.outerNet = this.form.outerNet == '1' ? true : false;
                    this.isTop = this.form.isTop == '1' ? true : false;
                }).catch((err) => {
                    //this.loading = false;
                    this.$message.error(err);
                    if (loadingInstance) {
                        loadingInstance.close();
                    }
                });
            }).catch(res => {
                return;
            });
        },
        onDelete() {
            if (!this.form.id) {
                this.$message({
                    type: 'warning',
                    message: '此文件未保存，不需要删除!'
                });
                return;
            }
            this.$confirm('删除, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then((res) => {
                if (res) {
                    this.$utils.ajax.post('/subscribenewspaper/rss/deleteByIds', [this.form.id]).then((res) => {
                        this.$message({
                            type: 'success',
                            message: res.message || '删除成功!'
                        });
                        this.$message.closeAll();
                        this.$emit('popBoxCloseEvent');
                        this.refresh();
                    }).catch((err) => {
                        this.$message.error(err);
                    });
                }
            });
        },
        contentValidator(rule, value, callback) {
            callback();
        },
        loadComponent() {
            if (this.docId) {
                Promise.all([this.callIsManager(), this.onloadForm()]).then((result) => {
                    this.loading = false;
                    this.enabledMenuToolBar();
                    this.$refs.form.snapshot();
                });
            } else {
                this.initView();
                this.loading = false;
                this.enabledMenuToolBar();
            }
        },
        initView() {
            this.form.subscribeOrgNo = this.form.draftOrgNo = this.currentUserInfo.orgNo
            this.form.subscribeOrg = this.form.draftOrg = this.currentUserInfo.orgName
            this.form.subscribeUserNo = this.form.draftUserNo = this.currentUserInfo.username
            this.form.subscribeUser = this.form.draftUser = this.currentUserInfo.userName
            this.$utils.ajax.get('/subscribenewspaper/common/initRecord').then((res) => {
                Object.assign(this.form, res);
                this.$refs.form.snapshot(); //为当前数据记录快照
            });
        },
        // 加载表单数据
        onloadForm() {
            return this.$utils.ajax.get('/subscribenewspaper/rss/selectByPrimaryKey?' + qs.stringify({
                id: this.docId,
            })).then((res) => {
                this.form = res;
            }).catch((err) => {
                this.$message.error(err);
            });
        },
        callIsManager() {
            return this.$utils.ajax.get('/subscribenewspaper/common/isManager?seq=' + new Date().getTime())
                .then((res) => {
                    this.isMoudleManager = !!res
                }).catch((err) => {
                    this.isMoudleManager = false
                    this.$message.error(err);
                })
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
