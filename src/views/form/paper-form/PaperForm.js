import service from '/src/service'
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
        MenuBarSetting: function () {
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
        ...baseForm.methods
    }
};
