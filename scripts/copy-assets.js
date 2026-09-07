import fs from "fs";

fs.cpSync("src/public", "dist/src/public", { recursive: true });
