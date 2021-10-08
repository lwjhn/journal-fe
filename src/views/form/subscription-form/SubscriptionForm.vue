<template>
    <div style="height: calc(100% - 60px);"
         class="example">
        <el-header height="60px" style="padding: 0 0;">
            <menu-bar ref="menuBar" v-if="!!menuBarSetting"
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
                                <el-form-item label="订阅类型:"
                                              prop="govExpense">
                                    <el-radio-group v-model="form.govExpense" :disabled="!this.isEdit"
                                                    @change="form.clearingForm = form.govExpense ? '支票' : '现金'">
                                        <el-radio-button :label="true">公费</el-radio-button>
                                        <el-radio-button :label="false">自费</el-radio-button>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="订阅处室:"
                                              prop="subscribeOrg">
                                    <multitree-button v-if="isManager && rootOrgNo" v-model="form.subscribeOrg"
                                                      :disabled="!this.isEdit" model="edit" :inputDisabled="true"
                                                      :request="{
                                                    org:{
                                                        url: '/user/rjUser/getTrees',
                                                        param: { treeType: 'org', isAll: true, orgNo: rootOrgNo},
                                                        text: '组织'
                                                     },
                                                      user:{
                                                        url: '/user/rjUser/getTrees',
                                                        param: { treeType: 'user', isAll: true, orgNo: rootOrgNo },
                                                        text: '人员'
                                                     },
                                                 }"
                                                      :tree="{
                                                    multiplePattern: false,
                                                    title: '订阅处室选择'
                                                 }"
                                                      @select-change="(item)=>{
                                                     this.form.subscribeOrg = item.length<1 ? '' : item[0].treeName;
                                                     this.form.subscribeOrgNo =item.length<1 ? '' : item[0].treeId;
                                                     debugger
                                                     if(/^U/.test(this.form.subscribeOrgNo)){
                                                         this.form.subscribeUserNo=this.form.subscribeOrgNo
                                                         this.form.subscribeUser=this.form.subscribeOrg
                                                     }
                                                 }"
                                    ></multitree-button>
                                    <el-tag v-else type="info" effect="plain" class="fs-base disable-input"> {{ form.subscribeOrg }}
                                    </el-tag>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="订 阅 人:"
                                              prop="subscribeUser">
                                    <tree-button v-if="isManager && rootOrgNo" v-model="form.subscribeUser" :disabled="!this.isEdit" model="edit"
                                                 :inputDisabled="true"
                                                 :request="{
                                                    url: '/user/rjUser/getTrees',
                                                    param: { treeType: 'user', isAll: false , orgNo: rootOrgNo}
                                                 }"
                                                 :tree="{
                                                    multiplePattern: false,
                                                    title: '订阅人选择'
                                                 }"
                                                 @select-change="(item)=>{
                                                     this.form.subscribeUser = item.length<1 ? '' : item[0].treeName;
                                                     this.form.subscribeUserNo = item.length<1 ? '' : item[0].treeId;
                                                     if(!this.form.govExpense){
                                                        this.form.subscribeOrgNo = this.form.subscribeUserNo
                                                        this.form.subscribeOrg = this.form.subscribeUser
                                                     }
                                                 }"></tree-button>
                                    <el-tag v-else type="info" effect="plain" class="fs-base disable-input"> {{ form.subscribeUser }}
                                    </el-tag>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="订阅年份:"
                                              prop="subscribeYear">
                                    <el-date-picker
                                        v-model="subscribeYearComputed"
                                        type="year"
                                        placeholder="选择订阅年份" :disabled="!this.isEdit">
                                    </el-date-picker>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="起止订期:">
                                    <el-input-number v-model="form.subscribeMonthBegin" :disabled="true" :min="1"
                                                     :max="12"></el-input-number>&nbsp;月&nbsp;&nbsp;-&nbsp;&nbsp;<el-input-number
                                    v-model="form.subscribeMonthEnd" :disabled="true" :min="1"
                                    :max="12"></el-input-number>&nbsp;月
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <template v-if="!form.govExpense">
                            <el-row>
                                <el-col :span="6">
                                    <el-form-item label="是否省领导:"
                                                  prop="isLeaderProvince">
                                        <el-radio-group v-model="form.isLeaderProvince" :disabled="!this.isEdit">
                                            <el-radio-button :label="true">是</el-radio-button>
                                            <el-radio-button :label="false">否</el-radio-button>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="6">
                                    <el-form-item label="是否厅领导:"
                                                  prop="isLeaderHall">
                                        <el-radio-group v-model="form.isLeaderHall" :disabled="!this.isEdit">
                                            <el-radio-button :label="true">是</el-radio-button>
                                            <el-radio-button :label="false">否</el-radio-button>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="收件对象:"
                                                  prop="consignee">
                                        <dict-input code="dict_consignee"
                                                    type="radio"
                                                    v-model="form.consignee"
                                                    :disabled="!this.isEdit"
                                        ></dict-input>
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </template>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="状  态:"
                                              prop="verifyStatus">
                                    <el-radio-group v-model="form.verifyStatus"
                                                    :disabled="true">
                                        <el-radio-button :label="0">草稿</el-radio-button>
                                        <el-radio-button :label="1">待审核</el-radio-button>
                                        <el-radio-button :label="2">已审核</el-radio-button>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="结算方式:"
                                              prop="clearingForm">
                                    <el-select v-model="form.clearingForm" :disabled="!this.isEdit">
                                        <template v-if="form.govExpense">
                                            <el-option label="支票" value="支票" :disabled="!this.isEdit"></el-option>
                                        </template>
                                        <template v-else>
                                            <el-option label="现金" value="现金" :disabled="!this.isEdit"></el-option>
                                            <el-option label="赠送" value="赠送" :disabled="!this.isEdit"></el-option>
                                        </template>
                                    </el-select>

                                    <!--                                <dict-input code="dict_clearingForm"
                                                                                    type="select"
                                                                                    v-model="form.clearingForm" :disabled="!this.isEdit"></dict-input>-->
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="审 核 人:"
                                              prop="verifyUser">
                                    <el-input :value="this.form.verifyStatus==2 ? this.form.verifyUser : ''"
                                              :disabled="true"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="24">
                                <order-form ref="refOrder" :pid="this.form.id" :is-edit="isEdit"></order-form>
                            </el-col>
                        </el-row>
                    </dirty-check-form>
                </el-scrollbar>
            </div>
        </div>
    </div>
</template>

<script>
import SubscriptionForm from './SubscriptionForm.js';

export default SubscriptionForm;
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

    .disable-input{
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
