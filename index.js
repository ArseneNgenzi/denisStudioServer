const express = require("express");
const nodemailer = require("nodemailer")
const bodyParser = require("body-parser");
const mysql = require("mysql2");

const app = express();
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "root@123",
	database: "denisdb",
});

db.connect((err) => {
	if (err) {
		console.error("Database connection failed: " + err.stack);
		return;
	}
	console.log("Connected to the database");
});

// SEND ORDER EMAIL
app.post('/sendOrderEmail', async (req, res) => {

	const { from, senderMessage, senderEmail, senderPhone, productImage, productPrice, productTitle, toName } = req.body;
	const to = 'denismpabukaart@gmail.com'
	const subject = `Order Placement from customer ${from}`

	const text = `Hello ${toName},\n\nClient "${from}" has placed an order for the following item:\n\nItem: ${productImage}\nTitle: ${productTitle}\nPrice: ${productPrice}\n\nCUSTOMER DETAILS:\n\nNames: ${from}\nPhone number: ${senderPhone}\nEmail: ${senderEmail}\n\n\nCUSTOMER ADDITIONAL MESSAGE:\n\n${senderMessage}\n\nRegards,\n${from}.`
  
	// Configure the nodemailer transporter with your SMTP settings
	const transporter = nodemailer.createTransport({
	  service: 'gmail',
	  auth: {
		user: 'denismpabukaart@gmail.com',
		pass: 'phimaihmomgqlxtv',
	  },
	});
  
	const mailOptions = {
	  from,
	  to,
	  subject,
	  text,
	  html: `
	  <head>
		<style>
		body {
			color: #000;
		}
		span {
			font-weight: bold;
			font-size: 15px;
		}
		h3 {
			text-decoration-line: underline;
		  }
		img {
			width: 300px;
			height: 300px;
		}

		</style>
	  </head>
	  <p>Hello ${toName},</p> 
<p>Client "${from.toUpperCase()}" has placed an order for the following item:</p> 
	  <img src="${productImage}">
	  <p><span >Title:</span> ${productTitle}</p>
	  <p><span >Price:</span> $${productPrice}</p>
	  <h3>CUSTOMER DETAILS:</h3>
	  <p><span>Names:</span> ${from}</p>
	  <p><span>Phone number:</span> ${senderPhone}</p>
	  <p><span>Email:</span> ${senderEmail}</p>
	  <h3>CUSTOMER ADDITIONAL MESSAGE:</h3>
	  <p>${senderMessage}</p>
	  <br>
	  <br>
	  <p>Regards,</p>
	  <p>${from}.</p>
	  `
	};
  
	// Send the email
	transporter.sendMail(mailOptions, (error, info) => {
	  if (error) {
		// console.log(error)
		return res.status(500).send(error.toString());
	  }
	//   console.log(`Email sent to ${to} `)
	//   res.status(200).send('Email sent: ' + info.response);
	});
  });

// GET ALL PRODUCTS
app.get("/products", (req, res) => {
	db.query("SELECT * FROM products", (err, results) => {
		if (err) {
			console.error("Error executing query: " + err);
			return res.status(500).json({ error: "Database error" });
		}
		res.json(results);
	});
});

// CREATE NEW PRODUCT
app.post("/addproducts", (req, res) => {
	console.log(req.body);
	const values = [
		req.body.title,
		req.body.currentPrice,
		req.body.previousPrice,
		req.body.description,
		req.body.image,
		req.body.size,
		req.body.inStock,
		req.body.itemsNumber,
		req.body.category,
	];
	db.query(
		"INSERT INTO products (`title`,`currentPrice`,`previousPrice`,`description`,`image`,`size`,`inStock`,`itemsNumber`,`category`) VALUES (?)",
		[values],
		(err, results) => {
			if (err) {
				console.error("Error executing query: " + err);
				return res.status(500).json({ error: "Database error" });
			}
			res.json(results);
		},
	);
});

// EDIT NEW PRODUCT
app.put("/editproducts/:id", (req, res) => {
	const id = req.params.id;
	console.log("EDITED PRODUCT: ", req.body);
	db.query(
		"UPDATE products SET `title` = ?,`currentPrice` = ?,`previousPrice` = ?,`description` = ?,`image` = ?,`size` = ?,`inStock` = ?,`itemsNumber` = ?,`category` = ? WHERE `id` = ?",
		[req.body.title,
			req.body.currentPrice,
			req.body.previousPrice,
			req.body.description,
			req.body.image,
			req.body.size,
			req.body.inStock,
			req.body.itemsNumber,
			req.body.category, id],
		(err, results) => {
			if (err) {
				console.error("Error executing query: " + err);
				return res.status(500).json({ error: "Database error" });
			}
			res.json(results);
		},
	);
});

// DELETE PRODUCT BY ID
app.delete("/deleteproduct/:id", (req, res) => {
	const id = req.params.id;
	// console.log(id);

	db.query("DELETE FROM products WHERE id=?", id, (err, results) => {
		if (err) {
			console.error("Error executing query: " + err);
			return res.status(500).json({ error: "Database error" });
		}
		res.json(results);
	});
});

// GET PRODUCT BY ID
app.get("/products/:id", (req, res) => {
	const productId = req.params.id;
	db.query("SELECT * FROM products WHERE id=?", productId, (err, results) => {
		if (err) {
			console.error("Error executing query: " + err);
			return res.status(500).json({ error: "Database error" });
		}
		return res.json(results);
	});
});

//  GET ALL CATEGORIES
app.get("/categories", (req, res) => {
	db.query("SELECT * FROM categories", (err, results) => {
		if (err) {
			console.error("Error executing query: " + err);
			return res.status(500).json({ error: "Database error" });
		}
		res.json(results);
	});
});

//  CREATE NEW CATEGORY
app.post("/newcategory", (req, res) => {
	const {category} = req.body
	// console.log(category)
	db.query("INSERT INTO categories (`name`) VALUES (?)", category, (err, results) => {
		if (err) {
			console.error("Error executing query: " + err);
			return res.status(500).json({ error: "Database error" });
		}
		res.json(results);
	});
});

// EDIT NEW CATEGORY
app.put("/editcategory/:id", (req, res) => {
	const id = req.params.id;
	db.query(
		"UPDATE categories SET `name` = ? WHERE `id` = ?",
		[req.body.categoryName, id],
		(err, results) => {
			if (err) {
				console.error("Error executing query: " + err);
				return res.status(500).json({ error: "Database error" });
			}
			res.json(results);
		},
	);
});

// DELETE CATEGORY
app.delete("/deletecategory/:id", (req, res) => {
	const id = req.params.id;
	// console.log(id);

	db.query("DELETE FROM categories WHERE id=?", id, (err, results) => {
		if (err) {
			console.error("Error executing query: " + err);
			return res.status(500).json({ error: "Database error" });
		}
		res.json(results);
	});
});


// SEARCH PRODUCT BY NAME
app.get("/search-products/:name", (req, res) => {
	let name = req.params.name;
	console.log("REQ.BODY: ", name);

	db.query(
		"SELECT * FROM products WHERE title LIKE ?",
		`%${name}%`,
		(err, results) => {
			if (err) {
				console.error("Error executing query: " + err);
				return res.status(500).json({ error: "Database error" });
			}
			res.json(results);
			console.log(results);
		},
	);
});

app.listen(4000, () => {
	console.log("Server running on port 4000");
});
