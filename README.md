# DoxrForm Software

A completely open source form software, and the simplest you'll find out here. It uses a JSON database file (as well as a banned.txt file), so you don't have to do anything like set up a more complicated database.

### REQUIREMENTS:
- Persistent File Storage (files should not clear after running or after shutdown, important because you don't want the database to randomly disappear)
- Re

To set up:

- Set up an environment variable for `admin` (value should be the password)
- Modify `public/index.html` and change this line: `<h1>Contact Doxr</h1>` to whatever you want.


Build it:

- Run `npm install` after cloning this.

Run it: `node index.js`

---

Find responses at `/admin` and append `?password=` with your admin password to /login if you are redirected there (so it might look like `http://localhost:3000/login?password=AdminPasswordHere`)

You now have a nice admin panel.

Made by doxr.