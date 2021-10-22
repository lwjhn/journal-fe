import service from '../../../service'
import baseForm from "../base-form";

const model = service.models.paper

export default {
    name: 'PaperForm',
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
            loading: false,
            systemNo: this.$store.getters['user/systemNo'],
        }
    },
    computed: {
        isManager() {
            let roles = this.$store.state.user.roles
            for (let role of service.managers) {
                if (roles.indexOf(role) > -1)
                    return true
            }
            return false
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
                        text: '作废',
                        icon: 'toolbar01 cancel',
                        handle: this.setInvalid.bind(this),
                        show: this.isManager
                    },
                    'bc': {
                        text: '保存',
                        icon: 'toolbar03 save',
                        handle: this.beforeSubmit.bind(this),
                        show: this.isManager
                    }
                }
            }
        }
    },
    created() {

    },
    mounted() {
        this.form.id = this.docId
        this.loadComponent();
    },
    methods: {
        loadComponent() {
            if (this.form.id) {
                Promise.all([this.onloadForm()]).then(() => {
                    this.loading = false;
                    this.$refs.form.snapshot();
                });
            } else {
                this.loading = false;
            }
        },
        ...baseForm.methods,

        beforeSubmit() {
            let code = this.form.postalDisCode,
                sortNo = Number(this.form.sortNo)
            if (!/^[\d-]+$/g.test(code)) {
                return service.error.call(this, '邮发代号为空或格式错误！')
            }
            if ((isNaN(sortNo) || sortNo <= 0) && code) {
                this.form.sortNo = code.split('-').reduce((total, value, index, src) => {
                    return isNaN(value = Number(value)) || value < 0 ? total : (`${total}${value.toString().padStart(5, '0')}`)
                })
            }

            this.onSubmit()
        },
        setInvalid() {
            if (!this.form.id) {
                return service.warning.call(this, '此文件未保存，不需要删除!')
            }
            service.confirm.call(this, '确定要作废此文档？').then((res) => {
                if (res) {
                    service.update.call(this, this.model, {
                        isValid: false
                    }, 'id = ?', this.form.id).then((res) => {
                        if (res !== 1) {
                            service.error.call(this, res < 1 ? '您无权作废此文档！' : '作废错误！' + res)
                        } else {
                            service.success.call(this, '作废成功！')
                            this.close()
                        }
                    }).catch((err) => {
                        service.error.call(this, err)
                    })
                }
            })
        }
    }
};
