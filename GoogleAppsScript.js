function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // ==========================================
    // 1. ЛОГІКА ОНОВЛЕННЯ СТАТУСУ (Надстійка)
    // ==========================================
    if (data.action === 'update_status' || (data.orderId && !data.name)) {
      var sheetName = data.targetSheet || "Заявки на практикум";
      var targetOrderId = (data.orderId || "").toString().trim();
      var newStatus = data.status || "Оплачено";
      var found = false;
      
      var sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        var values = sheet.getDataRange().getValues();
        if (values.length > 0) {
          var headers = values[0];
          
          // Шукаємо стовпець статусу за вхожденням слова (case-insensitive)
          var statusColIdx = -1;
          for (var k = 0; k < headers.length; k++) {
            var h = headers[k].toString().toLowerCase();
            if (h.indexOf("статус") !== -1 || h.indexOf("status") !== -1) {
              statusColIdx = k;
              break;
            }
          }

          // Шукаємо рядок, де є наш Order ID (у будь-якому стовпці!)
          for (var i = 1; i < values.length; i++) {
            var row = values[i];
            for (var j = 0; j < row.length; j++) {
              if (row[j].toString().trim() === targetOrderId) {
                // Знайшли! Тепер оновлюємо статус, якщо знайшли стовпець
                if (statusColIdx !== -1) {
                  sheet.getRange(i + 1, statusColIdx + 1).setValue(newStatus);
                  found = true;
                }
                break;
              }
            }
            if (found) break;
          }
          
          if (!found) {
            var headerStr = headers.join(" | ");
            logError(ss, "Order not found: " + targetOrderId + ". Headers seen: " + headerStr);
          }
        }
      } else {
        logError(ss, "Sheet not found: " + sheetName);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ "result": "success", "found": found }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ==========================================
    // 2. ЛОГІКА СТВОРЕННЯ ЛІДА
    // ==========================================
    if (data.action === 'create_lead' || data.targetSheet === "Заявки на практикум") {
      var sheetName = "Заявки на практикум";
      var sheet = ss.getSheetByName(sheetName);

      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow(["Дата та час", "Ім'я", "Телефон", "Telegram", "Тариф", "Номер замовлення", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "Статус оплати"]);
        sheet.getRange(1, 1, 1, 12).setFontWeight("bold");
      }

      var rowData = [
        new Date(),
        data.name || "",
        data.phone || "",
        data.telegram || "",
        data.tariff || "",
        (data.orderId || "").toString().trim(),
        data.utm_source || "",
        data.utm_medium || "",
        data.utm_campaign || "",
        data.utm_content || "",
        data.utm_term || "",
        "Не оплачено"
      ];

      sheet.appendRow(rowData);
      return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ "result": "unknown_action" })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    logError(ss, "Global Error: " + error.message);
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "message": error.message })).setMimeType(ContentService.MimeType.JSON);
  }
}

function logError(ss, message) {
  try {
    var logSheet = ss.getSheetByName("System_Logs");
    if (!logSheet) {
      logSheet = ss.insertSheet("System_Logs");
      logSheet.appendRow(["Time", "Error Message"]);
    }
    logSheet.appendRow([new Date(), message]);
  } catch(e) {}
}