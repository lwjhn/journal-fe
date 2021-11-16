import service from '../../../service'
import baseForm from "../base-form";

const model = service.models.dbConfig

export default {
    name: 'DbConfigForm',
    data() {
        return {
            ...baseForm.data.call(this, model),
            loading: false,
            systemNo: this.$store.getters['user/systemNo'],
            isEdit: false
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
        options() {
            let h, v, items
            if (isNaN(h = parseInt(this.form.panelHorizontal)) || h < 1) {
                this.form.panelHorizontal = h = 5
            }
            if (isNaN(v = parseInt(this.form.panelVertical)) || v < 1) {
                this.form.panelVertical = v = 10
            }
            if (! (items=this.form.panelItems) ) {
                this.form.panelItems = items = []
            }
            let len = Math.max(h * v, Math.ceil(this.form.panelItems.length / h) * h)
            for(let i = items.length; i< len; i++){
                items.push({})
            }
            return items
        }
    },
    mounted() {
        this.form.id = this.docId
        this.loadComponent();
    },
    methods: {
        loadComponent() {
            Promise.all([this.onloadForm()]).then(() => {
                this.loading = false;
                this.$refs.form.snapshot();
            });
        },
        ...baseForm.methods,
        onloadForm() {
            return service.selectOne.call(this, this.model, null, null).then((res) => {
                if (res.length < 1)
                    return
                else if (res.length >= 1)
                    service.warning.call(this, '找到多份配置文件！');
                service.modelFormat(this.model.form, res[0], 'parse')
                this.form = res[0];
            }).catch((err) => {
                service.error.call(this, err);
            })
        },
        beforeSubmit() {
            this.onSubmit()
        }
    }
}
