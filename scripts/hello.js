const token = "eyJ1c2VySWQiOiI2YWNiNDUwOGRjY2Q1YWU2M2NjNmE4MjQiLCJlbWFpbCI6ImphdmVlZHNoYWlrNzM0NkBnbWFpbC5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc5MTc5MjU3MCwiZXhwIjoxNzkyMzk3MzcwfQ";

const jsonText = Buffer.from(token, 'base64url').toString('utf-8');

const data = JSON.parse(jsonText);

console.log(data);
console.log(data.role);