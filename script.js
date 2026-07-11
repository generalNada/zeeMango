import { myPeople } from "./myPeople.js";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const inputs = {
  firstName: document.getElementById("firstName"),
  lastName: document.getElementById("lastName"),
  group: document.getElementById("group"),
  birthMonth: document.getElementById("birthMonth"),
  birthDay: document.getElementById("birthDay"),
  birthYear: document.getElementById("birthYear"),
};

const resultsDiv = document.getElementById("results");
const clearBtn = document.getElementById("clearBtn");
const showAllBtn = document.getElementById("showAllBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
let allNamesVisible = false;
let activeTodaysBirthdayView = null;

const LETTER_TO_GPA = {
  "A+": 4.0,
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.4,
  D: 1.0,
  F: 0.0,
};

function clearTodaysBirthdayView() {
  activeTodaysBirthdayView = null;
}

function getTodaysBirthdayViewKey(people) {
  if (people.length === 1) {
    const person = people[0];
    return `person:${person.firstName}|${person.lastName}`;
  }
  return "all";
}

function hasValue(value) {
  if (value == null) return false;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed !== "" && trimmed.toLowerCase() !== "null";
  }
  return true;
}

function formatBirthday(person) {
  if (hasValue(person.birthMonth)) {
    let birthday = person.birthMonth;
    if (hasValue(person.birthDay)) {
      birthday += ` ${person.birthDay}`;
    }
    if (hasValue(person.birthYear)) {
      birthday += `, ${person.birthYear}`;
    }
    return birthday;
  }
  if (hasValue(person.birthDay)) {
    let birthday = String(person.birthDay);
    if (hasValue(person.birthYear)) {
      birthday += `, ${person.birthYear}`;
    }
    return birthday;
  }
  if (hasValue(person.birthYear)) {
    return String(person.birthYear);
  }
  return "";
}

function formatGradeDisplay(grade) {
  if (!hasValue(grade)) return null;
  const letter = grade.trim();
  const gpa = LETTER_TO_GPA[letter];
  if (gpa == null) return letter;
  return `${gpa} (${letter})`;
}

function getGpaFromGrade(grade) {
  if (!hasValue(grade)) return null;
  const gpa = LETTER_TO_GPA[grade.trim()];
  return gpa == null ? null : gpa;
}

function calculateAverageGpa(people) {
  const gpas = people
    .map((person) => getGpaFromGrade(person.grade))
    .filter((gpa) => gpa != null);

  if (gpas.length === 0) return null;

  const average = gpas.reduce((sum, gpa) => sum + gpa, 0) / gpas.length;
  return {
    average: Math.round(average * 100) / 100,
    gradedCount: gpas.length,
    totalCount: people.length,
  };
}

function buildGpaSummary(people) {
  const gpaStats = calculateAverageGpa(people);
  if (!gpaStats) return null;

  const summary = document.createElement("div");
  summary.className = "results-gpa-summary";
  const gradedLabel =
    gpaStats.gradedCount === gpaStats.totalCount
      ? `${gpaStats.gradedCount} displayed`
      : `${gpaStats.gradedCount} of ${gpaStats.totalCount} displayed`;
  summary.textContent = `Average GPA: ${gpaStats.average} (${gradedLabel})`;
  return summary;
}

function buildPersonResult(aHuman) {
  const div = document.createElement("div");
  div.className = "result";

  const birthday = formatBirthday(aHuman);
  const mainLine = document.createElement("div");
  mainLine.className = "result-main";

  let line = `<strong>${aHuman.firstName} ${aHuman.lastName}</strong>`;
  if (hasValue(aHuman.passedAway)) {
    line += " ---";
    if (birthday) {
      line += ` Born: <span class='date-info'>${birthday}</span> -`;
    }
    line += ` Passed Away: <span class='date-info'>${aHuman.passedAway}</span>, RIP ${aHuman.firstName} ${aHuman.lastName}`;
  } else if (birthday) {
    line += `: <span class='date-info'>${birthday}</span>`;
  }
  if (hasValue(aHuman.comment)) {
    line += ` --- '${aHuman.comment}'`;
  }
  mainLine.innerHTML = line;
  div.appendChild(mainLine);

  const groups = (aHuman.groups || [])
    .filter(hasValue)
    .filter((group) => group !== "All");
  if (groups.length > 0) {
    const groupsEl = document.createElement("div");
    groupsEl.className = "result-groups";
    groupsEl.textContent = `Groups: ${groups.join(", ")}`;
    div.appendChild(groupsEl);
  }

  const gradeText = formatGradeDisplay(aHuman.grade);
  if (gradeText) {
    const gradeEl = document.createElement("div");
    gradeEl.className = "result-grade";
    gradeEl.textContent = `Grade: ${gradeText}`;
    div.appendChild(gradeEl);
  }

  const notes = Array.isArray(aHuman.notes)
    ? aHuman.notes.filter(hasValue)
    : [];
  if (notes.length > 0) {
    const notesEl = document.createElement("div");
    notesEl.className = "result-notes";

    const firstNote = document.createElement("span");
    firstNote.textContent = `Notes: ${notes[0]}`;
    notesEl.appendChild(firstNote);

    if (notes.length > 1) {
      const moreBtn = document.createElement("button");
      moreBtn.type = "button";
      moreBtn.className = "notes-more-btn";
      moreBtn.textContent = "more";

      const extraNotes = document.createElement("div");
      extraNotes.className = "notes-extra";
      extraNotes.hidden = true;
      notes.slice(1).forEach((note) => {
        const noteLine = document.createElement("div");
        noteLine.textContent = note;
        extraNotes.appendChild(noteLine);
      });

      moreBtn.addEventListener("click", () => {
        extraNotes.hidden = !extraNotes.hidden;
        moreBtn.textContent = extraNotes.hidden ? "more" : "less";
      });

      notesEl.appendChild(document.createTextNode(" "));
      notesEl.appendChild(moreBtn);
      notesEl.appendChild(extraNotes);
    }

    div.appendChild(notesEl);
  }

  return div;
}

