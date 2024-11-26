import { writeFileSync, readFileSync } from "fs";

const fileBooksPath = "./data/json/books.json";
const fileUsersPath = "./data/json/users.json";

export const readBooksData = () => {
  try {
    const data = readFileSync(fileBooksPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    return [];
  }
};

export const readUsersData = () => {
  try {
    const data = readFileSync(fileUsersPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading JSON file:", error);
    return [];
  }
};

export const writeBooksData = (data) => {
  try {
    writeFileSync(fileBooksPath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing JSON file:", error);
  }
};

export const writeUsersData = (data) => {
  try {
    writeFileSync(fileUsersPath, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing JSON file:", error);
  }
};