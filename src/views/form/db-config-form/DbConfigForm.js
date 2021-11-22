import service from '../../../service'
import baseForm from "../base-form";
import SelectPanel from "./SelectPanel";

const model = service.models.dbConfig
const ORDER_MAX = 50

export default {
    name: 'DbConfigForm',
    components: {SelectPanel},
    data() {
        return {
            ...baseForm.data.call(this, model),
            loading: false,
            systemNo: this.$store.getters['user/systemNo'],
            isEdit: false,
            paperList: [],
            rendered: false
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
                items.push({

                })
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
            this.rendered = false
            Promise.all([this.onloadForm()]).then(() => {
                this.associatedPaper('', () => {
                    this.rendered = true
                })
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
        },
        associatedPaper(queryString, cb) {
            let paperIds = null;    //this.orders.length < 1 ? null : this.orders.filter(item => item.paperId).map((item => item.paperId))

            service.select.call(this, service.models.paper, `(isValid = TRUE${queryString ? ' and (publication like ? or postalDisCode like ?)' : ''})`, `%${queryString}%`, 0, ORDER_MAX, request => {
                request.order = ["sort_no ASC"]
                /*if (paperIds && paperIds.length > 0) {
                    request.unionAll = [Object.assign(service.extend(true, {}, request), {
                        where: {
                            expression: `(${paperIds.map(() => 'id = ?').join(' or ')})`,
                            value: paperIds
                        }
                    })]
                    Object.assign(request, {predicate: `TOP ${ORDER_MAX}`, limit: [0, ORDER_MAX * 2]})
                }*/
                return request
            }).then((res) => {
                this.paperList = res
            }).catch((err) => {
                service.error.call(this, err)
            }).finally(cb)
        },
    }
}
