const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '150mb' }));

// Serve static files from the "out_images" directory
const outImagesDir = path.join(__dirname, 'out_images');
app.use('/out_images', express.static(outImagesDir));

// Use routes
app.use('/', routes);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});











