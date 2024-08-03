import { client, containsAlphabet } from "../config.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API to register new employer
export const EmployerRoute = (app) => {
  app.get("/employer/:employer_national_id", (req, res) => {
    const { employer_national_id } = req.params; 
    client.query(
        'SELECT * FROM employer WHERE national_id = $1', 
        [employer_national_id], 
        (err, result) => {
            if (err) {
                console.error(err); 
                res.status(500).send("Something went wrong!");
            }
            else if (result.rows.length === 0) {
                res.status(404).send("Employer not found");
            }
            else {
              res.json(result.rows);
            }
        }
    );
  });

  app.get("/employer-signup", (req, res) => {
    if(req.session.authenticated){
      res.send("You are alread signed in. Log out first and then try again.");
    } else {
      res.sendFile(path.join(__dirname, '..', 'static', 'html', 'employer-signup.html'));
    }
  });

  app.post("/registeremployer", (req, res) => {
    const { national_id, name, city, email, company, experience_level } = req.body;
    if(national_id.length != 14 || containsAlphabet(national_id)){
        res.writeHead(500);
        res.end("Please enter a vaild national id...");
        return;
    }
    client.query(
      'INSERT INTO employer (national_id, name, city, email, company, experience_level) VALUES ($1, $2, $3, $4, $5, $6)',
      [national_id, name, city, email, company, experience_level],
      (err, result) => {
        if(err){
          console.log(req.body);
          res.writeHead(500);
          res.end('Error registering employer');
        }
        else{
          res.send(`Employer: ${name} has been registered successfully!!!`);
        }
      }
    )
  });

  app.get("/signinemployer", (req, res) => {
    if(req.session.authenticated) {
      res.send("You are logged in. Log Out first.")
    }
    else {
      res.sendFile(path.join(__dirname, '..', 'static', 'html', 'employer-signin.html'));
    }
  });

  app.get("/signupemployer", (req, res) => {
    if(req.session.authenticated) {
      res.send("You are logged in. Log Out first.")
    }
    else {
      res.sendFile(path.join(__dirname, '..', 'static','html', 'employer-signup.html'));
    }
  });

  app.get("/applicantspage", (req, res) => {
    if(req.session.authenticated && req.session.role === "Employer"){
      res.sendFile(path.join(__dirname, '..', 'static', 'html', 'applicantspage.html'));
    } else {
      res.status(403).send("You are not authernticated. Log In as an Employer and try again.");
    }
  });

  app.get("/getapplicants", (req, res) => {
    if(req.session.authenticated && req.session.role === "Employer"){
      client.query(
        `SELECT 
                j.title AS job_title, 
                j.company, 
                j.location,
                a.job_id, 
                a.mobile, 
                a.email, 
                a.motivation_letter, 
                a.status,
                a.national_id
            FROM 
                job j 
            INNER JOIN 
                employee_application a ON j.id = a.job_id
            WHERE 
                j.employer_national_id = $1
            ORDER BY j.title`,
        [ req.session.nationalID ],
        (err, result) => {
          if(err){
            console.error("Error: ", err);
            res.status(500).send("Failed to load your applicants data. check your request and try again.");
          }
          else{
            res.json(result.rows);
          }
        }
      )
    } else {
      res.status(403).send("You are not authernticated. Log In as an Employer and try again.");
    }
  });

  app.put("/updatestatus", (req, res) => {
    if(req.session.authenticated && req.session.role === "Employer"){
      const { job_id, national_id, status } = req.body;
      client.query(
        `UPDATE employee_application SET status = $1 WHERE job_id = $2 AND national_id = $3`,
        [ status, job_id, national_id ],
        (err, result) => {
          if(err) {
            console.error("Error updating application status: ", err);
            res.status(500).send("Failed updating application status");
          }
          else {
            res.send("Update application status successfully!!!");
          }
        }
      )
    } else {
      res.status(403).send("You are not authenticated. Log In as an Employer and try again.");
    }
  });

  app.get("/getallemployees", (req, res) => {
    if(req.session.authenticated && req.session.role === "Employer"){
      client.query(
        `SELECT * FROM employee`, [], 
        (err, result) => {
          if(err){
            console.error("Error: ", err);
            res.status(500).send("Failed getting employees data");
          } else {
            res.json(result.rows);
          }
        }
      )
    } else {
      res.status(403).send("You are not authenticated. Log In as an Employer and try again.");
    }
  });

  app.get("/showemployees", (req, res) => {
    if(req.session.authenticated && req.session.role === "Employer"){
      res.sendFile(path.join(__dirname, '..', 'static', 'html', 'displayemployees.html'));
    } else {
      res.status(403).send("You are not authenticated. Log In as an Employer and try again");
    }
  });

  app.post("/searchemployees", (req, res) => {
    if(req.session.authenticated && req.session.role === "Employer") {
      const { location, experience_level } = req.body;
      let query = 'SELECT * FROM employee WHERE 1=1';
      const params = [];
      let paramIndex = 1;

      if (location) {
        query += ` AND city ILIKE $${paramIndex++}`;
        params.push(`%${location}%`);
      }
      if (experience_level) {
        query += ` AND experience_level ILIKE $${paramIndex++}`;
        params.push(`%${experience_level}%`);
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
      res.send("You are not authenticated, Log In as an Employer and try again.");
    }
  });
}