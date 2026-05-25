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

      try {
        recordGlobalTraffic(ss, data);
      } catch (err) {
        logError(ss, "recordGlobalTraffic Error: " + err.message);
      }
      
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

function ensureHeader(sheet, headerName) {
  var values = sheet.getDataRange().getValues();
  var headers = values[0] || [];
  var idx = headers.indexOf(headerName);
  if (idx === -1) {
    sheet.getRange(1, headers.length + 1).setValue(headerName);
    sheet.getRange(1, headers.length + 1).setFontWeight("bold");
    return headers.length;
  }
  return idx;
}

function getSiteNameFromPath(path) {
  if (!path) return "Головний сайт";
  var p = path.toLowerCase();
  if (p.indexOf("web") !== -1 || p.indexOf("webinar") !== -1) return "Вебінар";
  if (p.indexOf("intensive") !== -1 || p.indexOf("minicourse") !== -1) return "Практикум";
  if (p.indexOf("vsl") !== -1) return "VSL Трафик";
  if (p.indexOf("lesson") !== -1 || p.indexOf("vls") !== -1) return "VLS Урок";
  if (p.indexOf("pre") !== -1) return "Броні";
  return "Головний сайт";
}

function getSiteNameFromSheet(sheetName) {
  if (sheetName === "Лиды Вебинар") return "Вебінар";
  if (sheetName === "Заявки на практикум") return "Практикум";
  if (sheetName === "VSL Трафик") return "VSL Трафик";
  if (sheetName === "VLS Урок") return "VLS Урок";
  if (sheetName === "Броні Предзапис") return "Броні";
  return sheetName || "Головний сайт";
}

function recordGlobalTraffic(ss, data) {
  var sheet = ss.getSheetByName("Аналітика Ліди");
  if (!sheet) {
    sheet = ss.insertSheet("Аналітика Ліди");
    var initialHeaders = ["Дата", "Ім'я", "Телефон", "Telegram", "Тариф", "Номер замовлення", "Статус", "Джерело", "Visitor ID", "Customer Journey", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "Коментар"];
    sheet.appendRow(initialHeaders);
    sheet.getRange(1, 1, 1, initialHeaders.length).setFontWeight("bold");
  }

  var siteName = getSiteNameFromPath(data.path);
  var visitedColName = "Заходив на " + siteName;
  var registeredColName = "Зареєстрований на " + siteName;
  
  ensureHeader(sheet, visitedColName);
  ensureHeader(sheet, registeredColName);
  ensureHeader(sheet, "Коментар");

  var values = sheet.getDataRange().getValues();
  var headers = values[0];
  
  var visitorColIdx = headers.indexOf("Visitor ID");
  var journeyColIdx = headers.indexOf("Customer Journey");
  var dateColIdx = headers.indexOf("Дата");
  var visitedColIdx = headers.indexOf(visitedColName);
  var registeredColIdx = headers.indexOf(registeredColName);
  var nameColIdx = headers.indexOf("Ім'я");
  var sourceColIdx = headers.indexOf("Джерело");
  
  var visitorId = (data.visitorId || "").toString().trim();
  if (!visitorId || visitorId === "anonymous") return;

  var foundRowIdx = -1;
  for (var i = 1; i < values.length; i++) {
    var rowVisitorId = (values[i][visitorColIdx] || "").toString().trim();
    if (rowVisitorId === visitorId) {
      foundRowIdx = i;
      break;
    }
  }

  var pathInfo = data.path || "";
  if (data.utm_source) {
    pathInfo += " (utm: " + data.utm_source + ")";
  }

  if (foundRowIdx !== -1) {
    sheet.getRange(foundRowIdx + 1, dateColIdx + 1).setValue(new Date());
    sheet.getRange(foundRowIdx + 1, visitedColIdx + 1).setValue("Так");
    
    var regCell = sheet.getRange(foundRowIdx + 1, registeredColIdx + 1);
    if (!regCell.getValue()) {
      regCell.setValue("Ні");
    }

    var existingJourney = values[foundRowIdx][journeyColIdx] || "";
    var updatedJourney = existingJourney;
    if (pathInfo && existingJourney.indexOf(pathInfo) === -1) {
      updatedJourney = (existingJourney ? existingJourney + " | " : "") + pathInfo;
    }
    sheet.getRange(foundRowIdx + 1, journeyColIdx + 1).setValue(updatedJourney);

    var sourceCell = sheet.getRange(foundRowIdx + 1, sourceColIdx + 1);
    if (!sourceCell.getValue()) {
      sourceCell.setValue("Трафік");
    }
  } else {
    var rowData = [];
    for (var j = 0; j < headers.length; j++) {
      var hName = headers[j];
      if (j === dateColIdx) rowData.push(new Date());
      else if (j === nameColIdx) rowData.push("Анонім");
      else if (j === visitorColIdx) rowData.push(visitorId);
      else if (j === journeyColIdx) rowData.push(pathInfo);
      else if (j === visitedColIdx) rowData.push("Так");
      else if (j === registeredColIdx) rowData.push("Ні");
      else if (hName === "Джерело") rowData.push("Трафік");
      else if (hName.indexOf("Зареєстрований на") === 0) rowData.push("Ні");
      else if (hName.indexOf("Заходив на") === 0) {
        if (hName === visitedColName) rowData.push("Так");
        else rowData.push("Ні");
      }
      else if (hName === "utm_source") rowData.push(data.utm_source || "");
      else if (hName === "utm_medium") rowData.push(data.utm_medium || "");
      else if (hName === "utm_campaign") rowData.push(data.utm_campaign || "");
      else rowData.push("");
    }
    sheet.appendRow(rowData);
  }
}

