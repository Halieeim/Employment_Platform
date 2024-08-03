import fetch from "node-fetch";
import { client, containsAlphabet } from "../config.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { passedData } from "./applicationController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// API to register new employee
export const EmployeeRoute = (app) => {
  app.get("/employee/:employee_national_id", (req, res) => {
    const { employee_national_id } = req.params; 
    client.query(
        'SELECT * FROM employee WHERE national_id = $1', 
        [employee_national_id], 
        (err, result) => {
            if (err) {
                console.error(err); 
                res.status(500).send("Something went wrong!");
            }
            else if (result.rows.length === 0) {
                res.status(404).send("Employee not found");
            }
            else {
              res.json(result.rows);
            }
        }
    );
  });

  app.get("/employee-signup", (req, res) => {
    if(req.session.authenticated){
      res.send("You are alread signed in. Log out first and then try again.");
    } else {
      res.sendFile(path.join(__dirname, '..', 'static', 'html', 'employee-signup.html'));
    }
  });

  app.post("/registeremployee", (req, res) => {
    const { national_id, name, city, email, bio, experience_level, languages } = req.body;
  
    if(national_id.length != 14 || containsAlphabet(national_id)){
      res.writeHead(500);
      res.end("Please enter a vaild national id...");
      return;
    }

    client.query(
      'INSERT INTO employee (national_id, name, city, email, bio, experience_level) VALUES ($1, $2, $3, $4, $5, $6)',
      [national_id, name, city, email, bio, experience_level],
      (err, result) => {
        if (err) {
          console.log(req.body);
          // res.writeHead(500);
          res.end('Error registering employee');
        } else {
          let langs = languages.split(',');
          for(let lang of langs){
            client.query('INSERT INTO employees_programming_languages (national_id, programming_language) VALUES ($1, $2)',
              [national_id, lang],
              (err, result) => {
                if(err){
                  res.writeHead(500);
                  res.end('Error registering employee languages');
                }
              }
            )
          }
          res.send(`Employee: ${name} has been added sucessfully!!!`);
        }
      }
    )
  });

  app.post("/authenticate", async (req,res) => {
    const { national_id, role } = req.body;
    if(req.session.authenticated){
      res.json(req.session);
    }
    else{
      let myResponse;
      if(role === "Employee"){
        await fetch(`http://127.0.0.1:8000/employee/${national_id}`).then(response => {
          myResponse = response.ok;
        });
        
      }
      else if(role === "Employer"){
        await fetch(`http://127.0.0.1:8000/employer/${national_id}`).then(response => {
          myResponse = response.ok;
        });
      }
      
      if(myResponse){
        req.session.authenticated = true;
        req.session.role = role;
        req.session.nationalID = national_id;
        res.json(req.session);
      }
      else{
        res.status(200).send(`There is no an ${role} with this national id`);
      }
    }
  });

  app.get("/signinemployee", (req, res) => {
    if(req.session.authenticated) {
      res.send("You are logged in. Log Out first.")
    }
    else {
      res.sendFile(path.join(__dirname, '..', 'static','html', 'employee-signin.html'));
    }
  });
  
  app.get("/signupemployee", (req, res) => {
    if(req.session.authenticated) {
      res.send("You are logged in. Log Out first.")
    }
    else {
      res.sendFile(path.join(__dirname, '..', 'static','html', 'employee-signup.html'));
    }
  });

  app.get("/myprofile", (req, res) => {
    if (req.session.authenticated && req.session.role === "Employee"){
      res.sendFile(path.join(__dirname, '..', 'static', 'html', 'employeeprofile.html'));
    }
    else {
      res.status(403).send("You are not authenticated. Log in as an Employee and try again.");
    }
  });

  app.get("/profile", (req, res) => {
    if (req.session.authenticated && req.session.role === "Employee"){
      client.query(
        'SELECT e1.name, e1.city, e1.email, e1.experience_level, e1.bio, e1.profile_views, STRING_AGG(e2.programming_language, $1) AS programming_languages FROM employee e1 JOIN employees_programming_languages e2 ON e1.national_id = e2.national_id WHERE e1.national_id = $2 GROUP BY e1.name, e1.city, e1.email, e1.experience_level, e1.bio, e1.profile_views',
        [ ', ', req.session.nationalID ],
        (err, result) => {
          if(err){
            console.error('Error:', err);
            res.status(500).send("Could not get employee data!!!");
          }
          else {
            console.log(result.rows);
            res.json(result.rows);
          }
        }
      );
    }
    else {
      res.status(403).send("You are not authenticated. Log in as an Employee and try again.");
    }
  });

  app.get("/applications", (req, res) => {
    if(req.session.authenticated && req.session.role === "Employee"){
      client.query(
        `SELECT * FROM employee_application e JOIN job j ON e.job_id = j.id WHERE e.national_id = $1`,
        [ req.session.nationalID ],
        (err, result) => {
          if (err) {
            res.status(500).send("Could not get your applications...");
            console.log("Error: ", err);
          }
          else {
            res.json(result.rows);
          }
        }
      )
    } else {
      res.status(403).send("You are not authenticated. Log In as an Employee and try again.");
    }
  })

  app.post("/viewemployeeprofile", (req, res) => {
    if(req.session.authenticated && req.session.role === "Employer"){
      const { employee_id } = passedData;
      client.query(
        `SELECT * FROM employee WHERE national_id = $1`, [ employee_id ],
        (err, result) => {
          if(err){
            console.error("Error: ", err);
            res.status(500).send("Failed to load employee data. check your request and try again.");
          }
          else {
            res.json(result.rows);
          }
        }
      )
    } else {
      res.status(403).send("You are not authenticated. Log In as an Employer and try again.");
    }
  });

  app.get("/fetchemployee", (req, res) => {
    if(req.session.authenticated && req.session.role === "Employer"){
      res.sendFile(path.join(__dirname, '..', 'static', 'html', 'dynamicprofile.html'));
    }
    else {
      res.send("You are not authenticated. Log In as an Employer and try again.");
    }
  });

  app.post("/increaseprofileviews", (req, res) => {
    if(req.session.authenticated && req.session.role === "Employer"){
      const { employee_id } = req.body;
      client.query(
        `SELECT profile_views FROM employee WHERE national_id = $1`, [ employee_id ],
        (err, result) => {
          if(err){
            console.error("Error: ", err);
            res.status(500).send("Failed to get the profile_views");
          }
          else if(result.rows.length > 0){
            console.log("profile_views = ", result.rows[0].profile_views);
            const newProfileViews = parseInt(result.rows[0].profile_views, 10) + 1;
            client.query(
              `UPDATE employee SET profile_views = $1 WHERE national_id = $2`,
              [ newProfileViews, employee_id ],
              (err2, result2) => {
                if(err2){
                  console("Error while increase profile views: ", err);
                  res.status(501).send("Failed increasing profile views");
                }
                else {
                  res.send("Profile views increased successfully!!!");
                }
              }
            )
          }
        }
      )
    } else {
      res.status(403).send("You are not authenticated. Log In as an Employer and try again.");
    }
  });
};