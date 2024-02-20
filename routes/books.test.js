process.env.NODE_ENV = "test";

const app = require("../app");
const request = require("supertest");
const db = require("../db");

let testBook;

beforeEach(async () => {
	const result = await db.query(`
    INSERT INTO books (
        isbn,
        amazon_url,
        author,
        language,
        pages,
        publisher,
        title,
        year)
        VALUES ('10921830', 'http://a.co/eobPtX5', 'Chris Test', 'english', 350, 'Reading Rainbow', 'The Best Book Ever', 2023)
    RETURNING *`);
	testBook = result.rows[0];
});

afterEach(async () => {
	await db.query(`DELETE FROM books`);
});

afterAll(async () => {
	await db.end();
});

describe("GET /", () => {
	test("Get a list of books", async () => {
		const result = await request(app).get(`/books`);
		expect(result.statusCode).toBe(200);
		expect(result.body).toEqual({
			books: [testBook],
		});
	});
});

describe("GET /books/:isbn", () => {
	test("Get a single book", async () => {
		const result = await request(app).get(`/books/${testBook.isbn}`);
		expect(result.statusCode).toBe(200);
		expect(result.body.book.isbn).toEqual(testBook.isbn);
	});

	test("Responds with 404 if invalid isbn.", async () => {
		const result = await request(app).get(`/books/0`);
		expect(result.statusCode).toBe(404);
	});
});

describe("POST /books", () => {
	test("Creates a new book", async () => {
		const result = await request(app)
			.post(`/books`)
			.send({
				isbn: "11111111",
				amazon_url: "http://a.co/eobPtX50000",
				author: "Test",
				language: "testlan",
				pages: 555,
				publisher: "Test Testerss",
				title: "Teeest",
				year: 1985,
			});
		expect(result.statusCode).toBe(201);
		expect(result.body.book.title).toEqual("Teeest");
		expect(result.body.book.year).toEqual(1985);
  });
  
  test("Cant create a new book with invalid input", async () => {
		const result = await request(app)
			.post(`/books`)
			.send({
				isbn: 11111111,
				amazon_url: "http://a.co/eobPtX50000",
				author: "Test",
				language: "testlan",
				pages: 555,
				publisher: "Test Testerss",
				title: "Teeest",
				year: 1985,
			});
		expect(result.statusCode).toBe(400);
	});
});

describe("PUT /books", () => {
	test("Updates a book", async () => {
		const result = await request(app)
			.put(`/books/${testBook.isbn}`)
			.send({
				amazon_url: "http://a.co/eobPtX50000",
				author: "Updated",
				language: "Updated",
				pages: 555,
				publisher: "Updated",
				title: "Updated",
				year: 1985,
			});
		expect(result.status).toBe(200);
		expect(result.body.book.author).toEqual("Updated");
	});

	test("Cant update a book with invalid input", async () => {
		const result = await request(app)
			.put(`/books/${testBook.isbn}`)
			.send({
				amazon_url: "http://a.co/eobPtX50000",
				author: "Updated",
				language: false,
				pages: 555,
				publisher: "Updated",
				title: "Updated",
				year: 1985,
			});
		expect(result.status).toBe(400);
	});
});

describe("DELETE /books/:isbn", () => {
  test("Deletes a book", async () => {
    const result = await request(app).delete(`/books/${testBook.isbn}`);
    expect(result.body).toEqual({ message: "Book deleted" });
  });
});

