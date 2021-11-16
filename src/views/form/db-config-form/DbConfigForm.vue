<template>
    <div>
        <el-row v-for="pos in Math.ceil(options.length / form.panelHorizontal)" :key="pos">
            <el-col  v-for="index in form.panelHorizontal" :key="index" :span="24/form.panelHorizontal">
                -- ({{ (pos-1) * form.panelHorizontal + index - 1}}) --
            </el-col>
        </el-row>
    </div>
</template>

<script>
import DbConfigForm from './DbConfigForm.js';

export default DbConfigForm;
</script>


<style lang="scss" scoped>
.form {
    /deep/ .file-manage__file {
        float: left;
        margin-left: 17px;
    }

    /deep/ :disabled:checked + span, /deep/ :disabled:not(button), /deep/ .is-checked.is-disabled span {
        color: black !important;
    }
}

.example {
    /deep/ .ke-icon-quickformat {
        position: relative;
        background-image: none;
        width: 55px;
        height: 16px;
    }

    /deep/ .ke-icon-quickformat:before {
        position: absolute;
        content: '一键排版';
        width: 55px;
        height: 16px;
        line-height: 16px;
        display: block;
        top: 0;
        left: 0;
        color: #000;
        font-size: 12px;
        text-align: center;
    }
}
</style>
