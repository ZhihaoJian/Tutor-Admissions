// @ts-check
const mysql = require("mysql");

class DB {
  connection;

  constructor() {
    this.init();
  }

  init() {
    this.connection = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "paper_spider"
    });
  }

  connect(cb) {
    this.connection.connect(err => {
      if (err) {
        console.log("连接mysql出现了问题：" + err.stack);
        this.end();
        return;
      } else {
        console.log(`已连接上mysql，线程ID：${this.connection.threadId}`);
        cb && cb();
      }
    });
  }

  insert(sql, values) {
    if (!values) throw new Error("调用mysql插入出错");
    const ist = () => {
      console.log("开始执行插入语句：" + sql);
      this.connection.query(sql, [values], function(err, results) {
        if (err) {
          this.end();
          throw err;
        }
        console.log("成功插入记录：" + results.affectedRows);
        this.end();
      });
    };
    this.connect(ist);
  }

  end() {
    this.connection.end();
  }
}

module.exports = DB;
