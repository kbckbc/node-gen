const QUERY = {
  // TABLE: item
  Item_create: `
    CREATE TABLE Item
    (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      title          TEXT  NOT NULL,
      status         TEXT,
      price          INTEGER,
      myschool       TEXT NOT NULL,
      location       TEXT NOT NULL,
      description    TEXT NOT NULL,
      image_names    TEXT NOT NULL,
      username       TEXT NOT NULL,
      date           INTEGER,
      favorite       INTEGER,
      buyer_username TEXT NOT NULL
    );
  `,
  Item_drop: `
    DROP TABLE Item;
  `,
  // SELECT * FROM Item;
  //SELECT * FROM Item LIMIT IFNULL(?,0), IFNULL(?,99999);
  Item_select:`
    SELECT * FROM Item where myschool = IFNULL(?, myschool) LIMIT IFNULL(?,0), IFNULL(?,99999);
  `,
  Item_select_one:`
    SELECT * FROM Item where _id = ?;
  `,
  Item_select_one_which_I_bought:`
    SELECT * FROM Item where username = ? AND buyer_username = ?;
  `,    
  Item_insert:`
    INSERT INTO Item (title, status, price, myschool, location, description, image_names, username, date, favorite, buyer_username) values (?,?,?,?,?,?,?,?,?,?,?);
  `,
  Item_delete:`
    DELETE FROM Item WHERE _id = (?);
  `,
  Item_update:`
    UPDATE Item SET title = ?, status = ?, price = ?, location = ?, description = ?, image_names = ?, date = ?, buyer_username = ? WHERE _id = ?;
  `,
  Item_inc_favorite:`
    UPDATE Item SET favorite = favorite + 1 WHERE _id = ?;
  `,  
  Item_dec_favorite:`
    UPDATE Item SET favorite = favorite - 1 WHERE _id = ?;
  `,  
  // TABLE: item_comment
  ItemComment_create: `
    CREATE TABLE ItemComment
    (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_id  INTEGER,
      comment  TEXT NOT NULL,
      status   INTEGER,
      date     INTEGER,
      username TEXT NOT NULL
    );
  `,
  ItemComment_drop: `
    DROP TABLE ItemComment;
  `,
  ItemComment_select:`
    SELECT * FROM ItemComment where item_id = ?;
  `,
  ItemComment_insert:`
    INSERT INTO ItemComment (item_id, comment, status, date, username) values (?,?,?,?,?);
  `,
  ItemComment_delete:`
    DELETE FROM ItemComment WHERE _id = (?);
  `,
  // TABLE: user
  User_create: `
    CREATE TABLE User
    (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      username  TEXT UNIQUE,
      password  TEXT NOT NULL,
      email     TEXT NOT NULL,
      myschool  TEXT NOT NULL,
      joindate  INTEGER
    );
  `,
  User_drop: `
    DROP TABLE User;
  `,
  User_select:`
    SELECT * FROM User where username = IFNULL(?, username);
  `,
  User_insert:`
    INSERT INTO User (username, password, email, myschool, joindate) values (?,?,?,?,?);
  `,
  // UPDATE User SET password = IFNULL(?, password), myschool = IFNULL(?, myschool) WHERE username = IFNULL(?, username);
  User_update_passwd:`
    UPDATE User SET password = IIF(LENGTH(?)==0, password,?) WHERE username = ?;
  `,
  User_update_school:`
    UPDATE User SET myschool = ? WHERE username = ?;
  `,  
  User_delete:`
    DELETE FROM User WHERE _id = ?;
  `,
  // TABLE: user_review
  UserReview_create: `
    CREATE TABLE UserReview
    (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      username   TEXT NOT NULL,
      score      INTEGER,
      comment    TEXT NOT NULL,
      date       INTEGER,
      buyer_username  TEXT NOT NULL
    );
  `,
  UserReview_drop: `
    DROP TABLE UserReview;
  `,
  UserReview_select:`
    SELECT * FROM UserReview WHERE username = ?;
  `,
  UserReview_insert:`
    INSERT INTO UserReview (username, score, comment, date, buyer_username) values (?,?,?,?,?);
  `,
  UserReview_delete:`
    DELETE FROM UserReview WHERE _id = ?;
  `,
  // TABLE: Favorite
  Favorite_create: `
    CREATE TABLE Favorite
    (
      _id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      item_id  INTEGER NOT NULL,
      date     INTEGER
    );
  `,
  Favorite_drop: `
    DROP TABLE Favorite;
  `,
  Favorite_select:`
    SELECT * FROM Favorite WHERE username = ? and item_id = ?;
  `,
  Favorite_select_item_list:`
    SELECT b.* FROM Favorite a, Item b WHERE a.item_id = b._id AND a.username = ?;
  `,
  Favorite_insert:`
    INSERT INTO Favorite (username, item_id, date) VALUES (?,?,?);
  `,
  Favorite_delete:`
    DELETE FROM Favorite WHERE username = ? and item_id = ?;
  `     
};

module.exports = QUERY;