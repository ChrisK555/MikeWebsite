Write-Host "Building gallery index..."
$files = @(Get-ChildItem "images/gallery" -File | Where-Object { $_.Extension -match "\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$" } | Select-Object -ExpandProperty Name)
$json = ConvertTo-Json -InputObject $files -Compress
$json | Set-Content "gallery.json"
Write-Host "Found $($files.Count) images. Saved to gallery.json"