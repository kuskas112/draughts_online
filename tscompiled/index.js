import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/User.js";
export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: true,
    entities: [User],
    migrations: [],
    subscribers: [],
});
try {
    await AppDataSource.initialize();
}
catch (error) {
    console.log(error);
}
//# sourceMappingURL=index.js.map