function getSortedNames(arr) {
  return [...arr].sort((a, b) => {
    const nameA = a.lastName?.toLowerCase() || "";
    const nameB = b.lastName?.toLowerCase() || "";
    const lastNameComparison = nameA.localeCompare(nameB);
    if (lastNameComparison !== 0) {
      return lastNameComparison;
    }
    // If last names are the same, sort by first name
    const firstNameA = a.firstName?.toLowerCase() || "";
    const firstNameB = b.firstName?.toLowerCase() || "";
    return firstNameA.localeCompare(firstNameB);
  });
}

function filterNames() {
  const query = {
    firstName: inputs.firstName.value.trim().toLowerCase(),
    lastName: inputs.lastName.value.trim().toLowerCase(),
    group: inputs.group.value.trim(),
    birthMonth: inputs.birthMonth.value.trim().toLowerCase(),
    birthDay: inputs.birthDay.value.trim(),
    birthYear: inputs.birthYear.value.trim(),
  };

  const results = myPeople.filter((aHuman) => {
    return (
      (!query.firstName ||
        aHuman.firstName.toLowerCase().startsWith(query.firstName)) &&
      (!query.lastName ||
        aHuman.lastName.toLowerCase().startsWith(query.lastName)) &&
      (!query.group ||
        (aHuman.groups && aHuman.groups.includes(query.group))) &&
      (!query.birthMonth ||
        query.birthMonth === "all" ||
        (aHuman.birthMonth &&
          aHuman.birthMonth.toLowerCase() === query.birthMonth)) &&
      (!query.birthDay || aHuman.birthDay == query.birthDay) &&
      (!query.birthYear || aHuman.birthYear == query.birthYear)
    );
  });

  let heading = `Filtered Birthdays (${results.length})`;
  if (
    query.birthMonth === "all" &&
    !query.firstName &&
    !query.lastName &&
    !query.group &&
    !query.birthDay &&
    !query.birthYear
  ) {
    heading = `All Birthdays (${results.length})`;
  } else if (
    query.birthMonth &&
    query.birthMonth !== "all" &&
    !query.firstName &&
    !query.lastName &&
    !query.group &&
    !query.birthDay &&
    !query.birthYear
  ) {
    // Capitalize month
    const monthName =
      query.birthMonth.charAt(0).toUpperCase() + query.birthMonth.slice(1);
    heading = `${monthName} Birthdays (${results.length})`;
  } else if (
    query.group &&
    !query.firstName &&
    !query.lastName &&
    !query.birthMonth &&
    !query.birthDay &&
    !query.birthYear
  ) {
    heading = `${query.group} Group (${results.length})`;
  }
  displayResults(getSortedNames(results), heading);
  allNamesVisible = false;
  clearTodaysBirthdayView();
}

function displayResults(results, heading = "") {
  resultsDiv.innerHTML = "";
  if (heading) {
    const headingDiv = document.createElement("div");
    headingDiv.className = "results-heading";
    headingDiv.textContent = heading;
    resultsDiv.appendChild(headingDiv);
  }
  if (results.length === 0) {
    resultsDiv.innerHTML += "<p>No matches found.</p>";
    return;
  }

  results.forEach((aHuman) => {
    resultsDiv.appendChild(buildPersonResult(aHuman));
  });

  const gpaSummary = buildGpaSummary(results);
  if (gpaSummary) {
    resultsDiv.appendChild(gpaSummary);
  }
}

Object.values(inputs).forEach((input) => {
  input.addEventListener("input", filterNames);
});

