const bodyParser = require('body-parser');
const express = require('express');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');

app.use('/public', express.static('public'));

let db;
MongoClient.connect(
  'mongodb+srv://Somin:dlthals17@cluster0.kbk9mgh.mongodb.net/?retryWrites=true&w=majority',
  function (err, client) {
    // err 처리
    if (err) return console.log(err);
    // todoapp이라는 database(폴더)에 연결
    db = client.db('todoapp');

    // post라는 collection에 data 저장
    // db.collection('post').insertOne(
    //   { 이름: 'Somin', 나이: 24, _id: 100 },
    //   function (err, result) {
    //     console.log('저장 완료');
    //   }
    // );

    // 연결되면 할 일
    app.listen(8080, function () {
      console.log('listening on 8080');
    });
  }
);

app.get('/', function (req, res) {
  // res.sendFile(__dirname + '/index.html');
  res.render('index.ejs');
});

app.get('/write', function (req, res) {
  // res.sendFile(__dirname + '/write.html');
  res.render('write.ejs');
});

app.post('/add', function (req, res) {
  // res.send('전송완료');
  // console.log(req.body.title);
  // console.log(req.body.date);
  db.collection('counter').findOne(
    { name: '게시물갯수' },
    function (err, result) {
      // console.log(result.totalPost);
      let totalPosts = result.totalPost;

      db.collection('post').insertOne(
        {
          _id: totalPosts + 1,
          title: req.body.title,
          date: req.body.date,
        },
        function (err, result) {
          console.log('저장 완료');
          // counter collection에 있는 totalPost도 update(+1) 해줘야함
          db.collection('counter').updateOne(
            { name: '게시물갯수' },
            { $inc: { totalPost: 1 } },
            function (err, result) {
              if (err) return console.log(err);
              res.send('전송 완료');
            }
          );
        }
      );
    }
  );
});

app.get('/list', function (req, res) {
  // post안의 모든 데이터를 꺼냄
  // find()까지만 작성하면 메타데이터까지 다 나옴
  db.collection('post')
    .find()
    .toArray(function (err, result) {
      console.log(result);
      res.render('list.ejs', { posts: result });
    });
});

// app.delete('/delete', function (req, res) {
//   req.body._id = parseInt(req.body._id);
//   db.collection('post').deleteOne(req.body, function (err, result) {
//     console.log('삭제 완료');
//   });
//   res.send('삭제 완료');
// });

app.delete('/delete', function (req, res) {
  req.body._id = parseInt(req.body._id);
  db.collection('post').deleteOne(req.body, function (err, result) {
    console.log('삭제완료');
    res.status(200).send({ message: '성공' });
    // res.status(400).send({ message: '실패' });
  });
});

app.get('/detail/:id', function (req, res) {
  db.collection('post').findOne(
    { _id: parseInt(req.params.id) },
    function (err, result) {
      res.render('detail.ejs', { data: result });
      console.log(result);
      if (err) return console.log(err);
    }
  );
});
