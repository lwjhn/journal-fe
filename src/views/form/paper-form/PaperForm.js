import service from '/src/service'

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
            form: service.modelDefaults(model.form),
            loading: false,
            rules: this.$utils.validator(service.modelValidators(model.form)),
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
        onloadForm() {
            return service.selectOne.call(this, model, 'id = ?', this.form.id).then((res) => {
                if (res.length !== 1)
                    return this.$message.error(res.length < 1 ? '您无权浏览此文档或文档已被删除！' : '找到多份相同文件！');
                this.form = res[0];
            }).catch((err) => {
                this.$message.error(err);
            })
        },
        onSubmit() {
            this.$refs.form.validate().then(() => {
                const loadingInstance = this.$loading({lock: true, text: '保存文件中'})

                return (this.form.id
                        ? service.update.call(this, model, this.form, 'id = ?', this.form.id)
                        : service.insert.call(this, model, this.form)
                ).then((res) => {
                    if (res === 1 || (res && typeof res === 'string')) {
                        if (res !== 1) {
                            this.form.id = res
                        }
                        this.$message.success('此文档保存成功！')
                        return this.$refs.form.snapshot()
                    } else {
                        this.$message.error(res < 1 ? '您无权插入或更新此文档！' : '保存错误！' + res)
                    }
                }).catch((err) => {
                    this.$message.error(err);
                }).finally(() => {
                    if (loadingInstance)
                        loadingInstance.close()
                })
            })
        },
        onDelete() {
            if (!this.form.id) {
                return this.$message.warning('此文件未保存，不需要删除!')
            }

            this.$confirm('删除, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then((res) => {
                if (res) {
                    service.delete.call(this, model, 'id = ?', this.form.id).then((res) => {
                        if (res < 1) {
                            return this.$message.error('您无权删除此文档！')
                        }
                        this.$message.error(res == 1 ? '删除成功！' : '删除错误！' + res)
                        this.close()
                    }).catch((err) => {
                        this.$message.error(err)
                    })
                }
            });
        },
        onClose() {
            this.$refs.form.check().then(() => {
                this.$confirm('您有修改的数据未保存,请确认是否关闭!', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then((res) => {
                    if (res) {
                        this.close()
                    }
                })
            }).catch(() => {
                this.close()
            })
        },
        close() {
            try {
                this.$message.closeAll();
                this.$emit('popBoxCloseEvent'); // 触发关闭弹窗
            } catch (e) {
            }
        }
    }
};
