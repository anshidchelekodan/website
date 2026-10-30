$uri = 'https://anshidck.com/'
try {
    $resp = Invoke-WebRequest -Uri $uri -Headers @{'User-Agent'='Mozilla/5.0'} -MaximumRedirection 0 -ErrorAction Stop
    $status = $resp.StatusCode
    $location = $resp.Headers['Location']
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    $location = $_.Exception.Response.Headers['Location']
}
Write-Output "Status:$status"
Write-Output "Location:$location"
