$htmlFiles = Get-ChildItem -Path "." -Recurse -Filter *.html

$patternGF = '(?s)<link\s*rel="preload"\s*href="https://fonts\.googleapis\.com/css2\?family=Montserrat[^"]*"\s*as="style"\s*onload="[^"]*">\s*<noscript>\s*<link\s*rel="stylesheet"\s*href="https://fonts\.googleapis\.com/css2\?family=Montserrat[^"]*">\s*</noscript>'
$replacementGF = '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" media="print" onload="this.media=''all''">`r`n  <noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800&display=swap"></noscript>'

$patternFA = '(?s)<link\s*rel="preload"\s*href="https://cdnjs\.cloudflare\.com/ajax/libs/font-awesome/[^"]+"\s*as="style"\s*onload="[^"]*">\s*<noscript>\s*<link\s*rel="stylesheet"\s*href="https://cdnjs\.cloudflare\.com/ajax/libs/font-awesome/[^"]+">\s*</noscript>'
$replacementFA = '<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" rel="stylesheet" media="print" onload="this.media=''all''">`r`n  <noscript><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"></noscript>'

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace $patternGF, $replacementGF
    $newContent = $newContent -replace $patternFA, $replacementFA
    if ($content -ne $newContent) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline -Encoding UTF8
        Write-Output "Updated fonts in $($file.FullName)"
    }
}
