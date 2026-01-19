This subdirectory /images/gallery is for images you that want to showcase in the rotating gallery.

After changes are made, we currently have to reset the list using java script.

## How to Update Gallery Images

To update the photos in the gallery carousel:
1. Add or remove your image files in the `images/gallery` folder.
2. Run the following command in PowerShell to update the website's image list:

```powershell
powershell -ExecutionPolicy Bypass -File .\build-gallery.ps1
```


Images are converted into smaller webp files for efficiency using the following command within this directory:

Get-ChildItem -Filter *.jpg | ForEach-Object { ./cwebp.exe -q 80 $_.Name -o ($_.BaseName + ".webp") }