# win10系统-简单搭建一套前后端页面（vue，express，mongoDB）
> 简单搞了一个hello world，也算是找了找全栈的门在哪里。网上的教程很多，但是有的默认你是知道一些后端基础，所以跟着做发现有不少步骤被省略导致爬坑难度较大。本篇就是根据我自身的爬坑经历总结的一些相对全乎的实现经历。当然每个命令，方法有什么意义还需要去翻[官方文档](https://docs.mongodb.com/manual/)


---

## 步骤0 - 先定个小目标
完成一个从后端获取数据渲染到页面的list，list每一项可以删除，页面下方会有输入框，输入提交后可在list中增加一条记录。如下图：
![简单实现方案](https://h5static.kuwo.cn/upload/image/7c74da13f16812ab30b18dea3ef4c3848b1aa2c26e530b5d35210ee76e8d4347.png)

## 步骤1 - 数据库启动
* [mongodb下载传送门](https://www.mongodb.org/dl/win32) 内有各种版本的下载地址,下载安装
* 复制mongodb的bin目录路径（如：D:\mongoDb\bin），打开系统环境变量>path>配置此路径
* C盘根目录创建data/db目录
* 打开cmd或powershell窗口运行命令,启动数据库（窗口为前台运行模式，勿关闭）
```dos
$ mongod
```

## 步骤2 - 后端服务连接数据库以及基本操作
* 全局安装nodemon工具包，方便node调试热刷新
```dos
$ npm i nodemon -g
```
* 初始node项目
```dos
$ mkdir nodeObject
$ cd nodeObject
$ npm init -y // 初始化npm项目
$ npm i mongodb -S // 安装mongodb包，操作数据库用
```
* 创建 **index.js** 文件，执行命令开启热刷新方便调试
```
$ nodemon index.js
```
* 打开后引入项目依赖,创建数据库连接(mongodb连接未创建的数据库、集合会自动创建)
```js
const { MongoClient, ObjectId } = require('mongodb') // API中已经建议用MongoClient替代Mongo,因为MongoClient是线程安全的，可以被多线程共享
const url = "mongodb://localhost:27017/runoob" // 27017为数据库默认端口号，runoob为新的数据库名会自动创建
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  const dbo = db.db("runoob")
  // ↓↓↓↓↓↓↓a区域↓↓↓↓↓↓↓
  // 数据库已创建/连接
  console.log('数据库已创建/连接')
  db.close() // 断开数据库连接
  // ↑↑↑↑↑↑↑a区域↑↑↑↑↑↑↑
})
```
* 创建集合把，a区域内替换为:
```js
// createCollection 为创建集合工具
dbo.createCollection('site', (err, res) => {
  if (err) throw err;
  console.log("创建集合成功");
  db.close();
})
```
* 插入数据，a区域内替换为:
```js
// insertOne 为插入单条数据工具，如果需要插入多条则使用insertMany
const myobj = { name: "hello world!", url: "kuwo_fe" } // 定义被插入的数据
dbo.collection("site").insertOne(myobj, (err, res) => {
  if (err) throw err;
  console.log("文档插入成功");
  db.close();
})
```
* 检索刚才插入的数据，a区域内替换为:
```js
// find 为获取匹配条件的数据，toArray会将匹配到的数据序列化为数组
const myobj = { url: "kuwo_fe" } // 定义查询的数据特征
dbo.collection("site").find(myobj).toArray((err, result) => { // 返回集合中所有数据
  if (err) throw err;
  console.log(result); // { name: "hello world!", url: "kuwo_fe" }
  db.close();
})
```
* 删除刚才插入的数据，a区域内替换为:
```js
// deleteOne 为删除单条匹配的数据， 如果想全部删除匹配的数据则使用deleteMany
const myobj = { url: "kuwo_fe" } // 定义查询的数据特征
dbo.collection("site").deleteOne(myobj, (err, result) => { // 返回集合中所有数据
  if (err) throw err;
  console.log('删除成功'); 
  db.close();
})
```
> 坑点：实际删除时遇到一个问题，创建数据时会自动生成一个_id属性，直接使用 {_id: '34fca3469b'} 来精确删除，是无法查找到所匹配的数据进行删除操作的，需要使用以下方法（具体原因参照[ObjectId介绍](https://docs.mongodb.com/manual/reference/method/ObjectId/)）：

```js
const ObjectId = require('mongodb').ObjectId
// a区域改为
const myobj = { _id_: ObjectId("34fca3469b") } // 定义查询的数据特征
dbo.collection("site").deleteOne(myobj, (err, result) => { // 返回集合中所有数据
  if (err) throw err;
  console.log('删除成功'); 
  db.close();
})
```

## 步骤3 - 后端接口服务定义
> 以获取数据列表为例，其他业务实现方式相似，附件中有最终业务代码
* 定义接口业务

```js
const express = require('express')
const app = express()
// 获取列表
app.get('/getword', async (req, res) => {
  res.header('Access-Control-Allow-origin', '*')
  const data = await getData(req.query) // req.query为查找条件
  res.send(data)
})
function getData (whereStr) {
  return new Promise((resolve, reject) => {
    // 返回集合中所有数据
    const site = dbo.collection("site") // 为数据库连接成功以后连接的集合
    site.find(whereStr).toArray((err, result) => {
      if (err) throw err;
        console.log("list获取成功");
        resolve(result)
    });
  })
}
```
* 启动express服务监听 
```js
const port = 3000
app.listen(port, () => {
  console.log(`express servier is listen http://localhost:${port}`)
})
```
## 步骤4 - 前端业务
> 前端这边就简单用vue-cli创建了一个基本页面，通过原生XMLHttpRequest创建ajax请求获取数据，然后渲染到页面中
```dos
vue create clientApp
```
* 在page/index.vue中写一个请求获取数据的请求(其他实现方式类似，不再赘述)
```js
export default {
  mounted () {
    const xmlHttp = new XMLHttpRequest()
      xmlHttp.open('GET', `http://localhost:3000/getword?url=${this.param}`, true)
      xmlHttp.send()
      xmlHttp.onreadystatechange = () => {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
          const list = JSON.parse(xmlHttp.response)
          this.list = list // 存入到data中方便渲染页面
        }
      }
  }
}
```
# 总结
以上就是本次探索的摸门步骤，中间遇到主要的坑就是win环境启动mongo数据库，还有通过_id精确删除失败的问题。前后端项目文件访问[传送门](https://h5static.kuwo.cn/upload/image/5aa561e8bacfcb9b886fc78e2c7c88316abfb0ce28c2e29bc7a2e120991bdafc.jpg)，供同学们交流研究，有问题欢迎交流补充。
