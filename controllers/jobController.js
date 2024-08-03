import { client, containsAlphabet } from "../config.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// API to register new employer
export const jobRoute = (app) => {
  app.post("/postnewjob", (req, res) => {
    if (!req.session.authenticated || req.session.role != "Employer"){
      res.status(403).send("You are not authenticated to do this actions. Log In as an Employer and try again!!!");
      return;
    }
    const { title, location, experience_level, company, description } = req.body;
    // if(employer_national_id.length != 14 || containsAlphabet(employer_national_id)){
    //     res.writeHead(501);
    //     res.end("Please enter a vaild national id...");
    //     return;
    // }
    client.query(
      'INSERT INTO job (title, location, experience_level, employer_national_id, company, description) VALUES ($1, $2, $3, $4, $5, $6)',
      [title, location, experience_level, req.session.nationalID,  company, description],
      (err, result) => {
        if(err){
          console.log(req.body);
          res.writeHead(500);
          res.end('Error posting a job');
        }
        else{
          res.send(`A job with title: "${title}" has been posted successfully!!!`);
        }
      }
    )
  });

  app.get("/getposts", (req, res) => {
    if(req.session.authenticated) {
      client.query('SELECT * FROM job',[], (err, result) => {
        if(err){
          console.log(req.body);
          res.writeHead(500);
          res.end('Error getting job posts');
        }
        else{
          res.json(result.rows);
        }
      })
    }
    else {
      res.send("You are not authenticated, Log In first.");
    }
  });

  app.post("/search", (req, res) => {
    if(req.session.authenticated) {
      const { title, location, experience_level, company } = req.body;
      let query = 'SELECT * FROM job WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (title) {
        query += ` AND title ILIKE $${paramIndex++}`;
        params.push(`%${title}%`);
      }
      if (location) {
        query += ` AND location ILIKE $${paramIndex++}`;
        params.push(`%${location}%`);
      }
      if (experience_level) {
        query += ` AND experience_level ILIKE $${paramIndex++}`;
        params.push(`%${experience_level}%`);
      }
      if (company) {
        query += ` AND company ILIKE $${paramIndex++}`;
        params.push(`%${company}%`);
      }

      client.query(query, params, (err, result) => {
        if (err) {
          console.error(err);
          res.writeHead(500);
          res.end('Error filtering job posts');
        } else {
          res.json(result.rows);
        }
      });
    }
    else {
      res.send("You are not authenticated, Log In first.");
    }
  });

  app.get("/postjob", (req, res) => {
    if(req.session.authenticated && req.session.role === "Employer") {
      res.sendFile(path.join(__dirname, '..', 'static', 'html', 'postjob.html'));
    }
    else {
      res.send("You are not authenticated, Log In as an Employer and try again.");
    }
  });

};