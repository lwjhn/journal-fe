import service from '../../service'

export default {
    data: function (model) {
        return {
            model,
            form: service.modelDefaults(model.form),
            rules: this.$utils.validator(service.modelValidators(model.form)),
        }
    },
    methods: {
        onloadForm() {
            return service.selectOne.call(this, this.model, 'id = ?', this.form.id).then((res) => {
                if (res.length !== 1)
                    return service.error.call(this, res.length < 1 ? '您无权浏览此文档或文档已被删除！' : '找到多份相同文件！');
                service.modelFormat(this.model.form, res[0], 'parse')
                this.form = res[0];
            }).catch((err) => {
                service.error.call(this, err);
            })
        },
        onSubmit() {
            this.$refs.form.validate().then(() => {
                const loadingInstance = this.$loading({lock: true, text: '保存文件中'})

                return (this.form.id
                        ? service.update.call(this, this.model, this.form, 'id = ?', this.form.id)
                        : service.insert.call(this, this.model, this.form)
                ).then((res) => {
                    if (res === 1 || (res && typeof res === 'string')) {
                        if (res !== 1) {
                            this.form.id = res
                        }
                        if (this.hasOwnProperty('afterSubmit') && typeof this.afterSubmit === 'function')
                            return this.afterSubmit()
                        service.success.call(this, '保存成功！')
                        return this.$refs.form.snapshot()
                    } else {
                        service.error.call(this, res < 1 ? '您无权插入或更新此文档！' : '保存错误！' + res)
                    }
                }).catch((err) => {
                    service.error.call(this, err)
                }).finally(() => {
                    if (loadingInstance)
                        loadingInstance.close()
                })
            })
        },
        onDelete() {
            if (!this.form.id) {
                return service.warning.call(this, '此文件未保存，不需要删除!')
            }

            service.confirm.call(this, '确定要永久性删除此文档？').then((res) => {
                if (res) {
                    service.delete.call(this, this.model, 'id = ?', this.form.id).then((res) => {
                        if (res !== 1) {
                            service.error.call(this, res < 1 ? '您无权删除此文档！' : '删除错误！' + res)
                        } else {
                            service.success.call(this, '删除成功！')
                            this.close()
                        }
                    }).catch((err) => {
                        service.error.call(this, err)
                    })
                }
            });
        },
        onClose() {
            this.$refs.form.check().then(() => {
                service.confirm.call(this, '您有修改的数据未保存,请确认是否关闭!').then((res) => {
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
                service.closeAllMessage.call(this)
                this.$emit('popBoxCloseEvent') // 触发关闭弹窗
            } catch (e) {
            }
        }
    }
}
