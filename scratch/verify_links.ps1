$issues = @(
    @{src='index.html'; link='about.html'; type='page'; suggested='about/'; line=112},
    @{src='index.html'; link='services.html'; type='page'; suggested='services/'; line=115},
    @{src='index.html'; link='portfolio.html'; type='page'; suggested='portfolio/'; line=118},
    @{src='about\index.html'; link='../pricing.html'; type='page'; suggested='../pricing/'; line=57},
    @{src='services\index.html'; link='seo.html'; type='page'; suggested='seo-optimization/'; line=42},
    @{src='services\seo-optimization\index.html'; link='../web-development.html'; type='page'; suggested='../web-development/'; line=39},
    @{src='services\web-development\index.html'; link='../seo.html'; type='page'; suggested='../seo-optimization/'; line=37},
    @{src='portfolio\index.html'; link='adverix-media.html'; type='page'; suggested='adverix-media/'; line=63},
    @{src='blog\index.html'; link='seo-kerala.html'; type='page'; suggested='seo-kerala/'; line=88},
    @{src='blog\perplexity-ai-search-optimization-guide-2026\index.html'; link='#'; type='placeholder'; suggested='[real URL]'; line=124},
    @{src='about\index.html'; link='#'; type='placeholder'; suggested='[real URL]'; line=104},
    @{src='services\index.html'; link='#'; type='placeholder'; suggested='[real URL]'; line=97},
    @{src='portfolio\adverix-media\index.html'; link='#'; type='placeholder'; suggested='[real URL]'; line=112},
    @{src='blog\seo-kerala\index.html'; link='assets/seo.jpg'; type='asset'; suggested='../../assets/seo.jpg'; line=45},
    @{src='services\web-development\index.html'; link='js/webdev.js'; type='asset'; suggested='../../js/webdev.js'; line=55},
    @{src='portfolio\website-optimization\index.html'; link='style.css'; type='asset'; suggested='../style.min.css'; line=70},
    @{src='calendar\index.html'; link='../old_pricing.html'; type='page'; suggested='../pricing/'; line=200},
    @{src='contact\index.html'; link='/contact/#form'; type='anchor'; suggested='[optional]'; line=150}
)

$base = 'D:\website'

$results = @()
foreach($i in $issues){
    $srcPath = Join-Path $base $i.src
    $srcExists = Test-Path $srcPath
    $targetResolved = $null
    $targetExists = $false
    $suggestedExists = $false
    $evidence = ''
    if($srcExists){
        # resolve relative link
        $srcDir = Split-Path $srcPath -Parent
        $targetPath = Join-Path $srcDir $i.link
        $targetPath = [IO.Path]::GetFullPath($targetPath)
        $targetExists = Test-Path $targetPath
        $targetResolved = $targetPath
        $evidence = "Link resolves to $targetPath"
        # suggested path resolve
        if($i.suggested -ne $null -and $i.suggested -ne '[real URL]' -and $i.suggested -ne '[optional]'){
            $suggestedPath = Join-Path $srcDir $i.suggested
            $suggestedPath = [IO.Path]::GetFullPath($suggestedPath)
            $suggestedExists = Test-Path $suggestedPath
            $evidence += ", suggested resolves to $suggestedPath"
        }
    } else {
        $evidence = 'Source file missing'
    }
    $results += [pscustomobject]@{
        Source = $i.src
        Link = $i.link
        Type = $i.type
        SourceExists = $srcExists
        TargetExists = $targetExists
        TargetPath = $targetResolved
        Suggested = $i.suggested
        SuggestedExists = $suggestedExists
        Evidence = $evidence
    }
}
$results | ConvertTo-Json -Depth 4
