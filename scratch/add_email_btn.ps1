$f = "d:\NEW WEBSITE\contact\index.html"
$content = [System.IO.File]::ReadAllText($f)

# Replace the buttons
$searchBtns = '(?s)<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">\s*<button type="submit" class="btn btn-primary btn-pulse" style="width: 100%;"><i class="fas fa-paper-plane"></i> Send Message</button>\s*<button type="button" onclick="sendToWhatsApp\(\)" class="btn btn-outline" style="width: 100%; border-color: #25D366; color: #25D366;"><i class="fab fa-whatsapp"></i> Send to WhatsApp</button>\s*</div>'
$replaceBtns = '<div style="display: flex; flex-direction: column; gap: 15px;">
                <button type="submit" class="btn btn-primary btn-pulse" style="width: 100%;"><i class="fas fa-paper-plane"></i> Send Message (to System)</button>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <button type="button" onclick="sendToWhatsApp()" class="btn btn-outline" style="width: 100%; border-color: #25D366; color: #25D366;"><i class="fab fa-whatsapp"></i> Send via WhatsApp</button>
                  <button type="button" onclick="sendToEmail()" class="btn btn-outline" style="width: 100%; border-color: #62ffb0; color: #62ffb0;"><i class="fas fa-envelope"></i> Send via Email</button>
                </div>
              </div>'

$content = $content -replace $searchBtns, $replaceBtns

# Add the sendToEmail JS function
$searchJs = '(?s)function sendToWhatsApp\(\) \{.*?\n\s*\}'
$replaceJs = "$0`n`n    function sendToEmail() {
      var name    = document.getElementById('name').value.trim();
      var email   = document.getElementById('email').value.trim();
      var phone   = document.getElementById('phone').value.trim();
      var message = document.getElementById('message').value.trim();
      if (!name || !email || !message) {
        alert('Please fill in Name, Email, and Message before sending an email.');
        return;
      }
      var subject = encodeURIComponent('New Inquiry from ' + name);
      var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\nPhone: ' + phone + '\n\nMessage:\n' + message);
      window.location.href = 'mailto:anshidchelekodan@gmail.com?subject=' + subject + '&body=' + body;
    }"

$content = $content -replace $searchJs, $replaceJs

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
[System.IO.File]::WriteAllText($f, $content, $Utf8NoBomEncoding)
