import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { SendMessageDto } from './dto/chat.dto';
import { User } from '../users/user.entity';
import { SenaAccessService } from '../sena/sena-access.service';
import { ColegioAccessService } from '../colegio/colegio-access.service';

type ChatDecision = {
  allowed: boolean;
  reason?: string;
  fichaId?: string | null;
  grupoId?: string | null;
};
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private readonly messageRepo: Repository<ChatMessage>,
    private readonly senaAccess: SenaAccessService,
    private readonly colegioAccess: ColegioAccessService,
  ) {}
  async sendMessage(dto: SendMessageDto, sender: User): Promise<ChatMessage> {
    const receiver = await this.messageRepo.manager.findOne(User, {
      where: { id: dto.receiverId },
      relations: { role: true },
    });
    if (!receiver) {
      throw new ForbiddenException('El destinatario no existe');
    }
    const isColegio = sender.institucion === 'colegio';
    const decision: ChatDecision = isColegio
      ? await this.colegioAccess.canChatBetween(sender, receiver)
      : await this.senaAccess.canChatBetween(sender, receiver);
    if (!decision.allowed) {
      throw new ForbiddenException(decision.reason || 'No autorizado');
    }
    const fichaId = isColegio
      ? null
      : (decision.fichaId ?? sender.fichaId ?? null);
    const grupoId = isColegio
      ? (decision.grupoId ?? sender.grupoId ?? null)
      : null;
    const institucion = isColegio ? 'colegio' : (sender.institucion ?? 'sena');
    const message = this.messageRepo.create({
      content: dto.content,
      senderId: sender.id,
      receiverId: receiver.id,
      fichaId,
      grupoId,
      institucion,
    });
    return this.messageRepo.save(message);
  }
  async canChat(sender: User, receiverId: string): Promise<boolean> {
    const receiver = await this.getFullUser(receiverId);
    if (!receiver) return false;
    const isColegio = sender.institucion === 'colegio';
    const decision = isColegio
      ? await this.colegioAccess.canChatBetween(sender, receiver)
      : await this.senaAccess.canChatBetween(sender, receiver);
    return decision.allowed;
  }
  async getFullUser(userId: string): Promise<User | null> {
    return this.messageRepo.manager.findOne(User, {
      where: { id: userId },
      relations: { role: true },
    });
  }
  async contactosPosibles(user: User): Promise<User[]> {
    const institucion = user.institucion === 'colegio' ? 'colegio' : 'sena';
    const candidatos = await this.messageRepo.manager.find(User, {
      where: { institucion },
      relations: { role: true },
    });
    const result: User[] = [];
    for (const c of candidatos) {
      if (c.id === user.id) continue;
      const decision =
        institucion === 'colegio'
          ? await this.colegioAccess.canChatBetween(user, c)
          : await this.senaAccess.canChatBetween(user, c);
      if (decision.allowed) result.push(c);
    }
    return result;
  }
  async getConversation(
    userId: string,
    otherUserId: string,
    page = 1,
    limit = 100,
  ): Promise<{
    data: ChatMessage[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [messages, total] = await this.messageRepo.findAndCount({
      where: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
      relations: { sender: true, receiver: true },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: messages.reverse(), total, page, limit };
  }
  async getUnreadCounts(userId: string): Promise<Record<string, number>> {
    const rows = await this.messageRepo
      .createQueryBuilder('message')
      .select('message.senderId', 'senderId')
      .addSelect('COUNT(*)', 'count')
      .where('message.receiverId = :userId', { userId })
      .andWhere('message.isRead = false')
      .groupBy('message.senderId')
      .getRawMany<{
        senderId: string;
        count: string;
      }>();
    return Object.fromEntries(
      rows.map((row) => [row.senderId, Number(row.count)]),
    );
  }
  async markAsRead(senderId: string, receiverId: string): Promise<void> {
    await this.messageRepo.update(
      { senderId, receiverId, isRead: false },
      { isRead: true },
    );
  }
}
