/** User class for message.ly */

const db = require('../db');

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const result = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING username, password, first_name, last_name, phone`,
      [username, password, first_name, last_name, phone]
    );
    return result.rows[0];
  }
  

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    const result = await db.query(
      `SELECT username
         FROM users
         WHERE username=$1 AND password=$2`,
      [username, password]
    );
    return result.rows.length > 0;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    await db.query(
      `UPDATE users
         SET last_login_at=CURRENT_TIMESTAMP
         WHERE username=$1`,
      [username]
    );
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const results = await db.query(
      `SELECT username, first_name, last_name, phone
         FROM users`
    );
    return results.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) { 
    const result = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
         FROM users
         WHERE username=$1`,
      [username]
    );
    return result.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
        `SELECT m.id, m.body, m.sent_at, m.read_at, 
                u.username as to_username, u.first_name as to_first_name, u.last_name as to_last_name, u.phone as to_phone
         FROM messages m
           JOIN users u ON m.to_username = u.username
         WHERE m.from_username = $1`,
        [username]
    );
    return results.rows.map(row => ({
        id: row.id,
        body: row.body,
        sent_at: row.sent_at,
        read_at: row.read_at,
        to_user: {
            username: row.to_username,
            first_name: row.to_first_name,
            last_name: row.to_last_name,
            phone: row.to_phone
        }
    }));
}


  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(
        `SELECT m.id, m.body, m.sent_at, m.read_at, 
                u.username as from_username, u.first_name as from_first_name, u.last_name as from_last_name, u.phone as from_phone
         FROM messages m
           JOIN users u ON m.from_username = u.username
         WHERE m.to_username = $1`,
        [username]
    );
    return results.rows.map(row => ({
        id: row.id,
        body: row.body,
        sent_at: row.sent_at,
        read_at: row.read_at,
        from_user: {
            username: row.from_username,
            first_name: row.from_first_name,
            last_name: row.from_last_name,
            phone: row.from_phone
        }
    }));
}

}


module.exports = User;