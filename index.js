const express = require('express');
const htmlToDocx = require('html-to-docx');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

app.post('/convert', async (req, res) => {
  try {
    const { html } = req.body;
    if (!html) {
      return res.status(400).send('HTML content is required');
    }

    const docxBuffer = await htmlToDocx(html);

    const filePath = path.join(__dirname, 'output.docx');
    fs.writeFileSync(filePath, docxBuffer);

    res.download(filePath, 'output.docx', (err) => {
      if (err) {
        console.log(err);
      }
      // Delete the file after sending it
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
