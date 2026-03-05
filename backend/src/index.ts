import "./utils/load-env.ts"
import { app } from "./app.ts";
import connectDB from "./db/index.ts";

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
}).catch((error) => {
   console.error("MongoDB ::", error);
})
