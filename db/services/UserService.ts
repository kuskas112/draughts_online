import { Repository } from 'typeorm';
import { User } from '../entities/User';
import { AppDataSource as database } from '../index';
export class UserService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = database.getRepository(User);
    }

    // Получение всех пользователей
    async getAllUsers(): Promise<User[]> {
        return await this.userRepository.find();
    }

    // Получение пользователя по ID
    async getUserById(id: number): Promise<User | null> {
        return await this.userRepository.findOne({ where: { id } });
    }

    // Получение пользователя по имени
    async getUserByName(name: string): Promise<User | null> {
        return await this.userRepository.findOneBy({
            name: name,
        });
    }

    // Создание пользователя
    async createUser(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        return await this.userRepository.save(user);
    }

    // Обновление пользователя
    async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
        await this.userRepository.update(id, userData);
        return await this.getUserById(id);
    }

    // Удаление пользователя
    async deleteUser(id: number): Promise<boolean> {
        const result = await this.userRepository.delete(id);
        return result.affected !== 0;
    }

}

export const userService = new UserService();