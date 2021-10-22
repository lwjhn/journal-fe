<template>
    <div class="order-table">
        <el-card class="box-card"
                 style="width: 100%;margin-top: 10px; box-shadow: none;"
                 v-if="rendered">
            <el-table :data="orders" header-cell-class-name="fs-base"
                      :row-class-name="tableRowClassName">
                <el-table-column
                    label="排序号"
                    width="80" prop="sortNo">
                    <template slot-scope="scope">
                        <el-input-number v-model="scope.row.sortNo" controls-position="right" :disabled="!isEdit"
                                         :min="0" :max="2147483647" @change="sort" title="请输入排序号（正整数）"
                                         :controls="false"></el-input-number>
                    </template>
                </el-table-column>
                <el-table-column label="报刊信息">
                    <template slot-scope="scope">
                        <el-select v-model="scope.row.paperId"
                                   filterable reserve-keyword
                                   placeholder="请输入报刊名称或邮发代号"
                                   :disabled="!isEdit"
                                   @change="id=>scope.row.paper=paperList.find(o=>o.id===id)"
                        >
                            <el-option
                                v-for="item in paperList"
                                :key="item.id" :disabled="!isEdit"
                                :label="`${item.publication} （ ${item.postalDisCode} ）`"
                                :value="item.id">
                                {{ item.publication }}<span class="postalDisCode">{{ item.postalDisCode }}</span>
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column
                    label="订阅份数"
                    width="100">
                    <template slot-scope="scope">
                        <el-input-number v-model="scope.row.subscribeCopies" controls-position="right"
                                         :disabled="!isEdit"
                                         :min="1" :max="2147483647" :controls="false"></el-input-number>
                    </template>
                </el-table-column>
                <!-- <el-table-column
                    label="刊期"
                    width="80">
                    <span slot-scope="scope" class="fs-base">{{
                            !scope.row.paper ? '' : scope.row.paper.periodical
                        }}</span>
                </el-table-column> -->
                <el-table-column
                    label="单价"
                    width="80">
                    <span slot-scope="scope" class="fs-base">{{
                            !scope.row.paper ? '' : scope.row.paper.unitPrice
                        }}</span>
                </el-table-column>
                <el-table-column
                    label="年价"
                    width="80">
                    <span slot-scope="scope" class="fs-base">{{
                            !scope.row.paper ? '' : scope.row.paper.yearPrice
                        }}</span>
                </el-table-column>
                <el-table-column
                    label="总金额"
                    width="100">
                    <span slot-scope="scope"  v-if="scope.row.paper"
                           class="fs-base"
                            :title="scope.row.subscribeCopies * scope.row.paper.yearPrice">
                        {{ scope.row.subscribeCopies * scope.row.paper.yearPrice }}
                    </span>
                </el-table-column>
                <!-- <el-table-column
                    label="类型">
                <span slot-scope="scope" class="fs-base">{{
                        !(scope.row.paper && scope.row.paper.paperType) ? '' : JSON.parse(scope.row.paper.paperType).join('、')
                    }}</span>
                </el-table-column> -->
                <el-table-column
                    width="220"
                    label="出版社">
                    <span slot-scope="scope" class="fs-base">{{ !scope.row.paper ? '' : scope.row.paper.press }}</span>
                </el-table-column>
                <el-table-column fixed="right" v-if="isEdit" width="100">
                    <el-button-group slot="header" class="cl-tool-bar">
                        操作
                    </el-button-group>
                    <template slot-scope="scope">
                        <el-button
                            class="cl-row-btn"
                            size="mini" plain
                            type="danger"
                            @click="del(scope.$index, scope.row)">删除
                        </el-button>
                        <!--                    <el-alert
                                                v-if="scope.row.error"
                                                class="cl-warning"
                                                :title="scope.row.error"
                                                type="warning" :closable="false">
                                            </el-alert>-->
                    </template>
                </el-table-column>
                <div slot="append" class="fs-base" style="padding:15px 10px;">
                    <span v-if="isEdit">
                        <el-button type="primary" @click.stop="add">添加</el-button>
                        <el-button type="primary" @click.stop="sortNo">排序</el-button>
                    </span>
                    &nbsp;总计：
                    <span>共{{ this.summaries.count }}类</span>&nbsp;&nbsp;
                    <span>共{{ this.summaries.subscribeCopies }}份</span>&nbsp;&nbsp;
                    <span>共{{ this.summaries.yearPrice }}元</span>
                </div>
            </el-table>
        </el-card>
    </div>

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
        },
        orders: {
            handler(newValue, oldValue) {
                console.log(newValue)
            },
            deep: true
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
        summaries() {
            let subscribeCopies = 0, yearPrice = 0, paperId
            this.orders.forEach(item => {
                paperId = item.paperId
                subscribeCopies += item.subscribeCopies
                yearPrice += item.subscribeCopies * (item.paper && item.paper.yearPrice ? item.paper.yearPrice : 0)
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
        tableRowClassName({row, rowIndex}) {
            return row.error ? 'warning-row' : ''
        },
        associatedPaper(queryString, cb, paperIds) {
            const before = (request) => {
                request.order = ["sort_no ASC"]
                return request
            }
            (
                paperIds && paperIds.length > 0
                    ? service.select.call(this, service.models.paper, paperIds.map(() => 'id = ?').join(' or ') + ' or isValid = TRUE', paperIds, 0, 5000, before)
                    : service.select.call(this, service.models.paper, `isValid = TRUE${queryString ? ' and (publication like ? or postalDisCode like ?)' : ''}`, `%${queryString}%`, 0, 5000, before)
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
            this.$nextTick(() => {
                this.orders.sort((a, b) => a.sortNo - b.sortNo)
            })
        },
        sortNo() {
            this.$nextTick(() => {
                this.orders.forEach((item, index) => item.sortNo = index + 1)
            })
        },
        checkOrders(nonPid) {
            //获取需修改或插入的文件
            let response = [], origin, form = order.form, validator, update,
                repeat = {}

            this.orders.forEach((item, index, arr) => {
                item.pid = this.pid

                if (item.hasOwnProperty('error')) {
                    delete item.error
                    arr.splice(index, 1, item)
                }
                if (repeat.hasOwnProperty(item.paperId)) {
                    arr.splice(index, 1, item)
                    throw new Error(repeat[item.paperId].error = item.error = `发现有重复订阅的报刊${item.paper && item.paper.publication ? `：${item.paper.publication}` : ''}，请确认！`)//'列表中订阅刊物重复！')
                } else {
                    repeat[item.paperId] = item
                }

                origin = item.id ? this.history[item.id] : undefined
                update = !origin
                for (let key in form) {
                    if (nonPid && /^pid$/i.test(key)) {
                        continue
                    }
                    if ((validator = form[key].validator) && (
                        (typeof validator.validator === 'function' && !validator.validator(item[key]))
                        || (validator.required && !item[key])
                    )) {
                        arr.splice(index, 1, item)
                        throw new Error(item.error = validator.message ? validator.message : '相关参数不允许为空')
                    }
                    if (origin && origin[key] !== item[key]) {
                        update = true
                    }
                }
                if (update) {
                    response.push(item)
                }
            })

            return response
        },
        submit(cb) {
            if (!this.pid)
                return service.error.call(this, '主文档尚未保存！')
            if (this.orders.length < 1)
                return typeof cb === 'function' ? cb() : null

            const loadingInstance = this.$loading({lock: true, text: '保存报刊信息，请稍后'})
            try {
                Promise.all(this.checkOrders().map(item => this.save(item))).then(() => {
                    typeof cb === 'function' ? cb() : null
                }).catch((err) => {
                    this.$forceUpdate()
                    service.error.call(this, err)
                }).finally(() => {
                    if (loadingInstance)
                        loadingInstance.close()
                })
            } catch (e) {
                Error.prototype.isPrototypeOf(e) ? e.message : e
            }

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
            service.select.call(this, order, `pid = ?`, this.pid, 0, 1000, (request => {
                request.order = [service.camelToUpperUnderscore('sortNo') + ' ASC']
            })).then((res) => {
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
/deep/ .suggested-form-padding{
    padding: 24px 18px !important;
}
.order-table{
    width: 1300px;
    margin: 0 auto;
}
@media screen and (max-width: 1560px) {
    .order-table {
        width: 1160px;
        margin: 0 auto;
    }
}
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

/deep/ .el-table .warning-row {
    background: #fef0f0;
}
/deep/ .el-table__row .el-input-number > .el-input > .el-input__inner{
    width: 60px !important;
    padding-left:10px !important;
    padding-right:0 !important;
}
</style>
