import express from "express";
import deviceRoutes from "./routes/deviceRoutes.js";

const app = express();

app.use(express.json());

app.use("/api", deviceRoutes);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
