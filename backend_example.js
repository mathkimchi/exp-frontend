'use strict';


const express = require('express')
const formidable = require('formidable')
const path = require('path')
const fs = require('fs');
var hash = require('object-hash');
const { assert } = require('console');

const app = express()

// This actually interferes with formidable
// // do this to handle the body stuff
// const bodyParser = require('body-parser');
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.get("/", (req, res) => {
    fs.readFile('index.html', (err, data) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });  // set status code and MIME type
        res.write(data);
        res.end();  // end the response
    });

    console.log("Sent html page");
});

app.get("/project-submit", (req, res) => {
    res.redirect("/");

    console.log("got project submit get request");
});

app.post("/project-submit", (req, res) => {
    console.log("Got Message");

    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        // replace space with dash and remove all non-[number, alphabet, and dash] characters
        const project_title_clean = fields["project-title"][0].replace(/\s+/g, '-').replace(/[^0-9a-zA-Z\-]/g, '');

        var schools = [];
        for (let index = 1; true; index++) {
            var school = fields["school-" + index];
            if (school == undefined) {
                break;
            }
            schools.push(school[0]);
        }
        var researchers = [];
        for (let index = 1; true; index++) {
            var researcher_name = fields["researcher-name-" + index];
            var researcher_school = fields["researcher-school-" + index];
            if (researcher_name == undefined) {
                break;
            }
            researchers.push({ "name": researcher_name[0], "school": researcher_school[0] });
        }

        var project_data = {
            "project-title": fields["project-title"][0],
            "project-title-clean": project_title_clean,
            "schools": schools,
            "researchers": researchers,
            "abstract": fields["abstract"][0],
        };

        // really make sure to avoid collision
        // The underscore will mark the split between project title and the extra stuff
        const project_path = path.join(__dirname, 'uploaded_files') + "/" + project_title_clean + "_" + Date.now() + "-" + hash(fields) + "-" + hash(files);
        console.log("project path:");
        console.log(project_path);

        fs.mkdirSync(project_path); // need to create the directory to put in files

        fs.writeFile(project_path + "/fields.json", JSON.stringify(project_data, null, 4), 'utf8', (err) => { });

        console.log(files.poster[0]);
        console.log(files.poster[0].mimetype);

        // save poster
        // ! not sure if it is safe to blindly trust the extension
        fs.writeFile(project_path + "/poster." + files.poster[0].originalFilename.split(".").pop(), fs.readFileSync(files.poster[0].filepath), (err) => { });

        // save paper
        // ! not sure if it is safe to blindly trust the extension
        fs.writeFile(project_path + "/paper." + files.paper[0].originalFilename.split(".").pop(), fs.readFileSync(files.paper[0].filepath), (err) => { });

        // for (const [field_key, field_value] of Object.entries(fields)) {
        //     if (field_key.indexOf("school-") == 0) {
        //         let index = parseInt(field_key.slice("school-".length));

        //         console.log("Index:")
        //         console.log(index)

        //         // just make sure everything is in order
        //         assert(project_data.schools.length + 1 == index); // 1-indexed

        //         project_data.schools.push(field_value[0]);
        //     }
        //     if (field_key.indexOf("researcher-name-") == 0) {
        //         let index = parseInt(field_key.slice("researcher-name-".length));

        //         // just make sure everything is in order
        //         assert(project_data.schools.length + 1 == index); // 1-indexed

        //         project_data.schools.push(field_value[0]);
        //     }
        //     if (field_key.indexOf("researcher-school-") == 0) {
        //         let index = parseInt(field_key.slice("researcher-school-".length));

        //         // just make sure everything is in order
        //         assert(project_data.schools.length + 1 == index); // 1-indexed

        //         project_data.schools.push(field_value[0]);
        //     }

        //     console.log("Field key:");
        //     console.log(field_key);
        //     console.log("Field value:");
        //     console.log(field_value);
        // }

        // for (const file of Object.values(files)) {
        //     console.log("File:");
        //     console.log(file);
        // }

        // var oldpath = files.filetoupload.filepath;
        // var newpath = path.join(__dirname, 'uploaded_files'); + files.filetoupload.originalFilename;
        // fs.rename(oldpath, newpath, function (err) {
        //     if (err) throw err;
        //     res.write('File uploaded and moved!');
        //     res.end();
        // });

        // console.log("Project path:");
        // console.log(project_path);
        // console.log("Fields:");
        // console.log(fields);
        // console.log("Files:");
        // console.log(files);
        // console.log("Poster:");
        // console.log(files.poster);
        console.log(project_data);
    });

    // console.log("Form:");
    // console.log(form);
});

app.listen(5624, () => {
    console.log('Server running on http://127.0.0.1:5624');
});
