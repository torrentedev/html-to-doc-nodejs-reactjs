const express = require('express');
const { JSDOM } = require('jsdom');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const htmlDocx = require('html-docx-js');
const multer = require('multer');

const router = express.Router();

const upload = multer({ dest: 'uploads/' });

const imagesDir = path.join(__dirname, 'images');
const outImagesDir = path.join(__dirname, 'out_images');

if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir);
}
if (!fs.existsSync(outImagesDir)) {
    fs.mkdirSync(outImagesDir);
}

const checkWritePermissions = (dir) => {
    try {
        fs.accessSync(dir, fs.constants.W_OK);
        return true;
    } catch (err) {
        console.error(`No write permissions for directory: ${dir}`);
        return false;
    }
};

const processImages = async (document, outputDir) => {
    const images = document.querySelectorAll('img');
    const totalImages = images.length;
    let processedImages = 0;
    const imagePaths = [];

    for (let img of images) {
        const src = img.getAttribute('src');
        if (src && src.startsWith('data:image/')) {
            try {
                const base64Data = src.split(',')[1];
                const buffer = Buffer.from(base64Data, 'base64');
                const pngBuffer = await sharp(buffer).png().toBuffer();
                const imageName = `${uuidv4()}.png`;
                const imagePath = path.join(outputDir, imageName);
                fs.writeFileSync(imagePath, pngBuffer);
                img.setAttribute('src', imagePath);

                imagePaths.push(`/out_images/${imageName}`);

                processedImages++;
                const progress = (processedImages / totalImages) * 100;
                console.log(`Progress: ${progress.toFixed(2)}%`);
            } catch (err) {
                console.error(`Error processing base64 image:`, err);
            }
        }
    }

    return imagePaths;
};

router.post('/convert', async (req, res) => {
    try {
        const { html } = req.body;
        if (!html) {
            console.error('HTML content is required but not provided');
            return res.status(400).send('HTML content is required');
        }

        if (!checkWritePermissions(imagesDir)) {
            return res.status(500).send('No write permissions for images directory');
        }

        const dom = new JSDOM(html);
        const document = dom.window.document;

        await processImages(document, imagesDir);

        const modifiedHtml = document.documentElement.outerHTML;
        const docxContent = htmlDocx.asBlob(modifiedHtml);
        const arrayBuffer = await docxContent.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const filePath = path.join(__dirname, 'output.docx');
        fs.writeFileSync(filePath, buffer);

        res.download(filePath, 'output.docx', (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error('Error during HTML to DOCX conversion:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const html = fs.readFileSync(filePath, 'utf-8');
        fs.unlinkSync(filePath);

        if (!checkWritePermissions(imagesDir)) {
            return res.status(500).send('No write permissions for images directory');
        }

        const dom = new JSDOM(html);
        const document = dom.window.document;

        await processImages(document, imagesDir);

        const modifiedHtml = document.documentElement.outerHTML;
        const docxContent = htmlDocx.asBlob(modifiedHtml);
        const arrayBuffer = await docxContent.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const outputFilePath = path.join(__dirname, 'output.docx');
        fs.writeFileSync(outputFilePath, buffer);

        res.download(outputFilePath, 'output.docx', (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            fs.unlinkSync(outputFilePath);
        });
    } catch (error) {
        console.error('Error during HTML to DOCX conversion:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/upload-images', upload.single('file'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const html = fs.readFileSync(filePath, 'utf-8');
        fs.unlinkSync(filePath);

        if (!checkWritePermissions(outImagesDir)) {
            return res.status(500).send('No write permissions for out_images directory');
        }

        const dom = new JSDOM(html);
        const document = dom.window.document;

        const imagePaths = await processImages(document, outImagesDir);

        res.status(200).json({ images: imagePaths });
    } catch (error) {
        console.error('Error processing images:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/base64-to-png', async (req, res) => {
    try {
        const { base64 } = req.body;
        if (!base64) {
            console.error('Base64 content is required but not provided');
            return res.status(400).send('Base64 content is required');
        }

        // Log the base64 content for debugging
        console.log('Base64 content received:', base64);

        // Ensure the base64Data is correctly extracted
        const base64Data = base64.split(',')[1];
        if (!base64Data) {
            console.error('Invalid Base64 content');
            return res.status(400).send('Invalid Base64 content');
        }

        // Log the extracted base64Data for debugging
        console.log('Extracted Base64 data:', base64Data);

        const buffer = Buffer.from(base64Data, 'base64');
        const pngBuffer = await sharp(buffer).png().toBuffer();

        res.setHeader('Content-Disposition', 'attachment; filename="image.png"');
        res.setHeader('Content-Type', 'image/png');
        res.send(pngBuffer);
    } catch (error) {
        console.error('Error converting base64 to PNG:', error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
