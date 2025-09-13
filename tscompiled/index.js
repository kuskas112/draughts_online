import "reflect-metadata";
import { createConnection } from "typeorm";
import { User } from "./entities/User.js";
export async function initDatabase() {
    try {
        const connection = await createConnection({
            type: "sqlite",
            database: "database.sqlite",
            entities: [User],
            synchronize: true, // Автоматически создает таблицы
            logging: true
        });
        console.log("Database connected!");
        return connection;
    }
    catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
}
// Функции для работы с данными
export async function createUser(userData) {
    const connection = await initDatabase();
    const userRepository = connection.getRepository(User);
    const user = userRepository.create(userData);
    return await userRepository.save(user);
}
export async function getUsers() {
    const connection = await initDatabase();
    return await connection.getRepository(User).find();
}
