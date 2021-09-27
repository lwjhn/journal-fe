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
                                <el-form-item label="单位名称:" prop="company">
                                    <multitree-button v-model="form.company" :disabled="!this.isManager" model="edit"
                                                      :request="{
                                                    org:{
                                                        url: '/user/rjUser/getTrees',
                                                        param: { treeType: 'org', isAll: true, orgNo: this.currentUserInfo.orgNo },
                                                        text: '组织'
                                                     },
                                                      user:{
                                                        url: '/user/rjUser/getTrees',
                                                        param: { treeType: 'user', isAll: true, orgNo: this.currentUserInfo.orgNo },
                                                        text: '人员'
                                                     },
                                                 }"
                                                      :tree="{
                                                    multiplePattern: false,
                                                    title: '订阅处室选择'
                                                 }"
                                                      @select-change="(item)=>{
                                                     this.form.company = item.length<1 ? '' : item[0].treeName;
                                                 }"
                                    ></multitree-button>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="订阅年度:" prop="subscribeYear">
                                    <el-input v-model="form.subscribeYear"
                                              type="number" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="总金额:" prop="limitAmount">
                                    <el-input v-model="form.limitAmount"
                                              type="number" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="刊数:" prop="limitCount">
                                    <el-input v-model="form.limitCount"
                                              type="number" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="报数:" prop="limitCopies">
                                    <el-input v-model="form.limitCopies"
                                              type="number" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="起始日期:" prop="subscribeBegin">
                                    <el-date-picker v-model="form.subscribeBegin" type="date" placeholder="选择日期"
                                                    :disabled="!this.isManager"></el-date-picker>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="截止日期:" prop="subscribeEnd">
                                    <el-date-picker v-model="form.subscribeEnd" type="date" placeholder="选择日期"
                                                    :disabled="!this.isManager"></el-date-picker>
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
import OrderLimitForm from './OrderLimitForm.js';

export default OrderLimitForm;
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

    .el-date-editor {
        width: 100% !important;
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
