import cors from "cors";
import express from "express";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const filePath = `${__dirname}/reviews.json`;
const data = fs.readFileSync(filePath, "utf-8");

const saveReview = (bookReviews) => {
  let reviews = [];

  if (fs.existsSync(filePath)) {
    reviews = JSON.parse(data);
  }

  reviews.push(bookReviews);

  console.log({ reviews: reviews });

  fs.writeFileSync(filePath, JSON.stringify(reviews, null, 2));
};

app.post("/save-review", (req, res) => {
  const { bookTitle, author, reviewer, rating, review } = req.body;

  console.log("data:", bookTitle, author, reviewer, rating, review);

  const id = uuidv4();

  try {
    const bookData = {
      bookTitle,
      author,
      reviewer,
      rating,
      review,
      id,
    };

    console.log("bookData:", bookData);

    saveReview(bookData);

    res.status(201).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
});

export default app;
