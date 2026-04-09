/**
 * MR面談予約システム - Google Apps Script
 * 説明会（1枠20分）とアポイント（10分×3枠）に対応
 */

var DEFAULT_CONFIG = {
  presentationDays: [1, 2, 3, 4, 5],
  appointmentDays: [1, 2, 3, 4, 5],
  presentationSlots: [
    { start: '13:00', end: '13:20' },
  ],
  presentationDuration: 20,
  appointmentTimes: ['13:00', '13:10', '13:20'],
  appointmentDuration: 10,
};

function getConfig() {
  var props = PropertiesService.getScriptProperties();
  var saved = props.getProperty('CONFIG');
  if (saved) {
    try { return JSON.parse(saved); } catch (e) {}
  }
  return DEFAULT_CONFIG;
}

function saveConfig(config) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty('CONFIG', JSON.stringify(config));
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var action = e.parameter.action || 'dates';
  var config = getConfig();
  try {
    if (action === 'dates') {
      var type = e.parameter.type || 'appointment';
      return createJsonResponse({ dates: getAvailableDates(config, type) });
    }
    if (action === 'slots') {
      var dateStr = e.parameter.date;
      var type = e.parameter.type || 'appointment';
      if (!dateStr) return createJsonResponse({ error: '日付を指定してください' });
      return createJsonResponse({ slots: getAvailableSlots(dateStr, type, config) });
    }
    if (action === 'settings') {
      return createJsonResponse({
        presentationDays: config.presentationDays,
        appointmentDays: config.appointmentDays,
        presentationSlots: config.presentationSlots,
        presentationDuration: config.presentationDuration,
        appointmentTimes: config.appointmentTimes,
        appointmentDuration: config.appointmentDuration,
      });
    }
    return createJsonResponse({ error: '不明なアクションです' });
  } catch (err) {
    return createJsonResponse({ error: err.message });
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    if (data.action === 'updateSettings') {
      var config = getConfig();
      if (data.presentationDays) config.presentationDays = data.presentationDays;
      if (data.appointmentDays) config.appointmentDays = data.appointmentDays;
      if (data.presentationSlots) config.presentationSlots = data.presentationSlots;
      if (data.presentationDuration) config.presentationDuration = data.presentationDuration;
      if (data.appointmentTimes) config.appointmentTimes = data.appointmentTimes;
      if (data.appointmentDuration) config.appointmentDuration = data.appointmentDuration;
      saveConfig(config);
      return createJsonResponse({ success: true, config: config });
    }

    // 予約作成
    var start = data.start, end = data.end;
    var companyName = data.companyName, contactName = data.contactName;
    var email = data.email, phone = data.phone, purpose = data.purpose;
    var bookingType = data.bookingType || 'appointment';
    if (!start || !end || !companyName || !contactName || !email || !phone || !purpose) {
      return createJsonResponse({ error: '全ての項目を入力してください' });
    }
    var calendar = CalendarApp.getCalendarById('primary');
    if (!calendar) return createJsonResponse({ error: 'カレンダーが見つかりません' });
    var startDate = new Date(start);
    var endDate = new Date(end);
    var existingEvents = calendar.getEvents(startDate, endDate);
    if (existingEvents.length > 0) {
      return createJsonResponse({ error: 'この時間帯は既に予約されています' });
    }
    var typeLabel = bookingType === 'presentation' ? '説明会' : 'アポイント';
    var title = '【MR' + typeLabel + '】' + companyName + ' - ' + contactName;
    var description = '種別: ' + typeLabel + '\n会社名: ' + companyName + '\n担当者: ' + contactName + '\nメール: ' + email + '\n電話番号: ' + phone + '\n内容: ' + purpose;
    var event = calendar.createEvent(title, startDate, endDate, { description: description });

    // メール送信
    var dateStr = Utilities.formatDate(startDate, 'Asia/Tokyo', 'yyyy年M月d日(E)');
    var timeStr = Utilities.formatDate(startDate, 'Asia/Tokyo', 'HH:mm') + ' - ' + Utilities.formatDate(endDate, 'Asia/Tokyo', 'HH:mm');
    sendBookingEmail(email, companyName, contactName, typeLabel, dateStr, timeStr, purpose);

    return createJsonResponse({ success: true, eventId: event.getId(), summary: title });
  } catch (err) {
    return createJsonResponse({ error: '予約の作成に失敗しました: ' + err.message });
  }
}

function getAvailableDates(config, type) {
  var days = type === 'presentation' ? config.presentationDays : config.appointmentDays;
  var calendar = CalendarApp.getCalendarById('primary');
  if (!calendar) return [];

  // 60日分のイベントを一括取得
  var today = new Date();
  var rangeStart = new Date(today);
  rangeStart.setDate(today.getDate() + 1);
  rangeStart.setHours(0, 0, 0, 0);
  var rangeEnd = new Date(today);
  rangeEnd.setDate(today.getDate() + 61);
  rangeEnd.setHours(23, 59, 59, 0);
  var allEvents = calendar.getEvents(rangeStart, rangeEnd);

  // 日本の祝日カレンダーを取得
  var holidayDates = getJapaneseHolidays(rangeStart, rangeEnd);

  var dates = [];
  for (var i = 1; i <= 60; i++) {
    var date = new Date(today);
    date.setDate(today.getDate() + i);
    if (days.indexOf(date.getDay()) === -1) continue;

    // 祝日は除外
    if (holidayDates.indexOf(formatDate(date)) !== -1) continue;

    // この日に空き枠があるかチェック
    if (hasAvailableSlot(date, type, config, allEvents)) {
      dates.push(formatDate(date));
    }
  }
  return dates;
}

