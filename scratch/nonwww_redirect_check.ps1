$uri = 'https://anshidck.com/'
try {
    $resp = Invoke-WebRequest -Uri $uri -Headers @{'User-Agent'='Mozilla/5.0'} -MaximumRedirection 0 -ErrorAction Stop
    Write-Output "Status:$($resp.StatusCode)"
    Write-Output "Location:$($resp.Headers['Location'])"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    $loc = $_.Exception.Response.Headers['Location']
    Write-Output "Status:$code"
    Write-Output "Location:$loc"
}
