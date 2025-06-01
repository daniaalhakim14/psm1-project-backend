const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const signUp = async (req, res) => {
  const { password, email, firstName, lastName, dob, gender, address, phoneNumber } = req.body;

  try {
    const client = await pool.connect();
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await client.query(
      `INSERT INTO users (password, email, first_name, last_name, dob, gender, address, phonenumber)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [hashedPassword, email, firstName, lastName, dob, gender, address, phoneNumber]
    );
    client.release();

    res.status(201).json({ message: 'User created successfully', user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0)
      return res.status(400).json({ message: 'User not found' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ userid: user.userid, email: user.email }, process.env.JWT_SECRET, {});

    res.status(200).json({ message: 'Login success', token });
    client.release();
  } catch (err) {
    console.error("❌ Login error:", err); // Add this
    res.status(500).json({ message: 'Login failed', error: err });
  }
};

const fetchUserDetails = async (req, res) => {
  const userId = req.user.userid; // from decoded JWT

  try {
    const client = await pool.connect();
    const result = await client.query(
      `SELECT userid, first_name, last_name, email, password, phonenumber, gender, dob, address, usertype, created_at, image 
   FROM users 
   WHERE userid = $1`,
      [userId]
    );


    if (result.rows.length === 0)
      return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user: result.rows[0] });
    client.release();
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user details', error: err });
  }
}


module.exports = { signUp, login, fetchUserDetails };
