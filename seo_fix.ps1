Add-Type -AssemblyName System.Drawing
$htmlFiles = Get-ChildItem -Path . -Filter *.html -Recurse

foreach ($file in $htmlFiles) {
    if ($file.FullName -match '\\\.gemini\\') { continue }
    $content = Get-Content $file.FullName -Raw

    # 1. Update style.css to style.min.css and preload
    $content = $content -replace '<link rel="stylesheet" href="style\.css(\?v=[^"]*)?">', '<link rel="preload" as="style" href="style.min.css"><link rel="stylesheet" href="style.min.css">'
    $content = $content -replace '<link rel="stylesheet" href="(\.\./)+style\.css(\?v=[^"]*)?">', '<link rel="preload" as="style" href="$1style.min.css"><link rel="stylesheet" href="$1style.min.css">'
    
    # 2. Defer main.js
    $content = $content -replace '<script src="main\.js"></script>', '<script src="main.js" defer></script>'
    $content = $content -replace '<script src="(\.\./)+main\.js"></script>', '<script src="$1main.js" defer></script>'
    
    # 3. Label for forms?
    $content = $content -replace '<input\s+([^>]*?)type="(text|email|tel)"([^>]*?)name="([^"]+)"([^>]*?)>', '<label for="$4" class="sr-only" aria-label="$4">$4</label> <input $1type="$2"$3name="$4" id="$4"$5>'
    
    # 4. Replace links with keywords
    $content = $content -replace '>Read More<', '>Read Full SEO Guide for Kerala Businesses<'
    
    # 5. Headings: Replace multiple h1s? We'll assume one H1 per page based on content, but only replacing generic headers.
    
    Set-Content $file.FullName $content
}
