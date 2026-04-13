$filePath = "d:\NEW WEBSITE\index.html"
$html = Get-Content -Raw -Path $filePath

$styleBlock = @"
<style>
  .testimonial-marquee-container {
      overflow: hidden;
      padding: 1rem 0;
      position: relative;
      width: 100%;
      mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
      -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
  }
  .testimonial-track {
      display: flex;
      width: max-content;
      animation: testimonial-slide 20s linear infinite;
      gap: 2rem;
  }
  .testimonial-marquee-container:hover .testimonial-track {
      animation-play-state: paused;
  }
  @keyframes testimonial-slide {
      to { transform: translateX(calc(-50% - 1rem)); }
  }
</style>
"@

$html = $html -replace '</head>', "$styleBlock`n</head>"

$regex = '(?s)<div class="grid grid-3" style="margin-top: 3rem;">(.*?)</div>\s*</div>\s*</section>'
$match = [regex]::Match($html, $regex)

if ($match.Success) {
    $testimonialsHtml = $match.Groups[1].Value
    $testimonialsHtml = $testimonialsHtml -replace 'animate stagger-\d+', ''
    $testimonialsHtml = $testimonialsHtml -replace '(?s)<!-- Testimonial \d+ -->\s*<div class="moving-border-container\s*" style="border-radius: 20px;">', '<div class="moving-border-container" style="border-radius: 20px; width: 350px; flex-shrink: 0;">'
    
    $newGrid = "<div class=`"testimonial-marquee-container`" style=`"margin-top: 3rem;`">`n  <div class=`"testimonial-track`">`n" + $testimonialsHtml + "`n" + $testimonialsHtml + "`n  </div>`n</div>"
    
    $html = $html.Substring(0, $match.Index) + $newGrid + "`n      </div>`n    </section>" + $html.Substring($match.Index + $match.Length)
    
    Set-Content -Path $filePath -Value $html -NoNewline -Encoding UTF8
    Write-Output "Testimonials altered to marquee slider successfully."
} else {
    Write-Output "Could not match testimonials grid."
}
