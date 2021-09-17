<template>
    <el-card class="box-card"
             style="width: calc(100% - 30px); margin-left: 30px; margin-top: 30px; box-shadow: none;" v-if="rendered">
        <el-table :data="orders" header-cell-class-name="fs-base">
            <el-table-column
                label="排序号"
                width="150" prop="sortNo">
                <template slot-scope="scope">
                    <el-input-number v-model="scope.row.sortNo" controls-position="right" :disabled="!isEdit"
                                     :min="0" @change="sort" title="请输入排序号（正整数）"></el-input-number>
                </template>
            </el-table-column>
            <el-table-column
                label="报刊信息"
                width="260">
                <template slot-scope="scope">
                    <el-select
                        v-model="scope.row.paperId" filterable remote
                        reserve-keyword
                        placeholder="请输入报刊名称或邮发代号"
                        :remote-method="associatedPaper"
                        :disabled="!isEdit"
                        :loading="loading" @change="id=>scope.row.paper=paperList.find(o=>o.id===id)">
                        <el-option
                            v-for="item in paperList"
                            :key="item.id"
                            :label="`${item.publication} （ ${item.postalDisCode} ）`"
                            :value="item.id">
                            {{ item.publication }}<span class="postalDisCode">{{ item.postalDisCode }}</span>
                        </el-option>
                    </el-select>
                </template>
            </el-table-column>
            <el-table-column
                label="订阅份数"
                width="180">
                <template slot-scope="scope">
                    <el-input-number v-model="scope.row.subscribeCopies" controls-position="right" :disabled="!isEdit"
                                     :min="1"></el-input-number>
                </template>
            </el-table-column>
            <el-table-column
                label="刊期"
                width="80">
                <span slot-scope="scope" class="fs-base">{{ !scope.row.paper ? '' : scope.row.paper.periodical }}</span>
            </el-table-column>
            <el-table-column
                label="单价"
                width="80">
                <span slot-scope="scope" class="fs-base">{{ !scope.row.paper ? '' : scope.row.paper.unitPrice }}</span>
            </el-table-column>
            <el-table-column
                label="年价"
                width="80">
                <span slot-scope="scope" class="fs-base">{{ !scope.row.paper ? '' : scope.row.paper.yearPrice }}</span>
            </el-table-column>
            <el-table-column
                label="总金额"
                width="100">
                <el-tag slot-scope="scope" effect="dark" v-if="scope.row.paper"
                        :title="scope.row.subscribeCopies * scope.row.paper.yearPrice">
                    {{ scope.row.subscribeCopies * scope.row.paper.yearPrice }}
                </el-tag>
            </el-table-column>
            <el-table-column
                label="类型">
                <span slot-scope="scope" class="fs-base">{{ !scope.row.paper ? '' : scope.row.paper.paperType }}</span>
            </el-table-column>
            <el-table-column
                label="出版社">
                <span slot-scope="scope" class="fs-base">{{ !scope.row.paper ? '' : scope.row.paper.press }}</span>
            </el-table-column>
            <el-table-column fixed="right" v-if="isEdit">
                <el-button-group slot="header" slot-scope="scope" class="cl-tool-bar">
                    <el-button type="primary" icon="el-icon-plus"
                               title="添加" size="mini"
                               @click.stop="add"></el-button>
                    <el-button icon="el-icon-sort"
                               title="设置连续排序号" size="mini"
                               @click.stop="sortNo"></el-button>
                </el-button-group>
                <template slot-scope="scope">
                    <el-button
                        class="cl-row-btn"
                        size="mini" plain
                        type="danger"
                        @click="del(scope.$index, scope.row)">删除
                    </el-button>
                    <el-alert
                        v-if="scope.row.error"
                        class="cl-warning"
                        :title="scope.row.error"
                        type="warning" :closable="false">
                    </el-alert>
                </template>
            </el-table-column>
            <div v-if="!isEdit" slot="append" class="fs-base" style="padding:15px 10px;">
                总计：<el-tag type="info">刊物共{{this.summaries.count}}类</el-tag>&nbsp;&nbsp;
                <el-tag type="success" effect="dark">共{{ this.summaries.subscribeCopies }}份</el-tag>&nbsp;&nbsp;
                <el-tag effect="dark">共{{ this.summaries.yearPrice }}元</el-tag>
            </div>
        </el-table>
    </el-card>
</template>

<script>
import service from "../../../service";

const order = service.models.order

