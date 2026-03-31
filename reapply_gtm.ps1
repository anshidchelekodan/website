$gtmId = "GTM-NXNM6B7R"
$gtmHead = @"
  <!-- Google Tag Manager -->
  <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','$gtmId');</script>
  <!-- End Google Tag Manager -->
"@

$gtmBody = @"
  <!-- Google Tag Manager (noscript) -->
  <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=$gtmId"
  height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
  <!-- End Google Tag Manager (noscript) -->
"@

$files = Get-ChildItem -Path . -Filter *.html -Recurse

foreach ($file in $files) {
    if ($file.FullName -like "*node_modules*") { continue }
    
    $content = Get-Content -Path $file.FullName -Raw
    
    # Remove existing GTM to re-place it correctly
    $content = $content -replace "<!-- Google Tag Manager -->[\s\S]*?<!-- End Google Tag Manager -->", ""
    $content = $content -replace "<!-- Google Tag Manager \(noscript\) -->[\s\S]*?<!-- End Google Tag Manager \(noscript\) -->", ""

    # Add to head (immediately after <head> open)
    if ($content -match "<head>") {
        $content = $content -replace "<head>", "<head>`n$gtmHead"
    }

    # Add to body (immediately after <body> open)
    if ($content -match "<body>") {
        $content = $content -replace "<body>", "<body>`n$gtmBody"
    }
    elseif ($content -match "<body[^>]*>") {
        $match = [regex]::Match($content, "<body[^>]*>")
        if ($match.Success) {
            $tagEnd = $match.Index + $match.Length
            $content = $content.Insert($tagEnd, "`n$gtmBody")
        }
    }
        
    # Clean up any potential double newlines
    $content = $content -replace "\n\s*\n\s*\n", "`n`n"
    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
    Write-Host "Re-applied GTM to $($file.FullName)"
}
