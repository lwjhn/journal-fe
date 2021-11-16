/**
 * model template :
 * export default {
 *      model: 'com.rongji.egov.journal.service.model.Order',
 *      form: {
 *          id: {
 *              default: ''
 *          },
 *          content: {
 *              default: [],
 *              validator:{
 *                  required: true,
 *                  validator(rule, value, callback){
 *                      callback(value.length>0 ? undefined : new Error('类型不允许为空！'))
 *                  }
 *              },
 *              parse(value) {    //action in onloadForm
 *                  return value ? JSON.parse(value) : []
 *              },
 *              format(value){  //action in onSubmit
 *                  return typeof==='string' ? JSON.stringify(value) : value    // this.formatStringDate(value)
 *              }
 *         }
 *     }
 * }
 */

import paper from './paper'
import subscription from "./subscription"
import order from './order'
import statPrintConfig from "./statPrintConfig"
import orderLimit from "./orderLimit";
import dbConfig from "./dbConfig";
export default {
    paper,
    subscription,
    order,
    statPrintConfig,
    orderLimit,
    dbConfig
}
