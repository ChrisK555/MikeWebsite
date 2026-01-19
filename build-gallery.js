const fs = require('fs');
const path = require('path');

const galleryDir = path.join(__dirname, 'images', 'gallery');
const outputFile = path.join(__dirname, 'gallery.json');

console.log('Building gallery index...');

// Check if gallery directory exists
if (fs.existsSync(galleryDir)) {
    // Read directory and filter for image files
    const files = fs.readdirSync(galleryDir).filter(file => {
        return /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i.test(file);
    });
    
    // Write the list of filenames to a JSON file
    fs.writeFileSync(outputFile, JSON.stringify(files));
    console.log(`Found ${files.length} images. Saved to gallery.json`);
} else {
    console.log('Gallery directory not found. Creating empty index.');
    fs.writeFileSync(outputFile, '[]');
}