// Helper Functions
let currentStatus = "";

// Set the current status and button
function setStatus(status, element) {
  const buttons = document.getElementsByClassName("availability");
  for (const button of buttons) {
    button.classList.remove("selected");
  }

  if (currentStatus == status) {
    currentStatus = "";
  } else {
    currentStatus = status;
    element.classList.add("selected");
  }
}

// Add class to cell to mark it's value
function markDay(cell) {
  cell.className = "";
  if (currentStatus) {
    cell.classList.add(currentStatus);
  }
}

// Add a header indicating month name to calendar on month change
function addMonthHeader(parent, date) {
  const monthRow = document.createElement("tr");
  const monthCell = document.createElement("td");
  monthCell.colSpan = 7;
  monthCell.className = "month-name";
  monthCell.innerText = date.toLocaleString("default", { month: "long" });
  monthRow.appendChild(monthCell);
  parent.appendChild(monthRow);
}

// Generate the calendar cells according to inputs
function generateCalendar() {
  const startDateInput = document.getElementById("startDate").value;
  const numDays = parseInt(document.getElementById("numDays").value);
  const endDateInput = document.getElementById("endDate").value;

  if (!startDateInput) {
    alert("Please provide a valid start date.");
    return;
  }

  let TZendDate = null;
  if (endDateInput) {
    TZendDate = new Date(endDateInput);
  } else if (!isNaN(numDays) && numDays > 0) {
    TZendDate = new Date(startDateInput);
    TZendDate.setDate(TZendDate.getDate() + numDays - 1);
  } else {
    alert("Please provide a valid number of days or end date.");
    return;
  }
  const endDate = new Date(
    TZendDate.getTime() + TZendDate.getTimezoneOffset() * 60000
  );

  const TZstartDate = new Date(startDateInput);
  const startDate = new Date(
    TZstartDate.getTime() + TZstartDate.getTimezoneOffset() * 60000
  );
  const calendarBody = document.getElementById("calendar-body");
  calendarBody.innerHTML = "";

  let currentMonth = startDate.getMonth();
  let row = document.createElement("tr");
  let cellIndex = startDate.getDay();

  // Fill in first month header & row blank days
  addMonthHeader(calendarBody, startDate);
  for (let i = 0; i < cellIndex; i++) {
    const cell = document.createElement("td");
    row.appendChild(cell);
  }

  let dayCounter = 0;
  while (startDate <= endDate) {
    const cell = document.createElement("td");
    cell.setAttribute("id", `day-${dayCounter}`);
    cell.addEventListener("click", () => markDay(cell));
    const cellText = document.createTextNode(startDate.getDate());
    cell.appendChild(cellText);
    row.appendChild(cell);

    if (cellIndex === 6) {
      calendarBody.appendChild(row);
      row = document.createElement("tr");
      cellIndex = 0;
    } else {
      cellIndex++;
    }

    startDate.setDate(startDate.getDate() + 1);
    dayCounter++;

    if (startDate.getMonth() !== currentMonth) {
      currentMonth = startDate.getMonth();
      addMonthHeader(calendarBody, startDate);
    }
  }

  if (row.childNodes.length > 0) {
    calendarBody.appendChild(row);
  }
}

// Retrieve Calendar Data to store
function getCalendarData() {
  const startDateInput = document.getElementById("startDate").value;
  const numDays = parseInt(document.getElementById("numDays").value);
  const endDateInput = document.getElementById("endDate").value;

  const days = [];
  const calendarData = {
    startDate: startDateInput,
    numDays: numDays,
    endDate: endDateInput,
    availabilities: [],
  };

  document.querySelectorAll('td[id^="day-"]').forEach((cell) => {
    let index = calendarData.availabilities.indexOf(cell.className);
    if (index == -1) {
      calendarData.availabilities.push(cell.className);
      index = calendarData.availabilities.length - 1;
    }
    days.push(index);
  });

  calendarData.days = days.join(",");

  return calendarData;
}

// Populate Calendar from loaded Data
function populateCalendar(calendarData) {
  document.getElementById("startDate").value = calendarData.startDate;
  document.getElementById("numDays").value = calendarData.numDays;
  document.getElementById("endDate").value = calendarData.endDate;
  generateCalendar();

  if (!("days" in calendarData) || calendarData.days == "") return;
  const keys = calendarData.availabilities;
  const days = calendarData.days.split(",");
  days.forEach((data, index) => {
    const cell = document.getElementById("day-" + index);
    if (cell) {
      cell.className = keys[data];
    }
  });
}

// Save calendar to local storage
function saveCalendar() {
  const calendarData = getCalendarData();
  localStorage.setItem("calendarData", JSON.stringify(calendarData));
  alert("Calendar saved to local storage!");
}

// Load calendar from local storage
function loadCalendar() {
  const calendarData = JSON.parse(localStorage.getItem("calendarData"));
  if (calendarData) {
    populateCalendar(calendarData);
    // alert("Calendar loaded from local storage!");
  } else {
    // alert("No saved calendar data found.");
  }
}

// Show pop up for copying
function copyToClipboard(text) {
  window.prompt("Copy to clipboard: Ctrl+C, Enter", text);
}

// Provide pastable data to share parameters
function shareParameters() {
  const calendarData = getCalendarData();
  delete calendarData["days"];
  const string = btoa(JSON.stringify(calendarData));
  copyToClipboard(string);
}

// Provide pastable data to share data
function shareSetup() {
  const calendarData = getCalendarData();
  const string = btoa(JSON.stringify(calendarData));
  copyToClipboard(string);
}

