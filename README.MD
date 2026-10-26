# This Repository is in compliance of Integrative Programming Midterm Exam

## Created with Node.js + Express REST API Practical Exam

## General Requirements

- Use Node.js + Express.
- You may use a data.json file as the data source.
- Your API must actually read from and write to data.json.
- Create a simple frontend that communicates with your API using JavaScript fetch().
- Implement INSERT, RETRIEVE, and DELETE only.
- Do not implement UPDATE, PUT, or PATCH.
- Use the following required API structure:
- GET /api/[resource] — retrieve all records
- GET /api/[resource]/:id — retrieve one record by ID
- POST /api/[resource] — insert a new record
- DELETE /api/[resource]/:id — delete a record by ID
- Use appropriate HTTP status codes and return JSON responses.

### The frontend must allow the user to:
- View all records
- View/search for a specific record by ID
- Add a new record
- delete a record

### Install and Run the App

```bash
git clone https://github.com/WhiteBeardddd/MIDTERM-EXAM-Q01-BOQUECOSA-CHARLESBENEDICT.git
cd MIDTERM-EXAM-Q01-BOQUECOSA-CHARLESBENEDICT
npm install
npm run start
```