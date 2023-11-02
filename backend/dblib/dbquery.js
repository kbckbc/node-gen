const QUERY = {
  // TABLE: item
  item_create: `
    CREATE TABLE item
    (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      title  VARCHAR(50) NOT NULL,
      status   INTEGER,
      price   INTEGER,
      mySchool  VARCHAR(100) NOT NULL,
      location  VARCHAR(200) NOT NULL,
      description  VARCHAR(1000) NOT NULL,
      imageName  VARCHAR(100) NOT NULL,
      userName  VARCHAR(100) NOT NULL,
      date INTEGER,
      favorite INTEGER,
      buyer_username VARCHAR(100) NOT NULL
    );
  `,
  item_drop: `
    DROP TABLE item;
  `,
  item_select:`
    SELECT * FROM item;
  `,
  item_insert:`
    INSERT INTO item (title, status, price, mySchool, location, description, imageName, userName, date, favorite, buyer_username) values (?,?,?,?,?,?,?,?,?,?,?);
  `,
  item_delete:`
    DELETE FROM item WHERE _id = (?);
  `,
  // TABLE: item_comment
  item_comment_create: `
    CREATE TABLE item_comment
    (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id  INTEGER,
      comment  VARCHAR(200) NOT NULL,
      status INTEGER,
      date INTEGER,
      userName  VARCHAR(100) NOT NULL
    );
  `,
  item_comment_drop: `
    DROP TABLE item_comment;
  `,
  item_comment_select:`
    SELECT * FROM item_comment;
  `,
  item_comment_insert:`
    INSERT INTO item_comment (item_id, comment, status, date, userName) values (?,?,?,?,?);
  `,
  item_comment_delete:`
    DELETE FROM item_comment WHERE _id = (?);
  `,
  // TABLE: user
  user_create: `
    CREATE TABLE user
    (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      userName  VARCHAR(100) NOT NULL,
      password  VARCHAR(200) NOT NULL,
      email  VARCHAR(100) NOT NULL,
      mySchool  VARCHAR(100) NOT NULL,
      joindate INTEGER
    );
  `,
  user_drop: `
    DROP TABLE user;
  `,
  user_select:`
    SELECT * FROM user;
  `,
  user_insert:`
    INSERT INTO user (userName, password, email, mySchool, joindate) values (?,?,?,?,?);
  `,
  user_delete:`
    DELETE FROM user WHERE _id = (?);
  `,
  // TABLE: user_review
  user_review_create: `
    CREATE TABLE user_review
    (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(100) NOT NULL,
      score INTEGER,
      comment  VARCHAR(200) NOT NULL,
      date INTEGER,
      buyer_username  VARCHAR(100) NOT NULL
    );
  `,
  user_review_drop: `
    DROP TABLE user_review;
  `,
  user_review_select:`
    SELECT * FROM user_review;
  `,
  user_review_insert:`
    INSERT INTO user_review (username, score, comment, date, buyer_username) values (?,?,?,?,?);
  `,
  user_review_delete:`
    DELETE FROM user_review WHERE _id = (?);
  `    
};

module.exports = QUERY;