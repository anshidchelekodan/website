$htmlFiles = Get-ChildItem -Path "d:\NEW WEBSITE" -Filter "*.html" -Recurse

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match "<li><a href=`"[^`"]*`">Services</a></li>") {
        # Check if pricing already exists to avoid duplicates
        if ($content -notmatch ">Pricing</a></li>") {
            # Let's see if we can find the Services link and insert Pricing after it
            # We need to handle different relative paths like ../ or ../../
            $content = [regex]::Replace($content, "(<li><a href=`"([^`"]*)`"(?: class=`"active`")?>Services</a></li>)", "`$1`n          <li><a href=`"`$2../pricing/`">Pricing</a></li>")
            
            # For the root index.html where services is "services/"
            $content = [regex]::Replace($content, "(<li><a href=`"services/`"(?: class=`"active`")?>Services</a></li>)", "`$1`n          <li><a href=`"pricing/`">Pricing</a></li>")
            
            # The regex above is tricky. Let's do a simpler replacement based on Portfolio
            # <li><a href="../../portfolio/">Portfolio</a></li>
            # <li><a href="../portfolio/">Portfolio</a></li>
            # <li><a href="portfolio/">Portfolio</a></li>
            
            $content = [regex]::Replace($content, "(<li><a href=`"([^`"]*portfolio/)`">Portfolio</a></li>)", "<li><a href=`"`$2../pricing/`">Pricing</a></li>`n          `$1")
            
            # Fix the path
            $content = $content -replace "portfolio/\.\./pricing/", "pricing/"
            
            Set-Content -Path $file.FullName -Value $content
        }
    }
}
