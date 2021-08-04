<template>
  <div id="app">
    获取列表
    <ul>
      <li v-for="item in list" :key="item._id">
        <span>{{item.name}}</span>&nbsp;&nbsp;&nbsp;
        <button @click="deleteItem(item)">删除</button>
        <hr>
      </li>
    </ul>
    <input type="text" v-model="text" placeholder="请输入想要保存的内容" @keyup.enter="submit">
    <button @click="submit">提交</button>
  </div>
</template>

<script>

export default {
  name: 'App',
  data () {
    return {
      list: [],
      param: 'kuwo_fe5',
      text: '我要去',
    }
  },
  mounted () {
    this.getList()
  },
  methods: {
    getList () {
      const xmlHttp = new XMLHttpRequest()
      xmlHttp.open('GET', `http://localhost:3000/getword?url=${this.param}`, true)
      xmlHttp.send()
      xmlHttp.onreadystatechange = () => {
        // console.log('readystate', xmlHttp.readyState)
        // console.log('state', xmlHttp.status)
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
          const list = JSON.parse(xmlHttp.response)
          this.list = list
        }
      }
    },
    submit () {
      console.log(this.text)
      if (this.text === '') {
        alert('请输入要保存的内容')
        return
      }
      const xmlHttp = new XMLHttpRequest()
      xmlHttp.open('POST', `http://localhost:3000/save_word?url=${this.param}&name=${this.text}`, true)
      xmlHttp.send(``)
      xmlHttp.onreadystatechange = () => {
        // console.log('readystate', xmlHttp.readyState)
        // console.log('state', xmlHttp.status)
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
          const result = JSON.parse(xmlHttp.response)
          console.log('result', result)
          this.text = '我要去'
          this.getList()
        }
      }
    },
    deleteItem (item) {
      const xmlHttp = new XMLHttpRequest()
      xmlHttp.open('POST', `http://localhost:3000/delete_word?_id=${item._id}`, true)
      xmlHttp.send()
      xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
          console.log('result', '删除成功')
          this.getList()
        }
      }
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
