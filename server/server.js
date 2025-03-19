const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:5173',
};
const PORT = 8080;

app.use(cors(corsOptions));

app.get("/api", (req, res) => {
  res.json({ "fruits": ["apple", "banana", "orange"] });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


