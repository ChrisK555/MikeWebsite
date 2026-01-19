# Kemsley Construction Website

This repository contains the source code for the Kemsley Construction website. It is a static site designed to showcase construction services and portfolio projects.

## How to Update Gallery Images

To update the photos in the gallery carousel:
1. Add or remove your image files in the `images/gallery` folder.
2. Run the following command in PowerShell to update the website's image list:

```powershell
powershell -ExecutionPolicy Bypass -File .\build-gallery.ps1
```

[![Netlify Status](https://api.netlify.com/api/v1/badges/1fae2d4d-41fe-4582-b8d1-df27463c6ecd/deploy-status)](https://app.netlify.com/projects/kaleidoscopic-biscochitos-f2db46/deploys)