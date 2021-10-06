function message(message, type) {
    return this.$message({
        showClose: true,
        message,
        type
    })
}

export default {
    openForm(id, component, componentProps) {
        console.log(componentProps)
        debugger
        this.$popbox.open({
            id,
            component,
            parent: this,
            componentProps,
            isMax: true,
            isShowHeader: false,
            canMaximum: true,
            canMinimize: true,
            canRefresh: true
        }).then(res => {
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
