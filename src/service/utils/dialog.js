function message(message, type) {
    return this.$message({
        showClose: true,
        message,
        type
    })
}

export default {
    openForm(id, component, componentProps) {
        let pop = this.$popbox.open(Object.assign({
            parent: this,
            isMax: true,
            isShowHeader: false,
            canMaximum: true,
            canMinimize: true,
            canRefresh: true
        }, arguments.length === 1 ? arguments[0] : {
            id,
            component,
            componentProps,
        }))
        if (arguments.length > 1) {
            pop.then(res => {
                this.refresh();
            })
        }
        return pop
    },
    confirm(message, type) {
        return this.$confirm(message, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: type ? type : 'warning'
        })
    },
    success(msg) {
        return message.call(this, msg, 'success')
    },
    warning(msg) {
        return message.call(this, msg, 'warning')
    },
    error(msg) {
        return message.call(this, msg, 'error')
    },
    message,
    closeAllMessage() {
        this.$message.closeAll();
    }
}
