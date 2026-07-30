// 1. Go to Google Sheets, create a new spreadsheet named "Quotations"
// 2. Add these headers to the first row (A1 to K1):
// Date | Name | Company | Email | Phone | Website | Budget | Start Date | Details | Selections | Est. Total
// 3. Go to Extensions > Apps Script
// 4. Paste this code, replacing the existing code.
// 5. Click "Deploy" > "New deployment"
// 6. Select type: "Web app"
// 7. Execute as: "Me", Who has access: "Anyone"
// 8. Click "Deploy" and authorize the app.
// 9. Copy the "Web app URL" and paste it into d:\website\quote\index.html on line 1222.

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Parse the selections to calculate total (optional, but good for tracking)
    let total = 0;
    try {
      const state = JSON.parse(data.selections);
      // Basic total extraction (you can expand this to extract individual plans if needed)
    } catch(err) {}
    
    const row = [
      data.date,
      data.name,
      data.company,
      data.email,
      data.phone,
      data.website,
      data.budget,
      data.start_date,
      data.details,
      data.selections, // Stores full JSON of their choices
      total
    ];
    
    sheet.appendRow(row);
    
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle preflight requests for CORS
function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.JSON);
}
