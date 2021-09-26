<template>
    <div style="height: calc(100% - 60px);"
         class="example">
        <el-header height="60px" style="padding: 0 0;">
            <menu-bar ref="menuBar"
                      :setting="menuBarSetting"></menu-bar>
        </el-header>
        <el-tooltip effect="light"
                    :content="form.publication"
                    placement="right">
        </el-tooltip>

        <div style="height: 100%; position: relative;">
            <div class="form">
                <el-scrollbar class="form__comments scrollbar"
                              view-class="suggested-form-padding">
                    <dirty-check-form ref="form"
                                      :model="form"
                                      class="courts-form"
                                      label-width="140px"
                                      :rules="rules"
                                      :loading="loading"
                                      size="small">
                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="单位名称:" prop="company">
                                    <el-input v-model="form.company"
                                              placeholder="请输入单位名称" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="经办人:" prop="transactor">
                                    <el-input v-model="form.transactor" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="邮编:" prop="postalCode">
                                    <el-input v-model="form.postalCode" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="电话:" prop="phoneNo">
                                    <el-input v-model="form.phoneNo" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="排序号:" prop="sortNo">
                                    <el-input-number v-model="form.sortNo"
                                              :disabled="!this.isManager" :min="0"></el-input-number>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="通信地址:" prop="address">
                                    <el-input v-model="form.address" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </dirty-check-form>
                </el-scrollbar>
            </div>
        </div>
    </div>
</template>

<script>
import StatPrintConfig from './StatPrintConfig.js';

export default StatPrintConfig;
</script>


<style lang="scss" scoped>
.form {
    /deep/ .file-manage__file {
        float: left;
        margin-left: 17px;
    }
    /deep/ :disabled:checked+span, /deep/ :disabled:not(button), /deep/ .is-checked.is-disabled span {
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
