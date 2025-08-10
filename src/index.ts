import { PORT } from "./config/env";
import server from "./config/server";

server.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
});
