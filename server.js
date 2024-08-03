import express from 'express';
import { client } from './config.js';
import { EmployerRoute } from './controllers/employerController.js';
import { EmployeeRoute } from './controllers/employeeController.js';
import { jobRoute } from './controllers/jobController.js';
import { applicationRoute } from './controllers/applicationController.js';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import expressListEndpoints from 'express-list-endpoints';

client.connect();

const PORT = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(session({
  secret: 'secret',
  cookie: { maxAge: 3000000 },
  resave: false,
  saveUninitialized: false
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

app.use((req, res, next) => {
  console.log(`Request URL: ${req.url}`);
  if (req.url.includes('html')) {
    console.log('Blocked request to /html/*');
    res.status(403).send('Access forbidden');
  } else if (req.url.includes('css')) {
    console.log('Blocked request to /css/*');
    res.status(403).send('Access forbidden');
  } else if (req.url.includes('js')) {
    console.log('Blocked request to /js/*');
    res.status(403).send('Access forbidden');
  } else{
    next();
  }
});

app.get("/", (req, res) => {
  if(req.session.authenticated){
    res.sendFile(path.join(__dirname, 'static','html', 'dashboard.html'));
  }
  else {
    res.sendFile(path.join(__dirname, 'static','html', 'index.html'));
  }
});

app.get("/logout", (req, res) => {
  req.session.authenticated = false;
  res.sendFile(path.join(__dirname, 'static','html', 'index.html'));
});

app.get("/dashboard", (req, res) => {
  if(!req.session.authenticated){
    res.sendFile(path.join(__dirname, 'static','html', 'index.html'));
  }
  else{
    res.sendFile(path.join(__dirname, 'static','html', 'dashboard.html'));
  }
});

EmployeeRoute(app);
EmployerRoute(app);
jobRoute(app);
applicationRoute(app);

app.listen(PORT, () => {
  console.log(`Running on port: ${PORT}`);
});

console.log(expressListEndpoints(app));