$pages = @(
    @{url='https://www.anshidck.com/'; local='D:\website\index.html'},
    @{url='https://www.anshidck.com/about/'; local='D:\website\about\index.html'},
    @{url='https://www.anshidck.com/services/'; local='D:\website\services\index.html'},
    @{url='https://www.anshidck.com/services/seo-optimization/'; local='D:\website\services\seo-optimization\index.html'},
    @{url='https://www.anshidck.com/services/web-development/'; local='D:\website\services\web-development\index.html'},
    @{url='https://www.anshidck.com/portfolio/'; local='D:\website\portfolio\index.html'},
    @{url='https://www.anshidck.com/blog/'; local='D:\website\blog\index.html'},
    @{url='https://www.anshidck.com/blog/perplexity-ai-search-optimization-guide-2026/'; local='D:\website\blog\perplexity-ai-search-optimization-guide-2026\index.html'},
    @{url='https://www.anshidck.com/contact/'; local='D:\website\contact\index.html'},
    @{url='https://www.anshidck.com/pricing/'; local='D:\website\pricing\index.html'},
    @{url='https://www.anshidck.com/calendar/'; local='D:\website\calendar\index.html'},
    @{url='https://www.anshidck.com/privacy-policy/'; local='D:\website\privacy-policy\index.html'}
)

$results = @()
foreach ($p in $pages) {
    try {
        $resp = Invoke-WebRequest -Uri $p.url -UseBasicParsing -Headers @{'User-Agent'='Mozilla/5.0'}
        $status = $resp.StatusCode
        $finalUrl = $resp.BaseResponse.ResponseUri.AbsoluteUri
        $canonical = ($resp.ParsedHtml.getElementsByTagName('link') | Where-Object { $_.rel -eq 'canonical' }).href
        $robotsMeta = ($resp.ParsedHtml.getElementsByTagName('meta') | Where-Object { $_.name -eq 'robots' }).content
        $xrobots = $resp.Headers['X-Robots-Tag']
    } catch {
        $status = $_.Exception.Response.StatusCode.value__
        $finalUrl = $_.Exception.Response.ResponseUri.AbsoluteUri
        $canonical = $null
        $robotsMeta = $null
        $xrobots = $null
    }
    $localCanonical = ''
    if (Test-Path $p.local) {
        $text = Get-Content -Path $p.local -Raw
        if ($text -match '<link\s+rel=["\'']canonical["\'']\s+href=["\'']([^"\'']+)["\'']') {
            $localCanonical = $matches[1]
        }
    }
    $results += [pscustomobject]@{
        URL = $p.url
        Status = $status
        FinalURL = $finalUrl
        CanonicalLive = $canonical
        RobotsMetaLive = $robotsMeta
        XRobotsTag = $xrobots
        CanonicalLocal = $localCanonical
    }
}
$results | ConvertTo-Json -Depth 4