// Show pop up for pasting
function receiveClipboard() {
  return window.prompt("Paste from clipboard: Ctrl+V, Enter");
}

// Provide pastable data to share parameters
function loadParameters() {
  const calendarData = JSON.parse(atob(receiveClipboard()));
  //   calendarData["days"] = "";
  populateCalendar(calendarData);
}

// Provide pastable data to share parameters
let parameters = {};
function loadSetup() {
  const calendarBody = document.getElementById("calendar-body");
  if (!calendarBody.classList.contains("comparing")) {
    console.log("Recreating Original");
    calendarBody.classList.add("comparing");
    const calendarData = getCalendarData();
    parameters = {
      startDate: calendarData.startDate,
      numDays: calendarData.numDays,
      endDate: calendarData.endDate,
    };
    calendarBody.innerHTML = "";
    populateCalendar(parameters);

    const keys = calendarData.availabilities;
    const days = calendarData.days.split(",");
    days.forEach((data, index) => {
      const cell = document.getElementById("day-" + index);
      if (cell) {
        const oldText = cell.textContent;
        cell.textContent = "";
        const text = document.createElement("div");
        text.classList.add("text");
        text.textContent = oldText;
        cell.appendChild(text);
        const container = document.createElement("div");
        container.classList.add("bgContainer");
        cell.appendChild(container);

        const color = document.createElement("div");
        console.log(`${keys} + ${data}`);
        if (keys[data] != "") color.classList.add(keys[data]);
        container.appendChild(color);
      }
    });
  }

  const calendarData = JSON.parse(atob(receiveClipboard()));
  if (
    calendarData.startDate != parameters.startDate ||
    calendarData.numDays != parameters.numDays ||
    calendarData.endDate != parameters.endDate
  ) {
    alert("Incompatible Parameters");
    return;
  }

  const keys = calendarData.availabilities;
  const days = calendarData.days.split(",");
  days.forEach((data, index) => {
    const cell = document.getElementById("day-" + index);
    if (cell) {
      const container = cell.children[1];
      const color = document.createElement("div");
      if (keys[data] != "") color.classList.add(keys[data]);
      container.appendChild(color);
    }
  });
}

function downloadCalendar() {
  const calendarData = getCalendarData();

  const dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(calendarData));
  const downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "calendar_data.json");
  document.body.appendChild(downloadAnchorNode); // Required for FF
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}

function uploadCalendar() {
  document.getElementById("fileInput").click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const calendarData = JSON.parse(e.target.result);
      populateCalendar(calendarData);
      alert("Calendar loaded from file!");
    };
    reader.readAsText(file);
  }
}

window.onload = function () {
  // loadCalendar();
};

// Bootstrap Dark and Light mode Handler
// https://webvees.com/post/how-use-toggle-dark-and-light-mode-in-bootstrap-53/
document.getElementById("darkModeIcon").addEventListener("click", function () {
  this.classList.toggle("fa-moon");
  this.classList.toggle("fa-sun");
  let theme = document.documentElement.getAttribute("data-bs-theme");
  if (theme === "dark") {
    document.documentElement.removeAttribute("data-bs-theme");
  } else {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  }
});

/*!
 * Color mode toggler for Bootstrap's docs (https://getbootstrap.com/)
 * Copyright 2011-2024 The Bootstrap Authors
 * Licensed under the Creative Commons Attribution 3.0 Unported License.
 */

// (() => {
//   'use strict'

const getStoredTheme = () => localStorage.getItem("theme");
const setStoredTheme = (theme) => localStorage.setItem("theme", theme);

const getPreferredTheme = () => {
  const storedTheme = getStoredTheme();
  if (storedTheme) {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const setTheme = (theme) => {
  if (theme === "auto") {
    document.documentElement.setAttribute(
      "data-bs-theme",
      window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    );
  } else {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }
};

setTheme(getPreferredTheme());

const showActiveTheme = (theme, focus = false) => {
  const themeSwitcher = document.querySelector("#bd-theme");

  if (!themeSwitcher) {
    return;
  }

  const themeSwitcherText = document.querySelector("#bd-theme-text");
  const activeThemeIcon = document.querySelector(".theme-icon-active use");
  const btnToActive = document.querySelector(
    `[data-bs-theme-value="${theme}"]`
  );
  const svgOfActiveBtn = btnToActive
    .querySelector("svg use")
    .getAttribute("href");

  document.querySelectorAll("[data-bs-theme-value]").forEach((element) => {
    element.classList.remove("active");
    element.setAttribute("aria-pressed", "false");
  });

  btnToActive.classList.add("active");
  btnToActive.setAttribute("aria-pressed", "true");
  activeThemeIcon.setAttribute("href", svgOfActiveBtn);
  const themeSwitcherLabel = `${themeSwitcherText.textContent} (${btnToActive.dataset.bsThemeValue})`;
  themeSwitcher.setAttribute("aria-label", themeSwitcherLabel);

  if (focus) {
    themeSwitcher.focus();
  }
};

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    const storedTheme = getStoredTheme();
    if (storedTheme !== "light" && storedTheme !== "dark") {
      setTheme(getPreferredTheme());
    }
  });

window.addEventListener("DOMContentLoaded", () => {
  showActiveTheme(getPreferredTheme());

  document.querySelectorAll("[data-bs-theme-value]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const theme = toggle.getAttribute("data-bs-theme-value");
      setStoredTheme(theme);
      setTheme(theme);
      showActiveTheme(theme, true);
    });
  });
});
// })()
