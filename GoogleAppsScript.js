function doPost(e) {
  try {
    // 1. Отримуємо та розшифровуємо дані з будь-якого лендінгу
    var data = JSON.parse(e.postData.contents);

    // 2. Підключаємося до поточної таблиці
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 3. Перевіряємо, з якого лендінгу прийшла заявка
    
    // ЛОГІКА ДЛЯ ПРАКТИКУМУ (новий запит)
    if (data.action === 'create_lead' || data.targetSheet === "Заявки на практикум") {
      var sheetName = "Заявки на практикум";
      var sheetId = 1109800626;
      
      // Знаходимо лист за ID або назвою
      var sheet = ss.getSheets().filter(function(s) { return s.getSheetId() == sheetId; })[0];
      if (!sheet) sheet = ss.getSheetByName(sheetName);

      // Створюємо лист, якщо його ще немає
      if (!sheet) {
        sheet = ss.insertSheet(sheetName);
        sheet.appendRow([
          "Дата та час",
          "Ім'я",
          "Телефон",
          "Тариф",
          "Номер замовлення",
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "utm_content",
          "utm_term"
        ]);
        sheet.getRange("A1:J1").setFontWeight("bold");
      }

      var rowData = [
        new Date(),
        data.name || "",
        data.phone || "",
        data.tariff || "",
        data.orderId || "",
        data.utm_source || data.source || "",
        data.utm_medium || data.medium || "",
        data.utm_campaign || data.campaign || "",
        data.utm_content || data.content || "",
        data.utm_term || data.term || ""
      ];

      sheet.appendRow(rowData);
      
      return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // В другому лендінгу є специфічні поля: goal, income, debt тощо.
    var isSecondLanding = (data.goal !== undefined || data.income !== undefined || data.targetSheet === "Leads_Finance100k");

    if (isSecondLanding) {
      // ==========================================
      // ЛОГІКА ДЛЯ ДРУГОГО ЛЕНДІНГУ (Анкети)
      // ==========================================
      var sheetName2 = "Анкети після уроку";
      var sheet2 = ss.getSheetByName(sheetName2);

      // Створюємо лист, якщо його ще немає
      if (!sheet2) {
        sheet2 = ss.insertSheet(sheetName2);
        sheet2.appendRow([
          "Дата та час",
          "Ім'я",
          "Телефон",
          "Рівень доходу",
          "Борги/Кредити",
          "Термін (до 100k$)",
          "Головна ціль",
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "utm_content",
          "utm_term"
        ]);
        sheet2.getRange("A1:L1").setFontWeight("bold"); // Жирний шрифт для заголовків
      }

      var rowData2 = [
        new Date(),
        data.name || "",
        data.phone || "",
        data.income || "",
        data.debt || "",
        data.timeline || "",
        data.goal || "",
        data.utm_source || data.source || "", // Підтримка різних форматів utm
        data.utm_medium || data.medium || "",
        data.utm_campaign || data.campaign || "",
        data.utm_content || data.content || "",
        data.utm_term || data.term || ""
      ];

      // Записуємо анкету
      sheet2.appendRow(rowData2);

    } else {
      // ==========================================
      // ЛОГІКА ДЛЯ ПЕРШОГО ЛЕНДІНГУ (Тільки заявки)
      // ==========================================
      var sheetName1 = "Заявки на урок";
      var sheet1 = ss.getSheetByName(sheetName1);

      // Створюємо лист, якщо його ще немає
      if (!sheet1) {
        sheet1 = ss.insertSheet(sheetName1);
        sheet1.appendRow([
          "Дата та час",
          "Ім'я",
          "Телефон",
          "utm_source",
          "utm_medium",
          "utm_campaign",
          "utm_content",
          "utm_term"
        ]);
        sheet1.getRange("A1:H1").setFontWeight("bold");
      }

      var rowData1 = [
        new Date(),
        data.name || "",
        data.phone || "",
        data.source || data.utm_source || "",
        data.medium || data.utm_medium || "",
        data.campaign || data.utm_campaign || "",
        data.content || data.utm_content || "",
        data.term || data.utm_term || ""
      ];

      // Записуємо лід
      sheet1.appendRow(rowData1);
    }

    // 4. Повертаємо успішну відповідь на сайт
    return ContentService.createTextOutput(JSON.stringify({ "result": "success" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "result": "error", "error": error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}