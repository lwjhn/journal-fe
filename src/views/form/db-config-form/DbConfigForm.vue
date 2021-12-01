<template>
    <div class="config-form">
        <div class="el-row">
            <div v-if="isManager" class="el-col db-config-col" style="width: 100%;">
                <div style="border-bottom: 1px solid #dcdfe6; padding-top: 5px; padding-bottom: 15px;">
                    <el-button type="primary" @click="doEdit">{{ isEdit ? '退出' : '编辑' }}</el-button>
                    <el-button v-if="isEdit" type="primary" @click="beforeSubmit">保存</el-button>
                    <div v-if="isEdit" class="el-form-item el-form-item--small" style="min-width: 200px; width: 70%; float: right;">
                        <label class="el-form-item__label" style="width: 110px;">分发接口:</label>
                        <div class="el-form-item__content" style="margin-left: 110px;">
                            <div class="el-input el-input--small">
                                <el-input v-model="form.panelUrl" placeholder="请输入分发接口地址"></el-input>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="el-row">
            <div class="el-row db-config-row" v-if="rendered" v-for="pos in Math.ceil(options.length / form.panelVertical)" :key="pos">
                <div class="el-col db-config-col" v-for="index in form.panelVertical" :key="index">
                    <select-panel v-if="canEdit" class="config-select-panel"
                                  :option="options[(pos-1) * form.panelVertical + index - 1]"
                                  :paperList="paperList"
                                  :config="{
                        clearable: true,
                        filterable: true,
                        remote:true,
                        reserveKeyword:true,
                        placeholder:`[${(pos-1) * form.panelVertical + index}] 请输入报刊名称或邮发代号`,
                        remoteMethod: associatedPaper
                    }"
                    ></select-panel>
                    <tag-panel v-else type="" effect="dark" :index="(pos-1) * form.panelVertical + index - 1"
                               :option="options[(pos-1) * form.panelVertical + index - 1]">
                    </tag-panel>
                </div>
            </div>
            <div v-if="rendered" v-html="`<style>
            .db-config-row {
                width: ${100/Math.ceil(options.length / form.panelVertical)}%;
                float: left;
            }
            .db-config-col {
                display: inline-block;
                width: 100%;
                padding: 10px 20px;
            }
            .db-config-col>*{
                width: 100%;
            }
        </style>`"></div>
        </div>
    </div>
</template>

<script>
import DbConfigForm from './DbConfigForm.js';

export default DbConfigForm;
</script>


<style lang="scss" scoped>
.config-form {
    background-color: white;
    height: 100%;
    overflow-y: auto;

    /deep/ .config-select-panel input {
        background-color: #ecf5ff;
    }

    /deep/ button {
        width: 80px;
    }

    /deep/ .tag-panel {
        background-color: #ecf5ff;
        text-align: center;
        border-radius: 4px;
        cursor: pointer;
        border: 1px solid black;
        overflow: hidden;
        line-height: 40px;
        position: relative;
        height: 40px;
    }

    /deep/ .tag-panel.disabled {
        background-color: #ecf5ff;
        cursor: not-allowed;
    }

    /deep/ .postalDisCode {
        margin-left: 10px;
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
