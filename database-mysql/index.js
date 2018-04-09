const mysql = require('mysql');
const bcrypt = require('bcrypt-nodejs');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'podstar',
});

// Factored out here to for less repetition
const standardDBCall = (query, callback) => {
  connection.query(query, (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(err, data);
    }
  });
};

// /////////////////USERS\\\\\\\\\\\\\\\\\\\\\\\\\\

module.exports.createUser = (username, password, callback) => {
  function insertUser(callback2) {
    const insertQuery = `INSERT INTO USERS (username, password) VALUES ('${username}', '${bcrypt.hashSync(password)}')`;

    standardDBCall(insertQuery, callback2);
  }

  const checkForExisting = `SELECT id FROM users WHERE username = '${username}'`;
  connection.query(checkForExisting, (err, data) => {
    if (err) {
      callback(err);
    } else if (data.length) {
      callback(true);
    } else {
      insertUser(callback);
    }
  });
};

module.exports.login = (username, password, callback) => {
  const query = `SELECT id, password FROM users WHERE username = '${username}'`;

  connection.query(query, (err, data) => {
    if (err) {
      callback(err);
    } else if (!data.length) {
      callback('ERROR: username does not exist');
    } else if (bcrypt.compareSync(password, data[0].password)) {
      callback(null, data[0].id);
    } else {
      callback('ERROR: username and password do not match');
    }
  });
};

// /////////////////SHOWS\\\\\\\\\\\\\\\\\\\\\\\\\\

module.exports.selectAllUserShows = (user, callback) => {
  // all shows that a user has connected with
  const showsForUser = 'SELECT shows.* FROM shows ' +
    'INNER JOIN shows_users ON shows.id = shows_users.show_id ' +
    `WHERE '${user}' = shows_users.user_id`;

  standardDBCall(showsForUser, callback);
};

function checkDBForShow(show, callback) {
  // check for show in db by title
  const checkForShow = `SELECT id FROM shows WHERE '${show.title}' = title`;

  connection.query(checkForShow, (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(null, !!data.length);
    }
  });
}

function addShow(show, callback) {
  // add show from search data
  const query = 'INSERT INTO shows ' +
    '(title, maker, itunesUrl, littleImg, bigImg, latestRelease, trackCount, genre) ' +
    `VALUES ('${show.title}','${show.maker}','${show.itunesUrl}','${show.littleImg}','${show.bigImg}','${show.latestRelease}','${show.trackCount}','${show.genre}')`;

  standardDBCall(query, callback);
}

function checkForConnection(user, show, callback) {
  // show user entry on intersection table
  const checkConnection = 'SELECT shows_users.id FROM shows_users ' +
    'INNER JOIN shows ON shows.id = shows_users.show_id ' +
    `WHERE shows_users.user_id = ${user} AND shows.title = '${show.title}'`;

  connection.query(checkConnection, (err, data) => {
    if (err) {
      callback(err);
    } else {
      callback(err, !!data.length); // coerce to bool
    }
  });
}

// WELCOME TO HELL
module.exports.addShowToUser = (user, show, callback) => {
  console.log('user', user);
  function makeConection() {
    // add show - user to intersection table
    const connectShowUser = 'INSERT INTO shows_users (user_id, show_id) ' +
      `VALUES (${user}, ` +
      `(SELECT id FROM shows WHERE title = '${show.title}'))`;

    standardDBCall(connectShowUser, callback);
  }
  // makes connection between user and show. adds show to database if needed
  // doesn't make duplicate connections
  checkDBForShow(show, (err, showFound) => {
    if (err) {
      callback(err);
    } else if (!showFound) {
      // show has never been added to db
      addShow(show, (err2) => {
        if (err2) {
          callback(err2);
        } else {
          // make user-show connection
          makeConection(callback);
        }
      });
    } else {
      checkForConnection(user, show, (err3, connFound) => {
        if (err3) {
          callback(err3);
        } else if (!connFound) {
          makeConection(callback);
        }
      });
    }
  });
};

// /////////////////COMMENTS\\\\\\\\\\\\\\\\\\\\\\\\\\