function getJapaneseHolidays(start, end) {
  try {
    var holidayCal = CalendarApp.getCalendarById('ja.japanese#holiday@group.v.calendar.google.com');
    if (!holidayCal) return [];
    var events = holidayCal.getEvents(start, end);
    var dates = [];
    for (var i = 0; i < events.length; i++) {
      dates.push(formatDate(events[i].getStartTime()));
    }
    return dates;
  } catch (e) {
    return [];
  }
}

function hasAvailableSlot(date, type, config, allEvents) {
  if (type === 'presentation') {
    var pSlots = config.presentationSlots || [{ start: '13:00', end: '13:20' }];
    for (var j = 0; j < pSlots.length; j++) {
      var pStart = makeDateTime(date, pSlots[j].start);
      var pEnd = makeDateTime(date, pSlots[j].end);
      if (!isTimeBusy(pStart, pEnd, allEvents)) return true;
    }
  } else {
    var times = config.appointmentTimes || ['13:00', '13:10', '13:20'];
    var dur = config.appointmentDuration || 10;
    for (var i = 0; i < times.length; i++) {
      var aStart = makeDateTime(date, times[i]);
      var aEnd = new Date(aStart.getTime() + dur * 60 * 1000);
      if (!isTimeBusy(aStart, aEnd, allEvents)) return true;
    }
  }
  return false;
}

function isTimeBusy(start, end, events) {
  for (var i = 0; i < events.length; i++) {
    var eStart = events[i].getStartTime();
    var eEnd = events[i].getEndTime();
    if (start < eEnd && end > eStart) return true;
  }
  return false;
}

function getAvailableSlots(dateStr, type, config) {
  var calendar = CalendarApp.getCalendarById('primary');
  if (!calendar) return [];
  var date = new Date(dateStr + 'T00:00:00');
  var days = type === 'presentation' ? config.presentationDays : config.appointmentDays;
  if (days.indexOf(date.getDay()) === -1) return [];

  var slots = [];

  if (type === 'presentation') {
    var pSlots = config.presentationSlots || [{ start: '13:00', end: '13:20' }];
    for (var j = 0; j < pSlots.length; j++) {
      var ps = pSlots[j];
      var pStart = makeDateTime(date, ps.start);
      var pEnd = makeDateTime(date, ps.end);
      var events = calendar.getEvents(pStart, pEnd);
      if (events.length === 0) {
        slots.push({
          start: pStart.toISOString(),
          end: pEnd.toISOString(),
          display: ps.start + ' - ' + ps.end,
        });
      }
    }
  } else {
    var times = config.appointmentTimes || ['13:00', '13:10', '13:20'];
    var dur = config.appointmentDuration || 10;
    for (var i = 0; i < times.length; i++) {
      var aStart = makeDateTime(date, times[i]);
      var aEnd = new Date(aStart.getTime() + dur * 60 * 1000);
      var evts = calendar.getEvents(aStart, aEnd);
      if (evts.length === 0) {
        slots.push({
          start: aStart.toISOString(),
          end: aEnd.toISOString(),
          display: times[i] + ' - ' + formatTime(aEnd),
        });
      }
    }
  }
  return slots;
}

function makeDateTime(date, timeStr) {
  var d = new Date(date);
  var parts = timeStr.split(':');
  d.setHours(parseInt(parts[0]), parseInt(parts[1]), 0, 0);
  return d;
}

function formatDate(date) {
  var y = date.getFullYear();
  var m = ('0' + (date.getMonth() + 1)).slice(-2);
  var d = ('0' + date.getDate()).slice(-2);
  return y + '-' + m + '-' + d;
}

function formatTime(date) {
  var h = ('0' + date.getHours()).slice(-2);
  var m = ('0' + date.getMinutes()).slice(-2);
  return h + ':' + m;
}

var ADMIN_EMAIL = 'libeclinic.tochigi@gmail.com';
var CLINIC_NAME = 'うつのみやLA泌尿器科クリニック';

function sendBookingEmail(mrEmail, companyName, contactName, typeLabel, dateStr, timeStr, purpose) {
  var subject = '【予約確定】' + typeLabel + ' - ' + dateStr + ' ' + timeStr;

  // 管理者への通知
  var adminBody = typeLabel + 'の予約が入りました。\n\n'
    + '日時: ' + dateStr + ' ' + timeStr + '\n'
    + '種別: ' + typeLabel + '\n'
    + '会社名: ' + companyName + '\n'
    + '担当者: ' + contactName + '\n'
    + 'メール: ' + mrEmail + '\n'
    + '内容: ' + purpose + '\n';
  MailApp.sendEmail(ADMIN_EMAIL, subject, adminBody);

  // MRへの確認メール
  var mrBody = contactName + ' 様\n\n'
    + 'ご予約ありがとうございます。\n'
    + '以下の内容で予約が確定しました。\n\n'
    + '日時: ' + dateStr + ' ' + timeStr + '\n'
    + '種別: ' + typeLabel + '\n'
    + '会社名: ' + companyName + '\n'
    + '担当者: ' + contactName + '\n'
    + '内容: ' + purpose + '\n\n'
    + '----\n'
    + CLINIC_NAME + '\n';
  MailApp.sendEmail(mrEmail, subject, mrBody);
}
