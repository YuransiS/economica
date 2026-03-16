/**
 * Google Apps Script Web App Template for Lead Handling
 * 
 * Instructions:
 * 1. Open your Google Sheet.
 * 2. Extensions -> Apps Script.
 * 3. Replace all the code with the content of this file.
 * 4. Save and click "Deploy" -> "New Deployment".
 * 5. Type: "Web App". Execute as: "Me". Who has access: "Anyone".
 * 6. Copy the resulting URL into your Next.js .env file under GOOGLE_SHEET_WEBHOOK_URL.
 */

const SHEET_NAME = 'Leads';

// This function processes POST requests (e.g., from your Next.js API)
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME) || 
                  SpreadsheetApp.getActiveSpreadsheet().insertSheet(SHEET_NAME);
                  
    // Add headers if empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Date', 'Name', 'Phone', 'Tariff', 'Order ID', 'Status', 
        'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'UTM Term'
      ]);
      sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
    }

    const data = JSON.parse(e.postData.contents);
    const action = data.action; // 'create_lead' or 'update_status'

    if (action === 'create_lead') {
      const rowData = [
        new Date().toISOString(),
        data.name || '',
        data.phone || '',
        data.tariff || '',
        data.orderId || '',
        'not paid',
        data.utm_source || '',
        data.utm_medium || '',
        data.utm_campaign || '',
        data.utm_content || '',
        data.utm_term || ''
      ];
      sheet.appendRow(rowData);
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Lead added' }))
        .setMimeType(ContentService.MimeType.JSON);
    } 
    
    else if (action === 'update_status') {
      const orderId = data.orderId;
      const status = data.status; // 'paid', 'declined', etc.
      
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      
      if (lastRow > 1) {
        // Find the column index for "Order ID" and "Status"
        const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
        const orderIdColIndex = headers.indexOf('Order ID');
        const statusColIndex = headers.indexOf('Status');
        
        if (orderIdColIndex > -1 && statusColIndex > -1) {
          const orderIds = sheet.getRange(2, orderIdColIndex + 1, lastRow - 1).getValues();
          for (let i = 0; i < orderIds.length; i++) {
            if (String(orderIds[i][0]) === String(orderId)) {
              // Row found (1-indexed, +2 offset because array starts 0 and header is row 1)
              sheet.getRange(i + 2, statusColIndex + 1).setValue(status);
              return ContentService.createTextOutput(JSON.stringify({ success: true, message: 'Status updated' }))
                .setMimeType(ContentService.MimeType.JSON);
            }
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Order ID not found' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