module.exports.addComment = (userID, showID, comment, callback) => {
  // add a comment by a user to a show
  const query = 'INSERT INTO comments (user_id, show_id, text) ' +
    `VALUES ('${userID}', '${showID}', '${comment}')`;

  standardDBCall(query, callback);
};

module.exports.getCommentsUser = (userID, callback) => {
  // all comments by a user
  const query = 'SELECT text, show_id FROM comments ' +
    `WHERE ${userID} = comments.user_id;`;

  standardDBCall(query, callback);
};

module.exports.getCommentsAll = (showID, callback) => {
  // all comments on a show
  const query = 'SELECT comments.text, users.username FROM comments ' +
  'INNER JOIN users ON users.id = comments.user_id ' +
  `WHERE comments.show_id = ${showID};`;

  standardDBCall(query, callback);
};

// /////////////////POPULARITY\\\\\\\\\\\\\\\\\\\\\\\\\\
function synthesizeUsers(comments, shows) {
  const userActivity = {};
  for (const show of shows) {
    if (!userActivity[show.username]) {
      userActivity[show.username] = { connections: 0, comments: 0 };
    }
    userActivity[show.username].connections++;
  }
  for (const comment of comments) {
    if (!userActivity[comment.username]) {
      userActivity[comment.username] = { connections: 0, comments: 0 };
    }
    userActivity[comment.username].comments++;
  }
  return userActivity;
}

function synthesizeShows(comments, connections) {
  const showActivity = {};
  for (const connection of connections) {
    if (!showActivity[connection.title]) {
      showActivity[connection.title] = { connections: 0, comments: 0 };
    }
    showActivity[connection.title].connections++;
  }
  for (const comment of comments) {
    if (!showActivity[comment.title]) {
      showActivity[comment.title] = { connections: 0, comments: 0 };
    }
    showActivity[comment.title].comments++;
  }
  return showActivity;
}

module.exports.getUserActivity = (callback) => {
  const getComments = 'SELECT users.username, comments.id AS "comments" FROM users INNER JOIN comments ON users.id = comments.user_id;';

  connection.query(getComments, (err, data) => {
    if (err) {
      callback(err);
    } else {
      const comments = data;
      const showConnections = 'SELECT users.username, shows_users.id AS "shows" FROM users INNER JOIN shows_users ON users.id = shows_users.user_id;';

      connection.query(showConnections, (err2, data) => {
        if (err2) {
          console.log('err');
          callback(err2);
        } else {
          const shows = data;
          const processedData = synthesizeUsers(comments, shows);
          callback(null, processedData);
        }
      });
    }
  });
};

module.exports.getShowActivity = (callback) => {
  const getComments = 'SELECT shows.title, comments.id AS "comments" FROM shows LEFT OUTER JOIN comments ON shows.id = comments.show_id;';

  connection.query(getComments, (err, data) => {
    if (err) {
      callback(err);
    } else {
      const comments = data;

      const showConnections = 'SELECT shows.title, shows.id AS "shows" FROM shows LEFT OUTER JOIN shows_users ON shows.id = shows_users.show_id;';

      connection.query(showConnections, (err, data) => {
        if (err) {
          callback(err);
        } else {
          const connections = data;
          const processedData = synthesizeShows(comments, connections);
          callback(null, processedData);
        }
      });
    }
  });
};

// DATA STRUCTURE FOR SHOWS
/*
{
  "title": "Reply All",
  "maker": "Gimlet",
  "itunesUrl": "https://itunes.apple.com/us/podcast/reply-all/id941907967?mt=2&uo=4",
  "littleImg": "http://is1.mzstatic.com/image/thumb/Music128/v4/22/0d/f6/220df688-843f-264a-b67e-28644b73c129/source/30x30bb.jpg",
  "bigImg": "http://is1.mzstatic.com/image/thumb/Music128/v4/22/0d/f6/220df688-843f-264a-b67e-28644b73c129/source/60x60bb.jpg",
  "latestRelease": "2018-02-15T11:00:00Z",
  "trackCount": 135,
  "genre": "Technology"
}
*/
