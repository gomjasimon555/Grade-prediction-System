const express = require('express');
const app = express();
const bcrypt = require('bcrypt');
const mysql = require('mysql2');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');
const LocalStrategy = require('passport-local').Strategy



// Load environment variables from .env file in development
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Dummy users array for demo purposes
const users = [];

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
// app.set('views', path.join(__dirname, 'views'));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
// app.use(express.static(path.join(__dirname,'weblab')));



// Route: Dashboard
app.get('/dashboard', checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'weblab', 'index'));
});


// Create MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'login'
});

// Connect to MySQL database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');
});

// Create the loginform table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS loginform (
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
  )`;

connection.query(createTableQuery, (err, result) => {
  if (err) throw err;
  console.log('loginform table created or already exists');
});


// Middleware: Check if the user is already authenticated
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}

// Middleware: Check if the user is not authenticated
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }

  next();
}


// Configure Passport.js to use a local strategy for authentication
passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  connection.query('SELECT * FROM loginform WHERE email = ?', [email], async (error, results) => {
    if (error) {
      return done(error);
    }

    if (results.length === 0) {
      return done(null, false, { message: 'Invalid email or password' });
    }

    const user = results[0];

    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password' });
      }
    } catch (error) {
      return done(error);
    }
  });
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser((email,done) => {
  connection.query('SELECT * FROM loginform WHERE email = ?', [email], (error, results) => {
    if (error) {
      return done(error);
    }

    if (results.length === 0) {
      return done(new Error('User not found'));
    }

    const user = results[0];
    done(null, user);
  });
});
// Route: Dashboard
app.get('/dashboard', checkAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'weblab', 'index.html'));
});




app.get('/login',checkNotAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'ui.html'));
});
// Routes
// Route: Authenticate user
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true
}));



// Create the students table if it doesn't exist
const createTableSql = `
  CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(250) NOT NULL,
    address VARCHAR(250) NOT NULL,
    email VARCHAR(250) NOT NULL,
    rollno VARCHAR(250) NOT NULL,
    phone VARCHAR(250) NOT NULL
  )`;

connection.query(createTableSql, (err, result) => {
  if (err) throw err;
  console.log('students table created or already exists');
});

app.post('/addEmployee', (req, res) => {
  const { name, address, email, rollno, phone } = req.body;
  const insertQuery = 'INSERT INTO students (name, address, email, rollno, phone) VALUES (?, ?, ?, ?, ?)';

  connection.query(insertQuery, [name, address, email, rollno, phone], (error, results) => {
    if (error) {
      console.error('Error inserting data:', error);
      res.status(500).json({ error: 'Failed to insert data into the database' });
    } else {
      const selectQuery = 'SELECT * FROM students';

      connection.query(selectQuery, (error, results) => {
        if (error) {
          console.error('Error retrieving data:', error);
          res.status(500).json({ error: 'Failed to retrieve data from the database' });
        } else {
          res.render('table', { data: results });
        }
      });
    }
  });
});

app.get('/students', (req, res) => {
  const selectQuery = 'SELECT * FROM students';

  connection.query(selectQuery, (error, results) => {
    if (error) {
      console.error('Error fetching student data:', error);
      res.status(500).json({ error: 'Failed to fetch student data from the database' });
    } else {
      res.status(200).json(results);
    }
  });
});

// GET route to fetch a specific student by ID
app.get('/edit/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  const selectQuery = 'SELECT * FROM students WHERE id = ?';

  connection.query(selectQuery, [studentId], (error, results) => {
    if (error) {
      console.error('Error fetching student data:', error);
      res.status(500).json({ error: 'Failed to fetch student data from the database' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ error: 'Student not found' });
      } else {
        res.status(200).json(results[0]);
      }
    }
  });
});



app.post('/register', checkNotAuthenticated,(req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = 'INSERT INTO loginform (name, email, password) VALUES (?, ?, ?)';
  connection.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error inserting data into MySQL database');
    }

    console.log('Data inserted successfully:', result);
    res.send('Data inserted successfully');
  });
});

app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login');
});



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


