/**
 * 순천 조례동 아이파크 - 관심고객 리드 수집 스크립트
 *
 * 설치 방법:
 * 1) sheets.google.com 에서 새 스프레드시트를 만든다 (예: "조례아이파크_관심고객")
 * 2) 확장 프로그램 > Apps Script 메뉴로 들어간다
 * 3) 기본 생성된 코드를 모두 지우고 이 파일 내용을 붙여넣는다
 * 4) 상단 함수 선택 드롭다운에서 setupHeaders 를 선택하고 ▶ 실행 (최초 1회, 권한 승인 필요)
 * 5) 배포 > 새 배포 > 유형: 웹 앱
 *    - 실행 계정: 나(본인)
 *    - 액세스 권한이 있는 사용자: 모든 사용자
 * 6) 배포 후 나오는 웹 앱 URL을 복사해서 js/main.js 의 GAS_ENDPOINT_URL 에 붙여넣는다
 */

const SHEET_NAME = "leads";

function doPost(e) {
  try {
    const sheet = getLeadSheet_();
    const data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),
      data.name || "",
      data.birth || "",
      normalizePhone_(data.phone || ""),
      data.region || "",
      data.unitType || "",
      data.purpose || "",
      data.source || ""
    ]);

    return jsonOutput_({ result: "success" });
  } catch (err) {
    return jsonOutput_({ result: "error", message: String(err) });
  }
}

function doGet(e) {
  return jsonOutput_({ result: "ok", message: "리드 수집 엔드포인트가 정상 동작 중입니다." });
}

// 최초 1회 수동 실행: 헤더 행 생성
function setupHeaders() {
  const sheet = getLeadSheet_();
  sheet.getRange(1, 1, 1, 8).setValues([[
    "등록일시", "이름", "생년월일", "연락처", "거주지역", "희망평형", "매수목적", "유입경로"
  ]]);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, 8);
}

function getLeadSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function normalizePhone_(phone) {
  return phone.toString().replace(/[^0-9-]/g, "");
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
