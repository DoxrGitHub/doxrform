const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const fs = require('fs')
const cookieParser = require('cookie-parser')
const encrypt = require('crypto-js/sha256')

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(cookieParser());

function getRandomID() {
  return Math.floor(Math.random() * 10000000) +'';
}

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/submitted', (req, res) => {
  res.sendFile(__dirname + '/public/sucess.html');
});

app.get('/read', (req, res) => {
  if (req.cookies.admin === 'authorized') {
  fs.readFile('responses.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('An error occurred');
    }
    res.setHeader('Content-Type', 'application/json');
    if (data.trim() !== '') {
      try {
        const jsonData = JSON.parse(data);
        res.send(JSON.stringify(jsonData, null, 2));
      } catch (parseErr) {
        console.error(parseErr);
        res.status(500).send('Invalid JSON content');
      }
    } else {
      res.send('Response.JSON is empty or contains only whitespace.')
    }
  });
  } else {
    res.send('Unauthorized reading');
  }
});

app.get('/clear', (req, res) => {
  if (req.cookies.admin === 'authorized') {
  fs.writeFile('responses.json', '[]', (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('An error occurred while clearing the responses');
    }
    res.send('All responses have been cleared');
  });
  } else {
    res.send('Unauthorized clearing');
  }
});
        
app.post('/submit', async (req, res) => {
  let mess = {
    "name": req.body.name,
    "contact": req.body.contact,
    "message": req.body.text,
    "id": getRandomID()
  };

  if (mess.name.length > 20 || mess.contact.length > 30 || mess.message.length > 350) {
    return res.status(400).send('Invalid name or contact');
  }

  fs.readFile('responses.json', 'utf8', function (err, data) {
    if (err && err.code === 'ENOENT') {
      data = '[]';
    } else if (err) {
      console.error(err + ' (response not stored)');
      return res.status(500).send('An error occurred');
    }
    let responses = data.trim() ? JSON.parse(data) : [];
    responses.push(mess);
    fs.writeFile('responses.json', JSON.stringify(responses, null, 2), function (err) {
      if (err) {
        console.error(err + ' (response not stored)');
        return res.status(500).send('An error occurred');
      }
      console.log('response stored');
      res.send('we got a response');
    });
  });
});

app.get('/delete', (req, res) => {
  if (req.cookies.admin === 'authorized') {
  const idToDelete = req.query.id;
  fs.readFile('responses.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send('An error occurred');
    }
    let responses = JSON.parse(data);
    const filteredResponses = responses.filter(response => response.id !== idToDelete);
    fs.writeFile('responses.json', JSON.stringify(filteredResponses, null, 2), (writeErr) => {
      if (writeErr) {
        console.error(writeErr);
        return res.status(500).send('An error occurred');
      }
      res.send(`Response with ID ${idToDelete} has been deleted`);
    });
  });
  } else {
    res.send('Unauthorized deleting');
  }
});

app.get('/admin', (req, res) => {
  if (req.cookies.admin === 'authorized') {
    res.sendFile(__dirname + '/adminui/index.html');
  } else {
    res.redirect('/login')
  }
});

app.get('/login', (req, res) => {
  if (req.query.password !== process.env.admin) {
    if (req.query.password !== process.env.admin) {
      res.json({ error: 'Please put in a password by appending ?password=[your password] to the URL. If the password is correct, you will be allowed to go in /admin. If not, you are restricted from the admin panel.' })
    } else {
      res.json({ error: 'Password is incorrect. You are not permitted to use the AdminUI. You can try again.' })
    }
  } else {
    const cookieOptions = {
       expires: new Date(Date.now() + 12096e5)
    };
    res.cookie('admin', 'authorized')
    res.redirect('/admin')
  }
})

app.listen(port, () => {
  console.log(`Doxrform listening at 0.0.0.0:${port}`);
});