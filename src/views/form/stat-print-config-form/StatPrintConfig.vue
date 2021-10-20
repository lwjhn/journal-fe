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
                                      size="small" style="max-width: 50%;margin: auto;">
                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="户  名:" prop="company">
                                    <el-input v-model="form.company"
                                              placeholder="请输入收报单位，个人，或科室" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="经 手 人:" prop="transactor">
                                    <el-input v-model="form.transactor" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="邮  编:" prop="postalCode">
                                    <el-input v-model="form.postalCode" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="电  话:" prop="phoneNo">
                                    <el-input v-model="form.phoneNo" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="排 序 号:" prop="sortNo">
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
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="收报人省份:">
                                    <el-tag type="info" effect="plain" class="fs-base disable-input">
                                        {{
                                            form.address ? (form.address.match(/^[^省]*省/) ? form.address.match(/^[^省]*省/)[0] : '') : ''
                                        }}
                                    </el-tag>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="收报人地市:">
                                    <el-tag type="info" effect="plain" class="fs-base disable-input">
                                        {{
                                            form.address ? (form.address.match(/[^省市区县]*市/) ? form.address.match(/[^省市区县]*市/)[0] : '') : ''
                                        }}
                                    </el-tag>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="收报人区县:">
                                    <el-tag type="info" effect="plain" class="fs-base disable-input">
                                        {{
                                            form.address ? (form.address.match(/市[^省市区县]*[市区县]/) ? form.address.match(/市[^省市区县]*[市区县]/)[0].replace(/^市/,'') : '') : ''
                                        }}
                                    </el-tag>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="收报人详细地址:">
                                    <el-tag type="info" effect="plain" class="fs-base disable-input">
                                        {{
                                            form.address ? form.address.replace(/.*[省市县]/g, '').replace(/[^区]*区/,'') : ''
                                        }}
                                    </el-tag>
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

    /deep/ :disabled:checked + span, /deep/ :disabled:not(button), /deep/ .is-checked.is-disabled span {
        color: black !important;
    }

    .disable-input {
        height: 36px;
        width: 100%;
        line-height: 36px;
        color: black;
        background-color: #f5f7fa;
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
