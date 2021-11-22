<template>
    <div>
        <div class="el-row" v-if="rendered" v-for="pos in Math.ceil(options.length / form.panelHorizontal)" :key="pos">
            <div class="el-col db-config-col" v-for="index in form.panelHorizontal" :key="index">
                <select-panel
                    :option="options[(pos-1) * form.panelHorizontal + index - 1]"
                    :paperList="paperList"
                    :config="{
                        clearable: true,
                        filterable: true,
                        remote:true,
                        reserveKeyword:true,
                        placeholder:'请输入报刊名称或邮发代号',
                        remoteMethod: associatedPaper
                    }"
                ></select-panel>
            </div>
        </div>
        <div v-if="rendered" v-html="`<style>
            .db-config-col {
                display: inline-block;
                width: ${100/form.panelHorizontal}%;
                padding: 10px 20px;
            }
            .db-config-col>*{
                width: 100%;
            }
        </style>`"></div>

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
