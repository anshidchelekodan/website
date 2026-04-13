$htmlFiles = Get-ChildItem -Path "d:\NEW WEBSITE" -Recurse -Filter *.html

$patternGF = '(?is)<link[^>]*href="https://fonts\.googleapis\.com/css2\?family=Montserrat[^"]*"[^>]*>'
$allMatchedFiles = @()

foreach ($file in $htmlFiles) {
    if ((Get-Content $file.FullName -Raw) -match $patternGF) {
        $allMatchedFiles += $file.FullName
    }
}
Write-Output "Matched $str in $($allMatchedFiles.Count) files"
