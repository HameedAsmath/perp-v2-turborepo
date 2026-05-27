import express from "express";
import dotenv from "dotenv";
import routes from "./routes";

const app = express();

app.use(express.json());
app.use("/api/v1", routes);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
