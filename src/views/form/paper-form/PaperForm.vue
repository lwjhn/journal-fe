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
                                      size="small" style="max-width: 60%;margin: auto;">
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="报刊名称:"
                                              prop="publication">
                                    <el-input v-model="form.publication"
                                              placeholder="请输入报刊名称" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="邮发代号:"
                                              prop="postalDisCode">
                                    <el-input v-model="form.postalDisCode" :disabled="!this.isManager" title="格式：整数-整数（如 1-1）"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="报纸/期刊:"
                                              prop="journal">
                                    <dict-input code="dict_journal"
                                                type="radio"
                                                v-model="form.journal" :disabled="!this.isManager"></dict-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="语言种类:"
                                              prop="lang">
                                    <dict-input code="dict_lang"
                                                type="radio"
                                                v-model="form.lang" :disabled="!this.isManager"></dict-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="类  型:"
                                              prop="paperType">
<!--                                    <el-input v-model="form.paperType" :disabled="!this.isManager"></el-input>-->
                                    <dict-input code="dict_paper_type"
                                                type="select" multiple
                                                v-model="form.paperType" :disabled="!this.isManager"></dict-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="刊  期:"
                                              prop="periodical">
                                    <dict-input code="dict_periodical"
                                                type="select"
                                                v-model="form.periodical" :disabled="!this.isManager"></dict-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="单  价:"
                                              prop="unitPrice">
                                    <el-input v-model="form.unitPrice"
                                              type="number" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="年  价:"
                                              prop="yearPrice">
                                    <el-input v-model="form.yearPrice"
                                              type="number" :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="订阅途径:"
                                              prop="deliveryMethod">
                                    <dict-input code="dict_deliveryMethod"
                                                type="select"
                                                v-model="form.deliveryMethod" :disabled="!this.isManager"></dict-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="条 码 号:"
                                              prop="barcode">
                                    <el-input v-model="form.barcode"
                                              :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="出 版 社:"
                                              prop="press">
                                    <el-input v-model="form.press"
                                              :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="联系电话:"
                                              prop="phone">
                                    <el-input v-model="form.phone"
                                              :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="出版社地址:"
                                              prop="pressAddress">
                                    <el-input v-model="form.pressAddress"
                                              :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="12">
                                <el-form-item label="公费刊物:"
                                              prop="govExpense">
                                    <el-radio-group v-model="form.govExpense" :disabled="!this.isManager">
                                        <el-radio-button :label="true">是</el-radio-button>
                                        <el-radio-button :label="false">否</el-radio-button>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="栏  目:"
                                              prop="programa">
                                    <el-input v-model="form.programa"
                                              :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="24">
                                <el-form-item label="介  绍:"
                                              prop="presentation">
                                    <el-input v-model="form.presentation"
                                              :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="12">
                                <el-form-item label="排 序 号:"
                                              prop="sortNo">
                                    <el-input v-model="form.sortNo" type="number"
                                              :disabled="!this.isManager"></el-input>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="是否有效:"
                                              prop="isValid">
                                    <el-radio-group v-model="form.isValid" :disabled="!this.isManager">
                                        <el-radio-button :label="true">是</el-radio-button>
                                        <el-radio-button :label="false">否</el-radio-button>
                                    </el-radio-group>
                                </el-form-item>
                            </el-col>
                            <el-col :span="6">
                                <el-form-item label="必选刊物:"
                                              prop="isValid">
                                    <el-radio-group v-model="form.requisite" :disabled="!this.isManager">
                                        <el-radio-button :label="true">是</el-radio-button>
                                        <el-radio-button :label="false">否</el-radio-button>
                                    </el-radio-group>
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
import PaperForm from './PaperForm.js';

export default PaperForm;
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
