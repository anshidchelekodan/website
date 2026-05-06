$key = "f9b5c3e7a1d2489ab8f7c6e5d4a3b2c1"
$hostName = "anshidck.com"

$urls = @(
    "https://anshidck.com/",
    "https://anshidck.com/about/",
    "https://anshidck.com/services/",
    "https://anshidck.com/portfolio/",
    "https://anshidck.com/blog/",
    "https://anshidck.com/contact/",
    "https://anshidck.com/blog/ai-prompt-engineering-kerala-2026/"
)

$payload = @{
    host = $hostName
    key = $key
    keyLocation = "https://$hostName/$key.txt"
    urlList = $urls
} | ConvertTo-Json

$endpoints = @(
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow"
)

foreach ($endpoint in $endpoints) {
    try {
        Write-Host "Submitting to $endpoint..."
        Invoke-RestMethod -Uri $endpoint -Method Post -Body $payload -ContentType "application/json"
        Write-Host "Successfully submitted to $endpoint" -ForegroundColor Green
    } catch {
        Write-Host "Failed to submit to $endpoint : $_" -ForegroundColor Red
    }
}
