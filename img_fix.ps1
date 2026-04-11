Add-Type -AssemblyName System.Drawing
$htmlFiles = Get-ChildItem -Path . -Filter *.html -Recurse

foreach ($file in $htmlFiles) {
    if ($file.FullName -match '\\\.gemini\\') { continue }
    $content = Get-Content $file.FullName -Raw

    $evaluator = [System.Text.RegularExpressions.MatchEvaluator] {
        param($match)
        $fullMatch = $match.Value
        
        if ($fullMatch -match 'hero\.webp') { return $fullMatch }
        
        $src = if ($fullMatch -match 'src="([^"]+)"') { $matches[1] } else { $null }
        if ($src) {
            $dir = Split-Path $file.FullName
            try {
                $resolved = (Resolve-Path (Join-Path $dir $src)).Path
                $img = [System.Drawing.Image]::FromFile($resolved)
                $w = $img.Width
                $h = $img.Height
                $img.Dispose()
                
                $newSrc = $src -replace '\.(jpg|jpeg|png)$', '.webp'
                
                # Strip old width/height if any so we don't duplicate
                $newMatch = $fullMatch -replace '\s+width="[^"]+"', '' -replace '\s+height="[^"]+"', '' -replace 'src="[^"]+"', "src=`"$newSrc`" width=`"$w`" height=`"$h`""
                
                if ($newMatch -notmatch 'loading=') {
                    $newMatch = $newMatch -replace '<img\s', '<img loading="lazy" '
                }
                if ($newMatch -notmatch 'alt=') {
                    $newMatch = $newMatch -replace '<img\s', '<img alt="Digital Marketing Services in Kerala" '
                }
                
                return $newMatch
            } catch {
                $newSrc = $src -replace '\.(jpg|jpeg|png)$', '.webp'
                return ($fullMatch -replace 'src="[^"]+"', "src=`"$newSrc`"")
            }
        }
        return $fullMatch
    }
    
    $regex = [regex] '<img\s[^>]*>'
    $content = $regex.Replace($content, $evaluator)
    
    Set-Content $file.FullName $content
}
