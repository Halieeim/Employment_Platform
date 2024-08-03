import { client, containsAlphabet } from "../config.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export var passedData = {};

// API to register new employer
export const applicationRoute = (app) => {
  app.post("/applytojob", (req, res) => {
    const { mobile, email, motivation_letter } = req.body;
    const { company, job_id } = passedData;
    client.query(
      'INSERT INTO employee_application (national_id, job_id, company, mobile, email, motivation_letter) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.session.nationalID, job_id, company, mobile, email, motivation_letter],
      (err, result) => {
        if(err){
          console.log(err);
          res.writeHead(500);
          res.end('Error submiting you application. Please, check your data and try again!');
        }
        else{
          res.send(`Your application has been submitted successfully!!!`);
        }
      }
    )
  });

  app.get("/applicationform", (req, res) => {
    if(req.session.authenticated && req.session.role === "Employee"){
      res.sendFile(path.join(__dirname, '..', 'static', 'html', 'applicationform.html'));
    } else {
      res.status(403).send("You are not authenticated. Log In as an Employee and try again.");
    }
  });

  app.post("/passdata", (req, res) => {
    if(req.session.authenticated) {
      passedData = req.body;
      console.log(passedData);
      res.send("Data are recieved");
    }
    else {
      res.send("You are not authenticated, Log In and try again.");
    }
  });
};