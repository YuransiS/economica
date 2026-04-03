function doPost(e) {
  try {
    // 1. Отримуємо та розшифровуємо дані
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // ==========================================
    // ЛОГІКА ОНОВЛЕННЯ СТАТУСУ ОПЛАТИ
    // ==========================================
    if (data.action === 'update_status' && data.orderId) {
      var sheetName = data.targetSheet || "Заявки на практикум";
      var sheetId = 1109800626;
      var targetOrderId = (data.orderId || "").toString().trim();
      var newStatus = data.status || "Оплачено";

      // Знаходимо лист за ID або назвою
      var sheet = ss.getSheets().filter(function (s) { return s.getSheetId() == sheetId; })[0];
      if (!sheet) sheet = ss.getSheetByName(sheetName);

      var found = false;
      if (sheet) {
        var values = sheet.getDataRange().getValues();
        var headers = values[0];
        
        var orderIdColIdx = -1;
        var statusColIdx = -1;

        // Шукаємо індекси стовпців (кейс-незалежно)
        for (var k = 0; k < headers.length; k++) {
          var h = headers[k].toString().toLowerCase().trim();
          if (h === "номер замовлення") orderIdColIdx = k;
          if (h === "статус оплати") statusColIdx = k;
        }

        if (orderIdColIdx !== -1 && statusColIdx !== -1) {
          for (var i = 1; i < values.length; i++) {
            var rowOrderId = values[i][orderIdColIdx].toString().trim();
            if (rowOrderId === targetOrderId) {
              sheet.getRange(i + 1, statusColIdx + 1).setValue(newStatus);
              found = true;
              break;
            }
          }
        }
        
        if (!found) {
          logError(ss, "Order not found: " + targetOrderId + " in sheet: " + sheetName);
        }
      } else {
        logError(ss, "Sheet not found: " + sheetName);
      }
      
      return ContentService.createTextOutput(JSON.stringify({ "result": "success", "found": found }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ==========================================
    // ЛОГІКА ДЛЯ ПРАКТИКУМУ (Створення ліда)
    // ==========================================
    if (data.action === 'create_lead' || data.targetSheet === "Заявки на практикум") {
      var sheetName = "Заявки на практикум";
      var sheetId = 1109800626;

      var sheet = ss.getSheets().filter(function (s) { return s.getSheetId() == sheetId; })[0];
      if (!sheet) sheet = ss.getSheetByName(sheetName);

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
        data.utm_source || data.source || "",
        data.utm_medium || data.medium || "",
        data.utm_campaign || data.campaign || "",
        data.utm_content || data.content || "",
        data.utm_term || data.term || "",
        "Не оплачено"
      ];

      sheet.appendRow(rowData);
      return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ==========================================
    // ЛОГІКА ДЛЯ ІНШИХ ЛЕНДІНГІВ
    // ==========================================
    var isSecondLanding = (data.goal !== undefined || data.income !== undefined || data.targetSheet === "Leads_Finance100k");

    if (isSecondLanding) {
      var sheetName2 = "Анкети після уроку";
      var sheet2 = ss.getSheetByName(sheetName2);

      if (!sheet2) {
        sheet2 = ss.insertSheet(sheetName2);
        sheet2.appendRow(["Дата та час", "Ім'я", "Телефон", "Рівень доходу", "Борги/Кредити", "Термін (до 100k$)", "Головна ціль", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]);
        sheet2.getRange(1, 1, 1, 12).setFontWeight("bold");
      }

      sheet2.appendRow([
        new Date(),
        data.name || "",
        data.phone || "",
        data.income || "",
        data.debt || "",
        data.timeline || "",
        data.goal || "",
        data.utm_source || data.source || "",
        data.utm_medium || data.medium || "",
        data.utm_campaign || data.campaign || "",
        data.utm_content || data.content || "",
        data.utm_term || data.term || ""
      ]);

    } else {
      var sheetName1 = "Заявки на урок";
      var sheet1 = ss.getSheetByName(sheetName1);

      if (!sheet1) {
        sheet1 = ss.insertSheet(sheetName1);
        sheet1.appendRow(["Дата та час", "Ім'я", "Телефон", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]);
        sheet1.getRange(1, 1, 1, 8).setFontWeight("bold");
      }

      sheet1.appendRow([
        new Date(),
        data.name || "",
        data.phone || "",
        data.source || data.utm_source || "",
        data.medium || data.utm_medium || "",
        data.campaign || data.utm_campaign || "",
        data.content || data.utm_content || "",
        data.term || data.utm_term || ""
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    logError(ss, "Global Error: " + error.message);
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.message }))
      .setMimeType(ContentService.MimeType.JSON);
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