function recordGlobalLead(ss, data, sourceSheetName) {
  var sheet = ss.getSheetByName("Аналітика Ліди");
  if (!sheet) {
    sheet = ss.insertSheet("Аналітика Ліди");
    var initialHeaders = ["Дата", "Ім'я", "Телефон", "Telegram", "Тариф", "Номер замовлення", "Статус", "Джерело", "Visitor ID", "Customer Journey", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "Коментар"];
    sheet.appendRow(initialHeaders);
    sheet.getRange(1, 1, 1, initialHeaders.length).setFontWeight("bold");
  }

  var siteName = getSiteNameFromSheet(sourceSheetName);
  var visitedColName = "Заходив на " + siteName;
  var registeredColName = "Зареєстрований на " + siteName;

  ensureHeader(sheet, visitedColName);
  ensureHeader(sheet, registeredColName);
  ensureHeader(sheet, "Коментар");

  var values = sheet.getDataRange().getValues();
  var headers = values[0];

  var phoneCol = headers.indexOf("Телефон");
  var tgCol = headers.indexOf("Telegram");
  var visitorCol = headers.indexOf("Visitor ID");
  var journeyCol = headers.indexOf("Customer Journey");
  var dateCol = headers.indexOf("Дата");
  var sourceCol = headers.indexOf("Джерело");
  var nameCol = headers.indexOf("Ім'я");
  var tariffCol = headers.indexOf("Тариф");
  var orderCol = headers.indexOf("Номер замовлення");
  var statusCol = headers.indexOf("Статус");
  var visitedColIdx = headers.indexOf(visitedColName);
  var registeredColIdx = headers.indexOf(registeredColName);

  var inputPhone = (data.phone || "").toString().replace(/\D/g, '');
  var inputTg = (data.telegram || "").toString().toLowerCase().replace('@', '').trim();
  var inputVisitorId = (data.visitorId || "").toString().trim();
  
  var foundRowIdx = -1;

  if (inputPhone.length >= 9 || inputTg.length > 2) {
    for (var i = 1; i < values.length; i++) {
      var rowPhone = (values[i][phoneCol] || "").toString().replace(/\D/g, '');
      var rowTg = (values[i][tgCol] || "").toString().toLowerCase().replace('@', '').trim();
      
      var match = false;
      if (inputPhone.length >= 9 && rowPhone.endsWith(inputPhone.slice(-9))) match = true;
      if (inputTg && rowTg === inputTg) match = true;

      if (match) {
        foundRowIdx = i + 1;
        break;
      }
    }
  }

  if (foundRowIdx === -1 && inputVisitorId && inputVisitorId !== "anonymous") {
    for (var i = 1; i < values.length; i++) {
      var rowVisitorId = (values[i][visitorCol] || "").toString().trim();
      if (rowVisitorId === inputVisitorId) {
        foundRowIdx = i + 1;
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

  if (foundRowIdx !== -1) {
    sheet.getRange(foundRowIdx, dateCol + 1).setValue(new Date());
    
    var existingName = values[foundRowIdx - 1][nameCol] || "";
    if (existingName === "Анонім" || !existingName) {
      sheet.getRange(foundRowIdx, nameCol + 1).setValue(data.name || "Учасник");
    }

    if (data.phone) {
      sheet.getRange(foundRowIdx, phoneCol + 1).setValue(data.phone);
    }
    if (data.telegram) {
      sheet.getRange(foundRowIdx, tgCol + 1).setValue(data.telegram);
    }

    var existingVisitorId = values[foundRowIdx - 1][visitorCol] || "";
    if (inputVisitorId && existingVisitorId !== inputVisitorId) {
      sheet.getRange(foundRowIdx, visitorCol + 1).setValue(inputVisitorId);
    }

    if (data.tariff) {
      sheet.getRange(foundRowIdx, tariffCol + 1).setValue(data.tariff);
    }
    if (data.orderId) {
      sheet.getRange(foundRowIdx, orderCol + 1).setValue((data.orderId || "").toString().trim());
    }
    
    var existingStatus = values[foundRowIdx - 1][statusCol] || "";
    if (!existingStatus || existingStatus === "—" || existingStatus === "Не оплачено") {
      sheet.getRange(foundRowIdx, statusCol + 1).setValue(sourceSheetName === "Лиды Вебинар" ? "—" : "Не оплачено");
    }

    sheet.getRange(foundRowIdx, visitedColIdx + 1).setValue("Так");
    sheet.getRange(foundRowIdx, registeredColIdx + 1).setValue("Так");

    var existingJourney = values[foundRowIdx - 1][journeyCol] || "";
    var updatedJourney = existingJourney;
    if (newJourney && existingJourney.indexOf(newJourney) === -1) {
      updatedJourney = (existingJourney ? existingJourney + " | " : "") + newJourney;
    }
    sheet.getRange(foundRowIdx, journeyCol + 1).setValue(updatedJourney);

    var existingSource = values[foundRowIdx - 1][sourceCol] || "";
    if (existingSource.indexOf(sourceSheetName) === -1) {
      sheet.getRange(foundRowIdx, sourceCol + 1).setValue(existingSource === "Трафік" ? sourceSheetName : existingSource + ", " + sourceSheetName);
    }

    if (extraComment) {
      var commentColIdx = headers.indexOf("Коментар");
      if (commentColIdx !== -1) {
        var existingComment = values[foundRowIdx - 1][commentColIdx] || "";
        sheet.getRange(foundRowIdx, commentColIdx + 1).setValue(existingComment + (existingComment ? "\n" : "") + extraComment);
      }
    }
  } else {
    var rowData = [];
    for (var j = 0; j < headers.length; j++) {
      var hName = headers[j];
      if (j === dateCol) rowData.push(new Date());
      else if (j === nameCol) rowData.push(data.name || "Учасник");
      else if (j === phoneCol) rowData.push(data.phone || "");
      else if (j === tgCol) rowData.push(data.telegram || "");
      else if (j === tariffCol) rowData.push(data.tariff || (sourceSheetName === "Лиды Вебинар" ? "Вебінар" : ""));
      else if (j === orderCol) rowData.push((data.orderId || "").toString().trim());
      else if (j === statusCol) rowData.push(sourceSheetName === "Лиды Вебинар" ? "—" : "Не оплачено");
      else if (j === sourceCol) rowData.push(sourceSheetName);
      else if (j === visitorCol) rowData.push(inputVisitorId);
      else if (j === journeyCol) rowData.push(newJourney);
      else if (j === visitedColIdx) rowData.push("Так");
      else if (j === registeredColIdx) rowData.push("Так");
      else if (hName.indexOf("Зареєстрований на") === 0) {
        if (hName === registeredColName) rowData.push("Так");
        else rowData.push("Ні");
      }
      else if (hName.indexOf("Заходив на") === 0) {
        if (hName === visitedColName) rowData.push("Так");
        else rowData.push("Ні");
      }
      else if (hName === "utm_source") rowData.push(data.utm_source || "");
      else if (hName === "utm_medium") rowData.push(data.utm_medium || "");
      else if (hName === "utm_campaign") rowData.push(data.utm_campaign || "");
      else if (hName === "utm_content") rowData.push(data.utm_content || "");
      else if (hName === "utm_term") rowData.push(data.utm_term || "");
      else if (hName === "Коментар") rowData.push(extraComment);
      else rowData.push("");
    }
    sheet.appendRow(rowData);
  }
}