const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
// 启动数据库连接
const url = "mongodb://localhost:27017/runoob"
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log('数据库已连接');
  const dbo = db.db("runoob");
  const site = dbo.collection("site")
  // 注册启动express服务 
  expressStart(site)
});

// 启动express服务
function expressStart (site) {
  const app = express()
  const port = 3000
  // 接口注册
  // 获取列表
  app.get('/getword', async (req, res) => {
    // console.log('req', req.query)
    res.header('Access-Control-Allow-origin', '*')
    const data = await getData(req.query)
    res.send(data)
  })
  // 插入数据
  app.post('/save_word', async (req, res) => {
    // console.log('req', req.query)
    res.header('Access-Control-Allow-origin', '*')
    const data = await saveData(req.query)
    console.log(data)
    res.send({code: 200, message: 'ok'})
  })
  // 删除数据
  app.post('/delete_word', async (req, res) => {
    console.log('req', req.query)
    res.header('Access-Control-Allow-origin', '*')
    await deleteData(req.query)
    res.send({code: 200, message: 'ok'})
  })
  function getData (whereStr) {
    return new Promise((resolve, reject) => {
      site.find(whereStr).toArray((err, result) => { // 返回集合中所有数据
        if (err) throw err;
        // console.log(result);
          console.log("list获取成功");
          resolve(result)
      });
    })
  }
  function saveData (whereStr) {
    return new Promise((resolve, reject) => {
      site.insertOne(whereStr, (err, res) => {
          if (err) throw err;
          console.log("item插入成功");
          resolve()
      })
    })
  }
  function deleteData (whereStr) {
    return new Promise((resolve, reject) => {
      site.deleteOne({_id: ObjectId(whereStr._id)}, (err, obj) => {
          if (err) throw err;
          console.log('obj', obj.result)
          console.log("item删除成功");
          resolve()
      })
    })
  }
  // 监听启动
  app.listen(port, () => {
    console.log('后端服务已启动')
    console.log(`express servier is listen http://localhost:${port}`)
  })
}

