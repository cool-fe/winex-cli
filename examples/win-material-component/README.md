# 就诊域筛选组件

### 基本用法
```html
  <template>
     <win-encounter-filter :placement="placement" @selfQuery="selfQuery" />
  </template>
  <script>
    export default {
      data () {
        return {
          placement: 'top-start'
        }
      },
      methods: {
        selfQuery (condition) {
          console.log(condition)
        }
      }
    }
  </script>
````


:::demo
```html
  <template>
     <win-encounter-filter :placement="placement" @selfQuery="selfQuery" />

     <el-alert type="info">
      {{condition}}
     </el-alert>
  </template>
  <script>
    export default {
      data () {
        return {
          condition: {},
          placement: 'top-start'
        }
      },
      methods: {
        selfQuery (condition) {
          this.condition = condition
          console.log(condition)
        }
      }
    }
  </script>
```
:::

### Attributes
| 参数               | 说明                                                     | 类型              | 可选值      | 默认值 |
|--------------------|----------------------------------------------------------|-------------------|-------------|--------|
| isNurse | 是否isNurse | boolean | — | true |
| showSave | 是否显示存为我的查询 | boolean | — | false |
| isPatientList | 是否为isPatientList | boolean | — | false |


### Events
| 事件名称 | 说明 | 回调参数 |
|---------|--------|---------|
| selfQuery | 查询条件 | 查询条件 |
