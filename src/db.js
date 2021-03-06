// @ts-check
const mysql = require("mysql");

class DB {
  pool;

  constructor() {
    this.init();
  }

  init() {
    this.pool = mysql.createPool({
      connectionLimit: 10,
      host: "localhost",
      user: "root",
      password: "",
      database: "paper_spider"
    });
  }

  connect(cb) {
    this.pool.getConnection((err, connection) => {
      if (err) {
        console.log("连接mysql出现了问题：" + err.stack);
        this.end();
        return;
      } else {
        console.log(`已连接上mysql，线程ID：${connection.threadId}`);
        cb && cb(connection);
      }
    });
  }

  insert(sql, values) {
    if (!values) throw new Error("调用mysql插入出错");
    const ist = (connection) => {
      console.log("开始执行插入语句：" + sql);
      connection.query(sql, [values], function(err, results) {
        if (err) {
          this.end(connection);
          throw err;
        }
        console.log("成功插入记录：" + results.affectedRows);
        // this.end(connection);
        connection.release();
      });
    };
    this.connect(ist);
  }

  end(connection) {
    connection.release();
  }
}

module.exports = DB;
