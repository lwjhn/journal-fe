function message(message, type) {
    return this.$message({
        showClose: true,
        message,
        type
    })
}

export default {
    openForm(id, component, componentProps) {
        this.$popbox.open(Object.assign({
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
        })).then(res => {
            this.refresh();
        });
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
