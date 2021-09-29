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
                    /*'deldoc': {
                        text: '删除',
                        icon: 'toolbar01 cancel',
                        handle: this.onDelete.bind(this),
                        show: this.isManager
                    },*/
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
            if(!/^[\d-]+$/g.test(code)){
                return service.error.call(this, '邮发代号为空或格式错误！')
            }
            if ((isNaN(sortNo) || sortNo <= 0) && code) {
                this.form.sortNo = code.split('-').reduce((total, value, index, src) => {
                    return isNaN(value=Number(value)) || value < 0 ? total : (`${total}${value.toString().padStart(4, '0')}`)
                })
            }

            this.onSubmit()
        },
    }
};
