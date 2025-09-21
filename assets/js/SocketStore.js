// sockets/store.js
class SocketStore {
  constructor() {
    this.sockets = new Map(); // Используем Map вместо объекта для удобства
    this.userSocketMap = new Map(); // userID -> socket
    this.socketUserMap = new Map(); // socket -> userID (для обратного поиска)
  }

  // Добавление сокета для пользователя
  addSocket(userId, socket) {
    this.userSocketMap.set(userId, socket);
    this.socketUserMap.set(socket, userId);
  }

  // Получение сокета по ID пользователя
  getSocket(userId) {
    return this.userSocketMap.get(userId);
  }

  // Получение ID пользователя по сокету
  getUserId(socket) {
    return this.socketUserMap.get(socket);
  }

  // Удаление сокета
  removeSocket(socket) {
    const userId = this.getUserId(socket);
    if (userId) {
      this.userSocketMap.delete(userId);
      this.socketUserMap.delete(socket);
      console.log(`Socket removed for user ${userId}`);
    }
  }

  // Проверка наличия подключения
  hasSocket(userId) {
    return this.userSocketMap.has(userId);
  }

  // Получение всех подключенных пользователей
  getAllUsers() {
    return Array.from(this.userSocketMap.keys());
  }

  // Отправка сообщения конкретному пользователю
  sendToUser(userId, event, data) {
    const socket = this.getSocket(userId);
    if (socket && socket.readyState === socket.OPEN) {
      socket.send(JSON.stringify({ event, data }));
      return true;
    }
    return false;
  }

  // Широковещательная отправка всем пользователям
  broadcast(event, data, excludeUserId = null) {
    let count = 0;
    this.userSocketMap.forEach((socket, userId) => {
      if (userId !== excludeUserId && socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify({ event, data }));
        count++;
      }
    });
    return count;
  }
}

// Экспортируем singleton instance
export default new SocketStore();