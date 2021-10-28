<template>
    <div style="height: calc(100% - 60px);"
         class="example">
        <el-header height="60px" style="padding: 0 0;">
            <menu-bar ref="menuBar"
                      :setting="menuBarSetting"></menu-bar>
        </el-header>
        <div class="form" style="height: 100%; width: 100%; max-width: 800px;margin: auto;padding: 0;">
            <el-scrollbar class="form__comments scrollbar"
                          view-class="suggested-form-padding">
                <el-form inline label-position="left"
                         label-suffix=":">
                    <search-box v-if="forms" :search="forms"></search-box>
                </el-form>
                <el-card class="box-card"
                         style="width: 100%;margin-top: 10px; box-shadow: none;">
                    <el-table ref="tableFiles" :data="files" header-cell-class-name="fs-base">
                        <el-table-column
                            type="selection"
                            width="60">
                        </el-table-column>
                        <el-table-column
                            label="序号"
                            width="80">
                            <div class="fs-base" slot-scope="scope">
                                {{ scope.$index + 1 }}
                            </div>
                        </el-table-column>
                        <el-table-column
                            label="文件"
                            prop="sortNo">
                            <div class="fs-base" slot-scope="scope">
                                {{ scope.row }}
                            </div>
                        </el-table-column>
                        <el-table-column
                            label="操作" width="200">
                            <template slot-scope="scope">
                                <el-button
                                    class="cl-row-btn"
                                    size="mini" type="primary"
                                    @click="importDoc(scope.row)">导入
                                </el-button>
                                <el-button
                                    class="cl-row-btn"
                                    size="mini" plain
                                    type="danger"
                                    @click="deleteFiles([scope.row])">删除
                                </el-button>
                            </template>
                        </el-table-column>
                        <div slot="append" class="fs-base" style="padding:15px 10px;">
                            <div style="position: absolute; left: 80px;">
                                <el-button
                                    size="mini" plain type="danger"
                                    @click="deleteFiles()">删除
                                </el-button>
                            </div>
                            <el-upload
                                v-bind="uploadProps"
                                :on-exceed="handleExceed"
                                :on-error="uploadError"
                                :on-success="uploadSuccess"
                                :before-upload="beforeUpload">
                                <el-button type="primary" size="mini">上传</el-button>
                            </el-upload>
                        </div>
                    </el-table>
                </el-card>
            </el-scrollbar>
        </div>
    </div>
</template>

<script>
import {form, query} from "./config"
import SearchBox from '@rongji/rjmain-fe/packages/base-view/src/SearchBox'

import service from '../../../service'
import path from "path";

const accept = '.xlsx,.xlsx'

export default {
    name: "UploadForm",
    components: {SearchBox},
    data() {
        return {
            form,
            files: []
        }
    },
    computed: {
        forms() {
            let forms = []
            for (let key in this.form) {
                forms.push(form[key])
            }
            return forms.sort((a, b) => a.index - b.index)
        },
        menuBarSetting: function () {
            return {
                buttons: {
                    'close': {
                        handle: function () {
                            try {
                                service.closeAllMessage.call(this)
                                this.$emit('popBoxCloseEvent')
                            } catch (e) {
                            }
                        }.bind(this)
                    }
                }
            }
        },
        uploadProps() {
            let project = service.project
            return {
                action: path.join(config.host, `/${project}/excel/upload`),
                autoUpload: true,
                multiple: true,
                showFileList: false,
                accept,
                data: {
                    //extend form data
                }
            }
        }
    },
    mounted() {
        this.loadFiles()
    },
    methods: {
        beforeUpload(file) {
            if (file.size && file.size > 10 * 1024 * 1024) {
                service.error.call(this, '文件大小不允许超过10M')
                return false
            }
        },
        uploadSuccess(file) {
            this.loadFiles()
        },
        uploadError(error, file) {
            service.error.call(this, error)
        },
        handleExceed() {
            console.log(arguments)
            debugger
        },
        deleteFiles(fileList) {
            if (!fileList) {
                fileList = this.$refs.tableFiles.selection
            }
            if (fileList.length < 1) {
                return service.error.call(this, '请选择需要删除的附件！')
            }

            service.confirm.call(this, '确定要永久性删除相关附件？').then((res) => {
                if (res) {
                    service.ajax.call(this, `/${service.project}/excel/del`, fileList).then((res) => {
                        this.loadFiles()
                    }).catch((err) => {
                        service.error.call(this, err)
                    })
                }
            })
        },
        loadFiles() {
            service.get.call(this, `/${service.project}/excel/list`).then((response) => {
                let regExp = new RegExp('\\.(' + accept.replace(/(,\s*)*\./g, value => value === '.' ? '' : '|') + ')$', 'i')
                this.files = response.filter(item => regExp.test(item))
            }).catch((err) => {
                service.error.call(this, err);
            })
        },
        importDoc(file) {
            if (!file) {
                return service.error.call(this, '请选择需要导入刊物信息的Excel附件！')
            }
            service.confirm.call(this, `确定要导入此Excel文件中相关刊物条目！ ${file}`).then((res) => {
                if (res) {
                    const loadingInstance = this.$loading({lock: true, text: '导入刊物信息中，请稍后...'})
                    try {
                        service.ajax.call(this, `/${service.project}/excel/input?file=${file}`, query.call(this)).then((res) => {
                            service.success.call(this, `导入已完成！ ${res}`)
                        }).catch((err) => {
                            service.error.call(this, err)
                        }).finally(() => {
                            if (loadingInstance)
                                loadingInstance.close()
                        })
                    } catch (e) {
                        if (loadingInstance)
                            loadingInstance.close()
                        console.error(e)
                    }
                }
            })
        },
    }
}
</script>

<style scoped lang="scss">

</style>