export default {
    name: "OrderForm",
    props: {
        pid: {
            type: String
        },
        isEdit: {
            type: Boolean,
            request: true,
            default: function () {
                return false
            }
        }
    },
    data() {
        return {
            orders: [],
            loading: false,
            paperList: [],
            rendered: false,
            history: {}
        }
    },
    watch: {
        pid(val, old) {
            // console.log(val, old)
            // debugger
        }
    },
    created() {
        this.loadOrders(() => {
            this.associatedPaper('', () => {
                this.orders.filter(item => item.paperId).forEach(item => {
                    item.paper = this.paperList.find(o => o.id === item.paperId)
                })
                this.rendered = true
            }, this.orders.length < 1 ? null : this.orders.filter(item => item.paperId).map((item => item.paperId)))
        })
    },
    computed: {
        summaries(){
            let subscribeCopies=0, yearPrice=0
            this.orders.forEach(item=>{
                subscribeCopies+=item.subscribeCopies
                yearPrice+=item.subscribeCopies * (item.paper && item.paper.yearPrice ? item.paper.yearPrice :0)
            })
            return {
                count: this.orders.length,
                subscribeCopies,
                yearPrice
            }
        }
    },
    mounted() {

    },
    methods: {
        associatedPaper(queryString, cb, paperIds) {
            (
                paperIds && paperIds.length > 0
                    ? service.select.call(this, service.models.paper, paperIds.map(() => 'id = ?').join(' or '), paperIds, 0, 1000)
                    : service.select.call(this, service.models.paper, `isValid = TRUE${queryString ? ' and (publication like ? or postalDisCode like ?)' : ''}`, `%${queryString}%`, 0, 20)
            )
                .then((res) => {
                    this.paperList = res
                })
                .catch((err) => {
                    service.error.call(this, err)
                }).finally(cb)
        },
        add() {
            let total = 0
            this.orders.forEach(item => total = total < item.sortNo ? item.sortNo : total)
            this.orders.push(Object.assign(service.modelDefaults(order.form), {sortNo: total + 1}))
        },
        del(index, data) {
            return !data.id ? this.callDel(index) : service.delete.call(this, order, 'id = ?', data.id).then((res) => {
                if (res !== 1) {
                    service.error.call(this, res < 1 ? '您无权删除此文档！' : '删除错误！' + res)
                } else {
                    this.orders.splice(index, 1)    //service.success.call(this, '删除完成！')
                }
            }).catch((err) => {
                service.error.call(this, err)
            })
        },
        callDel(index) {
            this.orders.splice(index, 1)
        },
        sort() {
            this.orders.sort((a, b) => a.sortNo - b.sortNo)
        },
        sortNo() {
            this.orders.forEach((item, index) => item.sortNo = index + 1)
        },
        submit(cb) {
            if (!this.pid)
                return service.error.call(this, '主文档尚未保存！')
            if (this.orders.length < 1)
                return typeof cb === 'function' ? cb() : null

            const loadingInstance = this.$loading({lock: true, text: '保存报刊信息，请稍后'})
            //获取需修改或插入的文件
            let promises = [], origin, form = order.form, validator, isUpdate
            this.orders.forEach(item => {
                item.pid = this.pid
                delete item.error
                if (item.id && (origin = this.history[item.id])) {
                    isUpdate = false
                    for (let key in form) {
                        if ((validator = form[key].validator) && validator.required && !item[key]) {
                            return item.error = validator.message ? validator.message : '相关参数不允许为空'
                        }
                        if (origin[key] !== item[key]) {
                            isUpdate = true
                            break
                        }
                    }
                    if (!isUpdate)
                        return
                }
                promises.push(this.save(item))
            })
            Promise.all(promises).then(() => {
                typeof cb === 'function' ? cb() : null
            }).catch((err) => {
                service.error.call(this, err)
            }).finally(() => {
                if (loadingInstance)
                    loadingInstance.close()
            })
        },
        save(data) {
            let value = Object.assign({}, data)
            delete value.paper
            return (data.id
                    ? service.update.call(this, order, value, 'id = ?', data.id)
                    : service.insert.call(this, order, value)
            ).then((res) => {
                if (res === 1 || (res && typeof res === 'string')) {
                    if (res !== 1) {
                        data.id = res
                        this.history[res] = Object.assign({}, data)
                    }
                } else {
                    data.error = res < 1 ? '您无权插入或更新此文档！' : '保存错误！' + res
                }
            }).catch(err => {
                data.error = '保存刊物信息时发现错误！'
            })
        },
        loadOrders(cb) {
            if (!this.pid)
                return typeof cb === 'function' ? cb() : null
            service.select.call(this, order, `pid = ?`, this.pid, 0, 1000)
                .then((res) => {
                    this.orders = res
                    this.orders.forEach(item => this.history[item.id] = Object.assign({}, item))
                })
                .catch((err) => {
                    service.error.call(this, err)
                })
                .finally(() => {
                    typeof cb === 'function' ? cb() : null
                })
        }
    }
}
</script>

<style lang="scss" scoped>
.postalDisCode {
    margin-left: 10px;
    font-size: 12px;
    color: #b4b4b4;
}

.cl-tool-bar {
    /*float: right;
    position: absolute;*/
    z-index: 2;
    /*left: 652px;*/

    button {
        padding: 7px;
    }
}

.cl-warning {
    float: left;
    margin-left: 30px;
    max-height: 30px;
    max-width: calc(100% - 100px);
}

.cl-row-btn {
    float: left;
}

</style>
