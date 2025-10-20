// install dependencies first:
// npm install @faker-js/faker

import { faker } from "@faker-js/faker";
import fs from "fs";

// --- CONFIG ---
const NUM_RECORDS = 1000000; // how many books to generate
const allowDuplicates = false; // set true/false
const outputFile = `${NUM_RECORDS}-books.csv`;

// Possible values for status
const statuses = ["COMPLETED", "READING", "WISHLIST", "ABANDONED"];

// Helper to generate one book record
function generateBook() {
  const title = faker.lorem.words({ min: 2, max: 5 });
  const author = faker.person.fullName();
  const status = faker.helpers.arrayElement(statuses);

  let rating = "";
  let notes = "";

  if (
    status === "COMPLETED" ||
    status === "READING" ||
    status === "ABANDONED"
  ) {
    rating = faker.number.int({ min: 1, max: 5 });
  }

  if (status === "COMPLETED" || status === "READING") {
    notes = faker.lorem.sentence();
  }

  return { title, author, status, rating, notes };
}

// Main generator
function generateBooks(count, allowDupes) {
  const books = [];
  const seen = new Set();

  while (books.length < count) {
    const book = generateBook();
    const key = `${book.title}|${book.author}`;

    if (!allowDupes && seen.has(key)) {
      continue; // skip duplicates
    }

    seen.add(key);
    books.push(book);
  }

  return books;
}

// Run
const books = generateBooks(NUM_RECORDS, allowDuplicates);

// Convert to CSV
let csv = "title,author,status,rating,notes\n";
books.forEach((b) => {
  csv += `${b.title},${b.author},${b.status},${b.rating},${
    b.notes ? `"${b.notes}"` : ""
  }\n`;
});

// Save file
fs.writeFileSync(outputFile, csv, "utf8");

console.log(`✅ CSV file generated: ${outputFile}`);
