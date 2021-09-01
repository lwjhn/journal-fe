<template>
    <div class="stat-box">
        <div class="stat-tool-bar">
            <el-button v-loading.fullscreen.lock="fullscreenLoading" @click="callAnalysis" type="primary"
                       icon="el-icon-search">统计
            </el-button>
        </div>
        <el-tabs v-model="activeName">
            <el-tab-pane class="form" label="选项" name="stat-basic">
                <el-form class="courts-form"
                         label-width="140px"
                         size="small">
                    <el-row v-for="(row, index) in where"
                            :key="index">
                        <el-col v-for="(col, subindex) in row"
                                :key="subindex"
                                :span="col.span ? col.span : 24/row.length">
                            <search-panel :config="col"></search-panel>
                        </el-col>
                    </el-row>
                </el-form>
            </el-tab-pane>
            <el-tab-pane label="统计结果" name="stat-result" v-loading="result.loading">
                <div class="stat-result-box">
                    <div class="stat-result-title">
                        {{ this.result.title }}
                    </div>
                    <el-table :data="result.data" v-if="result.columns && result.columns.length>0">
                        <el-table-column type="index"
                                         width="80"
                                         label="序号"
                                         :index="index => index+1">
                        </el-table-column>
                        <el-table-column
                            v-for="(item,index) in result.columns"
                            :label="item.label"
                            :key="index"
                            :width="item.width ? item.width : ''"
                            :min-width="item.minWidth ? item.minWidth : ''"
                            :prop="item.alias"
                            v-if="!item.hidden"
                        >   <!--:sortable="item.sortable ? 'custom' : null"-->
                            <template slot-scope="scope" v-if="scope.row">
                                {{
                                    typeof (item.format) == 'function' ? item.format.call(_self, item, scope.row)
                                        : (scope.row.hasOwnProperty(item.name) ? scope.row[item.name] : scope.row[item.alias])
                                }}
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<script>
import config, {generateRequest} from "./lib/config"
import {query} from "./lib/stat";
import SearchPanel from '@rongji/rjmain-fe/packages/base-view/src/SearchPanel'

export default {
    name: "StatPrint",
    components: {SearchPanel},
    data() {
        return {
            fullscreenLoading: false,
            activeName: 'stat-basic',
            systemNo: this.$store.state.user.systemNo,
            ...config.call(this),
            result: {
                loading: false,
                title: '',
                columns: [],
                data: []
            },
        }
    },
    created() {

    },
    methods: {
        callAnalysis() {
            this.activeName = 'stat-result'
            this.result.loading = true
            let request = this.generateRequest()
            let mode = this.where[this.where.length - 1][0]
            query.call(this, request, mode.value, (response, fields, mode) => {
                this.result.title = mode
                this.result.columns.splice(0, this.result.columns.length, ...fields)
                this.result.data = response.filter(o => o)   //this.result.data.splice(0,0 , ...response)
                this.result.loading = false
            })
        },
        generateRequest
    }
}
</script>

<style lang="scss" scoped>
.stat-box {
    background-color: white;
    padding: 10px 20px;
    height: 100%;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .stat-tool-bar {
        display: block;
        position: absolute;
        right: 40px;
        z-index: 8000;
    }

    .stat-result-title {
        padding: 20px 20px 30px 20px;
        font-size: 20px;
        font-weight: bold;
        text-align: center;
        font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimSun, sans-serif;
    }

    .stat-result-table {
        width: 100%;
        border-collapse: collapse;
        border-spacing: 0;

        td {
            border: 1px solid #d7dae2;
            text-align: center;
            line-height: 2;
            padding: 5px;
            color: #606266;
            font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", SimSun, sans-serif;
            font-weight: 400;
            font-size: 14px;
        }

        thead td {
            font-weight: bold;
            background-color: #fafafa !important;
        }

        tr.eventType td:first-child {
            font-weight: bold;
        }
    }

    .stat-result-table:not(.month) {
        tr td:nth-child(2n) {
            background-color: #fffdf7;
        }
    }

    .stat-result-table.month {
        tr td:nth-child(3n -1) {
            background-color: #fffdf7;
        }
    }

    .stat-result-box {
        height: calc(100vh - 200px);
        overflow-y: auto;
        padding-bottom: 80px;
    }
}
</style>
