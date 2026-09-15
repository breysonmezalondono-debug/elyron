import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat.service';
@WebSocketGateway({
  cors: {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowed = process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(',').map((o) => o.trim())
        : ['http://localhost:5173', 'http://localhost:5174'];
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private connectedUsers = new Map<string, string>();
  constructor(private readonly chatService: ChatService) {}
  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.set(userId, client.id);
    }
  }
  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.connectedUsers.delete(userId);
    }
  }
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: {
      receiverId: string;
      content: string;
      roomId?: string;
    },
  ) {
    const senderId = client.handshake.query.userId as string;
    if (!senderId) return { error: 'No autenticado' };
    const sender = await this.chatService.getFullUser(senderId);
    if (!sender || !sender.isActive) return { error: 'Usuario inválido' };
    try {
      const message = await this.chatService.sendMessage(data, sender);
      const receiverSocketId = this.connectedUsers.get(data.receiverId);
      if (receiverSocketId) {
        this.server.to(receiverSocketId).emit('newMessage', message);
      }
      client.emit('newMessage', message);
      return message;
    } catch (err) {
      return { error: (err as Error).message };
    }
  }
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: {
      senderId: string;
    },
  ) {
    const receiverId = client.handshake.query.userId as string;
    if (!receiverId) return { error: 'No autenticado' };
    await this.chatService.markAsRead(data.senderId, receiverId);
    return { success: true };
  }
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    roomId: string,
  ) {
    void client.join(roomId);
  }
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    roomId: string,
  ) {
    void client.leave(roomId);
  }
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: {
      receiverId: string;
      isTyping: boolean;
    },
  ) {
    const senderId = client.handshake.query.userId as string;
    if (!senderId) return;
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server
        .to(receiverSocketId)
        .emit('userTyping', { userId: senderId, isTyping: data.isTyping });
    }
  }
}
