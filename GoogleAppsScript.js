function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // ==========================================
    // 1. ЛОГІКА ОНОВЛЕННЯ ПОЛІВ (Статус, Коментар)
    // ==========================================
    if (data.action === 'update_status' || data.action === 'update_comment' || (data.orderId && !data.name)) {
      var inputSheetName = data.targetSheet || "Заявки на практикум";
      var sheetName = inputSheetName;
      
      // Нормалізуємо назви листів
      if (inputSheetName === "Sofia_Invest" || inputSheetName === "VSL Трафик") {
        sheetName = "VSL Трафик";
      } else if (inputSheetName === "Sofia_Invest_Lesson" || inputSheetName === "VLS Урок") {
        sheetName = "VLS Урок";
      } else if (inputSheetName === "Заявки Вебінар" || inputSheetName === "Лиды Вебинар") {
        sheetName = "Лиды Вебинар";
      }

      var targetOrderId = (data.orderId || "").toString().trim();
      var fieldName = data.action === 'update_comment' ? "Коментар" : "Статус";
      var newValue = data.action === 'update_comment' ? data.comment : (data.status || "Оплачено");
      var found = false;

      // 1. Оновлення у відповідному листі
      var sheet;
      var sheets = ss.getSheets();
      
      if (sheetName === "Броні Предзапис") {
        for (var idx = 0; idx < sheets.length; idx++) {
          if (sheets[idx].getSheetId() == 139613373) {
            sheet = sheets[idx];
            break;
          }
        }
      } else if (sheetName === "Заявки на практикум") {
        for (var idx = 0; idx < sheets.length; idx++) {
          if (sheets[idx].getSheetId() == 1109800626) {
            sheet = sheets[idx];
            break;
          }
        }
      } else if (sheetName === "Лиды Вебинар") {
        for (var idx = 0; idx < sheets.length; idx++) {
          if (sheets[idx].getSheetId() == 325595402) {
            sheet = sheets[idx];
            break;
          }
        }
      } else if (sheetName === "VSL Трафик") {
        for (var idx = 0; idx < sheets.length; idx++) {
          if (sheets[idx].getSheetId() == 1155232133) {
            sheet = sheets[idx];
            break;
          }
        }
      } else if (sheetName === "VLS Урок") {
        for (var idx = 0; idx < sheets.length; idx++) {
          if (sheets[idx].getSheetId() == 1865429296) {
            sheet = sheets[idx];
            break;
          }
        }
      } else {
        sheet = ss.getSheetByName(sheetName);
      }

      if (sheet) {
        found = updateFieldInSheet(sheet, targetOrderId, fieldName, newValue);
      }

      // 2. Також оновлюємо у глобальному листі Аналітики
      var globalSheet = ss.getSheetByName("Аналітика Ліди");
      if (globalSheet) {
        updateFieldInSheet(globalSheet, targetOrderId, fieldName, newValue);
      }

      return ContentService.createTextOutput(JSON.stringify({ "result": "success", "found": found })).setMimeType(ContentService.MimeType.JSON);
    }

    // ==========================================
    // 2. ЛОГІКА СТВОРЕННЯ ЛІДА
    // ==========================================
    if (data.action === 'create_lead' || data.targetSheet) {
      var sheet;
      var inputSheetName = data.targetSheet || "Заявки на практикум";
      var sheetName = inputSheetName;
      
      // Нормалізуємо назви листів
      if (inputSheetName === "Sofia_Invest" || inputSheetName === "VSL Трафик") {
        sheetName = "VSL Трафик";
      } else if (inputSheetName === "Sofia_Invest_Lesson" || inputSheetName === "VLS Урок") {
        sheetName = "VLS Урок";
      } else if (inputSheetName === "Заявки Вебінар" || inputSheetName === "Лиды Вебинар") {
        sheetName = "Лиды Вебинар";
      }

      var isWebinar = sheetName === "Лиды Вебинар";

      var sheets = ss.getSheets();
      if (sheetName === "Лиды Вебинар") {
        for (var i = 0; i < sheets.length; i++) {
          if (sheets[i].getSheetId() == 325595402) {
            sheet = sheets[i];
            break;
          }
        }
      } else if (sheetName === "Броні Предзапис") {
        for (var i = 0; i < sheets.length; i++) {
          if (sheets[i].getSheetId() == 139613373) {
            sheet = sheets[i];
            break;
          }
        }
      } else if (sheetName === "Заявки на практикум") {
        for (var i = 0; i < sheets.length; i++) {
          if (sheets[i].getSheetId() == 1109800626) {
            sheet = sheets[i];
            break;
          }
        }
      } else if (sheetName === "VSL Трафик") {
        for (var i = 0; i < sheets.length; i++) {
          if (sheets[i].getSheetId() == 1155232133) {
            sheet = sheets[i];
            break;
          }
        }
      } else if (sheetName === "VLS Урок") {
        for (var i = 0; i < sheets.length; i++) {
          if (sheets[i].getSheetId() == 1865429296) {
            sheet = sheets[i];
            break;
          }
        }
      }

      if (!sheet) {
        sheet = ss.getSheetByName(sheetName);
        if (!sheet) {
          sheet = ss.insertSheet(sheetName);
        }
      }

      // Визначаємо точний порядок колонок та значення відповідно до кожного листа
      var headers = [];
      var rowData = [];

      if (sheetName === "Заявки на практикум") {
        headers = ["Дата", "Ім'я", "Телефон", "Телеграм", "Тариф", "Номер заказу", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "Статус Оплати"];
        rowData = [
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
      } else if (sheetName === "Броні Предзапис") {
        headers = ["Дата та час", "Ім'я", "Телефон", "Telegram", "Тариф", "Номер замовлення", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "Статус Броні"];
        rowData = [
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
      } else if (sheetName === "Лиды Вебинар") {
        headers = ["Дата", "Ім'я", "Телефон", "Телеграм", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
        rowData = [
          new Date(),
          data.name || "",
          data.phone || "",
          data.telegram || "",
          data.utm_source || "",
          data.utm_medium || "",
          data.utm_campaign || "",
          data.utm_content || "",
          data.utm_term || ""
        ];
      } else if (sheetName === "VSL Трафик") {
        headers = ["Дата та час", "Ім'я", "Телефон", "Telegram", "Тариф", "Номер замовлення", "Статус оплати", "Visitor ID", "Customer Journey", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
        rowData = [
          new Date(),
          data.name || "",
          data.phone || "",
          data.telegram || "",
          data.tariff || "",
          (data.orderId || "").toString().trim(),
          "Не оплачено",
          data.visitorId || "",
          data.journey || "",
          data.utm_source || "",
          data.utm_medium || "",
          data.utm_campaign || "",
          data.utm_content || "",
          data.utm_term || ""
        ];
      } else if (sheetName === "VLS Урок") {
        headers = ["Дата та час", "Ім'я", "Телефон", "Дохід", "Борги", "Термін", "Ціль", "Visitor ID", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
        rowData = [
          new Date(),
          data.name || "",
          data.phone || "",
          data.income || "",
          data.debt || "",
          data.timeline || "",
          data.goal || "",
          data.visitorId || "",
          data.utm_source || "",
          data.utm_medium || "",
          data.utm_campaign || "",
          data.utm_content || "",
          data.utm_term || ""
        ];
      } else {
        // Fallback за замовчуванням
        headers = ["Дата та час", "Ім'я", "Телефон", "Telegram", "Тариф", "Номер замовлення", "Статус оплати", "Visitor ID", "Customer Journey", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
        rowData = [
          new Date(),
          data.name || "",
          data.phone || "",
          data.telegram || "",
          data.tariff || "",
          (data.orderId || "").toString().trim(),
          "Не оплачено",
          data.visitorId || "",
          data.journey || "",
          data.utm_source || "",
          data.utm_medium || "",
          data.utm_campaign || "",
          data.utm_content || "",
          data.utm_term || ""
        ];
      }

      // Створення заголовків, якщо лист порожній
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      }

      // ==========================================
      // 2.2. ЗБЕРЕЖЕННЯ В ЛИСТ ТА ГЛОБАЛЬНУ АНАЛІТИКУ
      // ==========================================
      var alreadyProcessed = false;
      var cleanInputPhone = (data.phone || "").toString().replace(/\D/g, '');

      // Відключаємо дедуплікацію для анкети "VLS Урок"
      if (sheetName !== "VLS Урок" && cleanInputPhone.length >= 9) {
        var values = sheet.getDataRange().getValues();
        if (values.length > 0) {
          var currentHeaders = values[0];
          var phoneColIdx = -1;
          var statusColIdx = -1;
          var tariffColIdx = -1;
          var amountColIdx = -1;
          var attemptsColIdx = -1;

          for (var k = 0; k < currentHeaders.length; k++) {
            var h = currentHeaders[k].toString().toLowerCase();
            if (h.indexOf("телефон") !== -1) phoneColIdx = k;
            if (h.indexOf("статус") !== -1) statusColIdx = k;
            if (h.indexOf("тариф") !== -1) tariffColIdx = k;
            if (h.indexOf("сума") !== -1) amountColIdx = k;
            if (h.indexOf("спроб") !== -1) attemptsColIdx = k;
          }

          if (phoneColIdx !== -1) {
            var suffix = cleanInputPhone.slice(-9);
            for (var i = 1; i < values.length; i++) {
              var rowPhone = (values[i][phoneColIdx] || "").toString().replace(/\D/g, '');
              if (rowPhone.length >= 9 && rowPhone.endsWith(suffix)) {
                
                // Перевірка статусу оплати
                if (!isWebinar && statusColIdx !== -1) {
                  var currentStatus = (values[i][statusColIdx] || "").toString().toLowerCase();
                  if (currentStatus.indexOf("оплачено") !== -1 || currentStatus.indexOf("paid") !== -1) {
                    alreadyProcessed = true;
                    break;
                  }
                }

                sheet.getRange(i + 1, 1).setValue(new Date());

                if (isWebinar) {
                  if (attemptsColIdx === -1) {
                    attemptsColIdx = currentHeaders.length;
                    sheet.getRange(1, attemptsColIdx + 1).setValue("Кількість спроб");
                    sheet.getRange(1, attemptsColIdx + 1).setFontWeight("bold");
                  }
                  var currentAttempts = values[i][attemptsColIdx];
                  var nextAttempts = (currentAttempts && !isNaN(currentAttempts)) ? Number(currentAttempts) + 1 : 2;
                  sheet.getRange(i + 1, attemptsColIdx + 1).setValue(nextAttempts);
                }
                
                alreadyProcessed = true;
                break;
              }
            }
          }
        }
      }

      if (!alreadyProcessed) {
        sheet.appendRow(rowData);
      }

      // Глобальний запис
      recordGlobalLead(ss, data, sheetName);

      return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // ==========================================
    // 3. ЛОГІКА ЛОГУВАННЯ ТРАФІКУ (ANONYMOUS & EVERY PATH)
    // ==========================================
    if (data.action === 'log_traffic') {
      var trafficSheet = ss.getSheetByName("Traffic_Logs");
      if (!trafficSheet) {
        trafficSheet = ss.insertSheet("Traffic_Logs");
        trafficSheet.appendRow(["Дата та час", "Visitor ID", "Шлях", "IP", "User Agent", "UTM Source", "UTM Medium", "UTM Campaign"]);
        trafficSheet.getRange(1, 1, 1, 8).setFontWeight("bold");
      }
      
      trafficSheet.appendRow([
        new Date(),
        data.visitorId || "anonymous",
        data.path || "",
        data.ip || "",
        data.userAgent || "",
        data.utm_source || "",
        data.utm_medium || "",
        data.utm_campaign || ""
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
    }

    // ==========================================
    // 4. ЛОГІКА ОНОВЛЕННЯ ЛІДА (ДЛЯ АДМІНКИ)
    // ==========================================
    if (data.action === 'update_lead_data') {
      var sheetName = data._sheet;
      var identifier = (data["Номер замовлення"] || data["Visitor ID"] || "").toString().trim();
      var updates = data.updates || {};
      
      var sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        var vals = sheet.getDataRange().getValues();
        if (vals.length > 0) {
          var headers = vals[0];
          var found = false;

          for (var i = 1; i < vals.length; i++) {
            var isTarget = false;
            for (var j = 0; j < vals[i].length; j++) {
              if (vals[i][j].toString().trim() === identifier) {
                isTarget = true;
                break;
              }
            }

            if (isTarget) {
              for (var key in updates) {
                var colIdx = headers.indexOf(key);
                if (colIdx !== -1) {
                  sheet.getRange(i + 1, colIdx + 1).setValue(updates[key]);
                }
              }
              found = true;
              break;
            }
          }
          if (found) {
            return ContentService.createTextOutput(JSON.stringify({ "result": "success" })).setMimeType(ContentService.MimeType.JSON);
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ "result": "not_found" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'get_admin_data') {
      var result = {
        leads: [],
        traffic: [],
        summary: {}
      };
      
      var headerMap = {
        "дата": "date", "дата та час": "date",
        "ім'я": "name", "имя": "name", "имя ": "name", "fio": "name", "фіо": "name",
        "телефон": "phone", "номер телефона": "phone", "тел": "phone", "mob": "phone",
        "телеграм": "telegram", "telegram": "telegram", "телега": "telegram", "тг": "telegram",
        "тариф": "tariff", "пакет": "tariff",
        "номер замовлення": "orderId", "номер заказу": "orderId", "id замовлення": "orderId",
        "статус оплати": "status", "статус": "status", "статус броні": "status",
        "visitor id": "visitorId",
        "customer journey": "journey",
        "utm source": "utm_source", "utm_source": "utm_source", "сурз": "utm_source", "сурсе": "utm_source", "сурс": "utm_source", "source": "utm_source",
        "utm medium": "utm_medium", "utm_medium": "utm_medium", "сеть": "utm_medium", "medium": "utm_medium",
        "utm campaign": "utm_campaign", "utm_campaign": "utm_campaign", "кампания": "utm_campaign", "campaign": "utm_campaign",
        "utm content": "utm_content", "utm_content": "utm_content", "контент": "utm_content", "content": "utm_content",
        "utm term": "utm_term", "utm_term": "utm_term", "term": "utm_term"
      };

      var allSheets = ss.getSheets();
      allSheets.forEach(function(s) {
        var name = s.getName();
        if (name === "Traffic_Logs" || name === "System_Logs" || name === "Errors" || name === "Analytics") return;
        
        var vals = s.getDataRange().getValues();
        if (vals.length > 1) {
          var headers = vals[0];
          for (var i = 1; i < vals.length; i++) {
            var obj = { _sheet: name, _originalData: {} };
            for (var j = 0; j < headers.length; j++) {
              var hStr = (headers[j] || "").toString().toLowerCase().trim();
              var normalizedKey = headerMap[hStr] || hStr;
              obj[normalizedKey] = vals[i][j];
              obj._originalData[headers[j]] = vals[i][j];
            }
            if (obj.phone || obj.name || obj.telegram || obj.orderId || obj.visitorId) {
              result.leads.push(obj);
            }
          }
        }
      });
      
      var ts = ss.getSheetByName("Traffic_Logs");
      if (ts) {
        var tvals = ts.getDataRange().getValues();
        if (tvals.length > 1) {
          var theaders = tvals[0];
          var startRow = Math.max(1, tvals.length - 500);
          for (var i = startRow; i < tvals.length; i++) {
            var tobj = {};
            for (var j = 0; j < theaders.length; j++) {
              var tHeader = (theaders[j] || "").toString().toLowerCase().trim();
              var tKey = headerMap[tHeader] || tHeader;
              tobj[tKey] = tvals[i][j];
            }
            result.traffic.push(tobj);
          }
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ "result": "unknown_action" })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    logError(SpreadsheetApp.getActiveSpreadsheet(), "Global Error: " + error.message);
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
  } catch (e) { }
}

function updateFieldInSheet(sheet, targetOrderId, fieldName, newValue) {
  var values = sheet.getDataRange().getValues();
  if (values.length === 0) return false;
  
  var headers = values[0];
  var targetColIdx = -1;
  var orderColIdx = -1;

  for (var k = 0; k < headers.length; k++) {
    var h = headers[k].toString().toLowerCase().trim();
    if (h.indexOf(fieldName.toLowerCase()) !== -1) targetColIdx = k;
    if (h.indexOf("замовлення") !== -1 || h.indexOf("заказу") !== -1 || h.indexOf("order") !== -1) orderColIdx = k;
  }

  if (targetColIdx === -1 && fieldName.toLowerCase().indexOf("коментар") !== -1) {
    targetColIdx = headers.length;
    sheet.getRange(1, targetColIdx + 1).setValue("Коментар");
  }

  if (targetColIdx === -1) return false;

  for (var i = 1; i < values.length; i++) {
    var match = false;
    if (orderColIdx !== -1) {
      if (values[i][orderColIdx].toString().trim() === targetOrderId) match = true;
    } else {
      for (var j = 0; j < values[i].length; j++) {
        if (values[i][j].toString().trim() === targetOrderId) { match = true; break; }
      }
    }

    if (match) {
      sheet.getRange(i + 1, targetColIdx + 1).setValue(newValue);
      return true;
    }
  }
  return false;
}

function recordGlobalLead(ss, data, sourceSheetName) {
  var sheet = ss.getSheetByName("Аналітика Ліди");
  if (!sheet) {
    sheet = ss.insertSheet("Аналітика Ліди");
    var headers = ["Дата", "Ім'я", "Телефон", "Telegram", "Тариф", "Номер замовлення", "Статус", "Джерело", "Visitor ID", "Customer Journey", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "Коментар"];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
  }

  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  
  if (headers.indexOf("Коментар") === -1) {
    sheet.getRange(1, headers.length + 1).setValue("Коментар");
    headers.push("Коментар");
    values[0].push("Коментар");
  }

  var phoneCol = headers.indexOf("Телефон");
  var tgCol = headers.indexOf("Telegram");
  var journeyCol = headers.indexOf("Customer Journey");
  var dateCol = headers.indexOf("Дата");
  var sourceCol = headers.indexOf("Джерело");

  var inputPhone = (data.phone || "").toString().replace(/\D/g, '');
  var inputTg = (data.telegram || "").toString().toLowerCase().replace('@', '').trim();
  var foundRow = -1;

  if (inputPhone.length >= 9 || inputTg.length > 2) {
    for (var i = 1; i < values.length; i++) {
      var rowPhone = (values[i][phoneCol] || "").toString().replace(/\D/g, '');
      var rowTg = (values[i][tgCol] || "").toString().toLowerCase().replace('@', '').trim();
      
      var match = false;
      if (inputPhone.length >= 9 && rowPhone.endsWith(inputPhone.slice(-9))) match = true;
      if (inputTg && rowTg === inputTg) match = true;

      if (match) {
        foundRow = i + 1;
        break;
      }
    }
  }

  var newJourney = data.journey || "";
  
  var extraComment = data.comment || "";
  if (data.income) extraComment += "Дохід: " + data.income + "\n";
  if (data.debt) extraComment += "Борги: " + data.debt + "\n";
  if (data.timeline) extraComment += "Термін: " + data.timeline + "\n";
  if (data.goal) extraComment += "Ціль: " + data.goal + "\n";
  extraComment = extraComment.trim();

  if (foundRow !== -1) {
    var existingJourney = values[foundRow - 1][journeyCol] || "";
    var updatedJourney = existingJourney;
    
    if (newJourney && existingJourney.indexOf(newJourney) === -1) {
      updatedJourney = (existingJourney ? existingJourney + " | " : "") + newJourney;
    }
    
    sheet.getRange(foundRow, dateCol + 1).setValue(new Date());
    sheet.getRange(foundRow, journeyCol + 1).setValue(updatedJourney);
    
    var existingSource = values[foundRow - 1][sourceCol] || "";
    if (existingSource.indexOf(sourceSheetName) === -1) {
      sheet.getRange(foundRow, sourceCol + 1).setValue(existingSource + ", " + sourceSheetName);
    }

    if (extraComment) {
      var commentCol = headers.indexOf("Коментар");
      if (commentCol !== -1) {
        var existingComment = values[foundRow - 1][commentCol] || "";
        sheet.getRange(foundRow, commentCol + 1).setValue(existingComment + (existingComment ? "\n" : "") + extraComment);
      }
    }
  } else {
    var rowData = [
      new Date(),
      data.name || "",
      data.phone || "",
      data.telegram || "",
      data.tariff || (sourceSheetName === "Лиды Вебинар" ? "Вебінар" : ""),
      (data.orderId || "").toString().trim(),
      (sourceSheetName === "Лиды Вебинар" ? "—" : "Не оплачено"),
      sourceSheetName,
      data.visitorId || "",
      newJourney,
      data.utm_source || "",
      data.utm_medium || "",
      data.utm_campaign || "",
      data.utm_content || "",
      data.utm_term || "",
      extraComment
    ];
    sheet.appendRow(rowData);
  }
}