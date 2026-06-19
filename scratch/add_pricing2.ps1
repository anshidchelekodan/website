$files = @(
    "d:\NEW WEBSITE\index.html",
    "d:\NEW WEBSITE\services\index.html",
    "d:\NEW WEBSITE\services\seo-optimization\index.html",
    "d:\NEW WEBSITE\about\index.html",
    "d:\NEW WEBSITE\portfolio\index.html",
    "d:\NEW WEBSITE\blog\index.html",
    "d:\NEW WEBSITE\contact\index.html"
)

foreach ($f in $files) {
    if (Test-Path $f) {
        $content = [System.IO.File]::ReadAllText($f)
        if ($content -notmatch ">Pricing</a>") {
            # Let's insert Pricing after Services. Since we use relative paths in some files, maybe it's better to just use absolute path /pricing/
            $content = [regex]::Replace($content, "(<li><a href=`"([^`"]*)`"(?: class=`"active`")?>Services</a></li>)", "`$1`n          <li><a href=`"../pricing/`">Pricing</a></li>")
            
            # For root index.html, services is "services/"
            $content = [regex]::Replace($content, "(<li><a href=`"services/`"(?: class=`"active`")?>Services</a></li>)", "`$1`n          <li><a href=`"pricing/`">Pricing</a></li>")
            
            # Just to make it absolute if relative path logic breaks:
            # Actually, I'll just use a safer regex replacement to ensure paths are somewhat correct based on Portfolio link.
            
            # For root index.html
            $content = $content -replace "<li><a href=`"portfolio/`">Portfolio</a></li>", "<li><a href=`"pricing/`">Pricing</a></li>`n          <li><a href=`"portfolio/`">Portfolio</a></li>"
            
            # For subfolders
            $content = $content -replace "<li><a href=`"\.\./portfolio/`">Portfolio</a></li>", "<li><a href=`"../pricing/`">Pricing</a></li>`n          <li><a href=`"../portfolio/`">Portfolio</a></li>"
            
            # For deeper subfolders
            $content = $content -replace "<li><a href=`"\.\./\.\./portfolio/`">Portfolio</a></li>", "<li><a href=`"../../pricing/`">Pricing</a></li>`n          <li><a href=`"../../portfolio/`">Portfolio</a></li>"
            
            [System.IO.File]::WriteAllText($f, $content, [System.Text.Encoding]::UTF8)
            Write-Host "Updated $f"
        }
    }
}
