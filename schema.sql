DROP DATABASE IF EXISTS podstar;

CREATE DATABASE podstar;

USE podstar;

CREATE TABLE users (
  id int NOT NULL AUTO_INCREMENT,
  username varchar(20) NOT NULL,
  password varchar(20) NOT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE shows (
  id int NOT NULL AUTO_INCREMENT,
  itunesId varchar(20) NOT NULL,
  PRIMARY KEY (ID)
);

CREATE TABLE comments (
  id int NOT NULL AUTO_INCREMENT,
  text varchar(300) NOT NULL,
  user_id INT NOT NULL,
  show_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (show_id) REFERENCES shows (id)
);

CREATE TABLE shows_users (
  id INT AUTO_INCREMENT,
  user_id INT NOT NULL,
  show_id INT NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (show_id) REFERENCES shows (id)
);

/*
 * SOME SAMPLE STARTER DATA
*/


INSERT INTO shows (itunesId) VALUES ('woohoo!');
INSERT INTO users (username, password) VALUES ('test', 'test');
INSERT INTO comments (text, user_id, show_id) VALUES ('I liked this', 1, 1);
INSERT INTO shows_users (user_id, show_id) VALUES (1,1);

/*  Execute this file from the command line by typing:
 *    mysql -u root < server/schema.sql
 *  to create the database and the tables.*/
