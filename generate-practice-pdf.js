import { writeFileSync } from "fs";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const PERSON_COUNT = 5;
const OUTPUT_FILE = "PracticePeopleForm.pdf";

const FIELDS = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "birthMonth", label: "Birth Month" },
  { key: "birthDay", label: "Birth Day" },
  { key: "birthYear", label: "Birth Year" },
  { key: "passedAway", label: "Passed Away (date or leave blank)" },
  { key: "comment", label: "Comment" },
  {
    key: "groups",
    label: "Groups (comma-separated, e.g. All, Family)",
  },
  { key: "grade", label: "Grade (letter, e.g. B+)" },
  { key: "note1", label: "Note 1" },
  { key: "note2", label: "Note 2" },
];

function addInstructionsPage(page, font, boldFont) {
  page.drawText("Practice People Form", {
    x: 50,
    y: 740,
    size: 22,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.45),
  });

  page.drawText("Damien Oliver Royer's Birthday Searcher", {
    x: 50,
    y: 715,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  const instructions = [
    "Please fill in as much or as little as you know for each person.",
    "Leave any unknown fields blank.",
    "",
    "Tips:",
    "- Groups: separate multiple groups with commas (example: All, Family)",
    "- Grade: use a letter grade such as A+, A, B+, B, C, D, or F",
    "- Notes: use Note 1 and Note 2 for short notes about the person",
    "",
    "When finished:",
    "1. Save this PDF (File > Save As)",
    "2. Email the saved PDF back",
    "",
    "This form contains 5 blank people, one per page.",
  ];

  let y = 670;
  for (const line of instructions) {
    const size = line.startsWith("-") || /^\d\./.test(line) ? 11 : 12;
    const usedFont = line === "" ? font : line.endsWith(":") ? boldFont : font;
    if (line) {
      page.drawText(line, { x: 50, y, size, font: usedFont, color: rgb(0.2, 0.2, 0.2) });
    }
    y -= line === "" ? 10 : 18;
  }
}

function addPersonPage(pdfDoc, form, page, personNumber, font, boldFont) {
  const prefix = `person${personNumber}`;

  page.drawRectangle({
    x: 40,
    y: 40,
    width: 532,
    height: 712,
    borderColor: rgb(0.75, 0.75, 0.75),
    borderWidth: 1,
    color: rgb(1, 1, 1),
  });

  page.drawText(`Person ${personNumber} of ${PERSON_COUNT}`, {
    x: 50,
    y: 720,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.45),
  });

  let y = 680;
  const labelX = 50;
  const fieldX = 230;
  const fieldWidth = 320;
  const fieldHeight = 22;
  const rowGap = 38;

  for (const field of FIELDS) {
    page.drawText(field.label, {
      x: labelX,
      y: y + 6,
      size: 10,
      font,
      color: rgb(0.2, 0.2, 0.2),
    });

    const textField = form.createTextField(`${prefix}.${field.key}`);
    if (field.key === "comment" || field.key === "note1" || field.key === "note2") {
      textField.enableMultiline();
    }
    textField.addToPage(page, {
      x: fieldX,
      y: y - 4,
      width: fieldWidth,
      height: fieldHeight,
      borderColor: rgb(0.55, 0.55, 0.55),
      backgroundColor: rgb(0.98, 0.98, 0.98),
    });

    y -= rowGap;
  }
}

async function generatePracticePdf() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const form = pdfDoc.getForm();

  const instructionsPage = pdfDoc.addPage([612, 792]);
  addInstructionsPage(instructionsPage, font, boldFont);

  for (let i = 1; i <= PERSON_COUNT; i += 1) {
    const page = pdfDoc.addPage([612, 792]);
    addPersonPage(pdfDoc, form, page, i, font, boldFont);
  }

  form.updateFieldAppearances(font);
  const pdfBytes = await pdfDoc.save();
  writeFileSync(OUTPUT_FILE, pdfBytes);
  console.log(`Created ${OUTPUT_FILE}`);
}

generatePracticePdf().catch((error) => {
  console.error("Failed to generate PDF:", error);
  process.exit(1);
});
