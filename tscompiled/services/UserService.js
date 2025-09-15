import { User } from "../entities/User.js";
import { AppDataSource as database } from "../index.js";
export class UserService {
    constructor() {
        this.userRepository = database.getRepository(User);
    }
    // Получение всех пользователей
    async getAllUsers() {
        return await this.userRepository.find();
    }
    // Получение пользователя по ID
    async getUserById(id) {
        return await this.userRepository.findOne({ where: { id } });
    }
    // Создание пользователя
    async createUser(userData) {
        const user = this.userRepository.create(userData);
        return await this.userRepository.save(user);
    }
    // Обновление пользователя
    async updateUser(id, userData) {
        await this.userRepository.update(id, userData);
        return await this.getUserById(id);
    }
    // Удаление пользователя
    async deleteUser(id) {
        const result = await this.userRepository.delete(id);
        return result.affected !== 0;
    }
}
export const userService = new UserService();
//# sourceMappingURL=UserService.js.map
