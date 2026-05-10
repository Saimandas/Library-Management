import app from "./app.js";
import dbConnects from "./DbConnects/index.js";

dbConnects().then(()=>{
    app.listen(process.env.PORT, () => {
        console.log(`Server is running on port ${process.env.PORT}`);
    });
})

