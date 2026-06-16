$baseDir = "d:\NEW WEBSITE"
$htmlFiles = Get-ChildItem -Path $baseDir -Recurse -Filter "*.html" | Where-Object { $_.FullName -notmatch "\\node_modules\\" -and $_.FullName -notmatch "\\.git\\" }

$regex = '(?i)(href|src)=["'']([^"''#\?]+)["'']'

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $matches = [regex]::Matches($content, $regex)
    
    foreach ($match in $matches) {
        $link = $match.Groups[2].Value
        
        if ($link -match "^http" -or $link -match "^mailto:" -or $link -match "^tel:" -or $link -match "^data:") {
            continue
        }
        
        $targetPath = ""
        if ($link.StartsWith("/")) {
            $targetPath = Join-Path $baseDir $link
        } else {
            $targetPath = Join-Path $file.DirectoryName $link
        }
        
        # normalize path
        try {
            $targetPath = [System.IO.Path]::GetFullPath($targetPath)
            
            $exists = Test-Path -LiteralPath $targetPath -PathType Leaf
            if (-not $exists) {
                $indexPath = Join-Path $targetPath "index.html"
                $exists = Test-Path -LiteralPath $indexPath -PathType Leaf
            }
            if (-not $exists) {
                $htmlPath = "$targetPath.html"
                $exists = Test-Path -LiteralPath $htmlPath -PathType Leaf
            }
            
            if (-not $exists) {
                Write-Output "BROKEN: $($link) IN $($file.FullName)"
            }
        } catch {
            # Invalid path
             Write-Output "INVALID PATH: $($link) IN $($file.FullName)"
        }
    }
}