clearBtn.addEventListener("click", () => {
      console.log("Clear All button works,");

  Object.values(inputs).forEach((input) => {
    if (input.tagName === "SELECT") {
      if (input.id === "group") {
        input.selectedIndex = 0; // Reset to "-- Group --"
      } else if (input.id === "birthMonth") {
        input.selectedIndex = 0; // Reset to "-- Month --"
      } else {
        input.selectedIndex = 0;
      }
    } else {
      input.value = "";
    }
  });
  resultsDiv.innerHTML = "";
  allNamesVisible = false;
  clearTodaysBirthdayView();
});

showAllBtn.addEventListener("click", () => {
    console.log("Show All button works");
  const sortedNames = getSortedNames(myPeople);
  displayResults(sortedNames, `All Birthdays (${sortedNames.length})`);
  allNamesVisible = true;
  clearTodaysBirthdayView();
});

clearAllBtn.addEventListener("click", () => {
  resultsDiv.innerHTML = "";
  allNamesVisible = false;
  clearTodaysBirthdayView();
});

// Hide all data on page load
resultsDiv.innerHTML = "";

// Function to populate group dropdown
function populateGroupDropdown() {
  const groupSelect = document.getElementById("group");
  const allGroups = myPeople.flatMap((person) => person.groups || []);
  const uniqueGroups = [...new Set(allGroups)].filter(
    (group) => group !== null
  );

  groupSelect.innerHTML = '<option value="">All groups</option>';
  uniqueGroups.forEach((group) => {
    const option = document.createElement("option");
    option.value = group;
    option.textContent = group;
    groupSelect.appendChild(option);
  });
}

// Function to count birthdays by month and update dropdown
function updateDropdownWithCounts() {
  const monthCounts = {};
  // Initialize counts
  MONTHS.forEach((month) => (monthCounts[month] = 0));

  // Count birthdays by month
  let totalWithBirthdays = 0;
  myPeople.forEach((person) => {
    if (person.birthMonth && MONTHS.includes(person.birthMonth)) {
      monthCounts[person.birthMonth]++;
      totalWithBirthdays++;
    }
  });

  // Update dropdown options
  const monthSelect = document.getElementById("birthMonth");
  monthSelect.innerHTML = `
    <option value="">All months</option>
    <option value="all">All Months (${totalWithBirthdays})</option>
    ${MONTHS
      .map(
        (month) =>
          `<option value="${month.toLowerCase()}">${month} (${
            monthCounts[month]
          })</option>`
      )
      .join("")}
  `;
}

function displayCurrentDate() {
  const dateEl = document.getElementById("currentDate");
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getTodaysBirthdays() {
  const now = new Date();
  const todayMonth = MONTHS[now.getMonth()];
  const todayDay = now.getDate();

  return getSortedNames(
    myPeople.filter((person) => {
      if (!person.birthMonth || person.birthDay == null) return false;
      const day = Number(person.birthDay);
      if (Number.isNaN(day)) return false;
      return person.birthMonth === todayMonth && day === todayDay;
    })
  );
}

function toggleTodaysBirthdayResults(people) {
  const viewKey = getTodaysBirthdayViewKey(people);

  if (activeTodaysBirthdayView === viewKey) {
    resultsDiv.innerHTML = "";
    clearTodaysBirthdayView();
    allNamesVisible = false;
    return;
  }

  const heading =
    people.length === 1
      ? "Today's Birthday (1)"
      : `Today's Birthdays (${people.length})`;
  displayResults(people, heading);
  activeTodaysBirthdayView = viewKey;
  allNamesVisible = false;
  resultsDiv.scrollIntoView({ behavior: "smooth", block: "start" });
}

function displayTodaysBirthdays() {
  const todaysBirthdaysEl = document.getElementById("todaysBirthdays");
  const birthdays = getTodaysBirthdays();

  if (birthdays.length === 0) {
    todaysBirthdaysEl.textContent = "";
    todaysBirthdaysEl.hidden = true;
    return;
  }

  const label =
    birthdays.length === 1 ? "Today's Birthday" : "Today's Birthdays";

  todaysBirthdaysEl.hidden = false;
  todaysBirthdaysEl.innerHTML = "";
  todaysBirthdaysEl.title = "Click to show or hide details";

  todaysBirthdaysEl.append(`🎉 ${label}: `);

  birthdays.forEach((person, index) => {
    if (index > 0) {
      todaysBirthdaysEl.append(", ");
    }

    const nameBtn = document.createElement("button");
    nameBtn.type = "button";
    nameBtn.className = "todays-birthday-name";
    nameBtn.textContent = `${person.firstName} ${person.lastName}`;
    nameBtn.title = `Show or hide ${person.firstName} ${person.lastName}'s details`;
    nameBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleTodaysBirthdayResults([person]);
    });
    todaysBirthdaysEl.append(nameBtn);
  });

  todaysBirthdaysEl.append(" 🎉");

  todaysBirthdaysEl.addEventListener("click", () => {
    toggleTodaysBirthdayResults(birthdays);
  });
}

// Call on page load
populateGroupDropdown();
updateDropdownWithCounts();
displayCurrentDate();
displayTodaysBirthdays();
