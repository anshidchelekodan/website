$files = Get-ChildItem -Path "d:\NEW WEBSITE" -Filter "index.html" -Recurse | Where-Object { $_.FullName -notmatch "\\libwebp\\" -and $_.FullName -notmatch "\\pricing\\" -and $_.FullName -notmatch "\\thank-you\\" }

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False

foreach ($f in $files) {
    $content = [System.IO.File]::ReadAllText($f.FullName)
    if ($content -notmatch ">Pricing</a>") {
        # Find the line containing Services</a></li> and insert Pricing right after it
        # We use regex to match the exact spacing and copy it
        $content = [regex]::Replace($content, "(?<spaces>[\t ]*)(?<full><li><a href=`"(?<path>[^`"]*)`"(?: class=`"active`")?>Services</a></li>)", 
            "`${spaces}`${full}`n`${spaces}<li><a href=`"https://anshidck.com/pricing/`">Pricing</a></li>")
        
        [System.IO.File]::WriteAllText($f.FullName, $content, $Utf8NoBomEncoding)
        Write-Host "Updated $($f.FullName)"
    }
}
