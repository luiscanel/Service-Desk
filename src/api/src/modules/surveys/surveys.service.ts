import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Survey } from './entities/survey.entity';
import { Ticket, TicketStatus } from '../tickets/entities/ticket.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class SurveysService {
  constructor(
    @InjectRepository(Survey)
    private surveyRepo: Repository<Survey>,
    @InjectRepository(Ticket)
    private ticketRepo: Repository<Ticket>,
    private emailService: EmailService,
  ) {}

  async createSurvey(ticket: Ticket): Promise<Survey> {
    const survey = this.surveyRepo.create({
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      clientEmail: ticket.requesterEmail,
    });
    return this.surveyRepo.save(survey);
  }

  async sendSurveyEmail(surveyId: string): Promise<boolean> {
    const survey = await this.surveyRepo.findOne({ where: { id: surveyId } });
    if (!survey || !survey.clientEmail) return false;

    const sent = await this.emailService.sendEmail({
      to: survey.clientEmail,
      subject: `¿Cómo fue tu experiencia? - Ticket ${survey.ticketNumber}`,
      html: `
        <div style="font-family: Arial, max-width: 600px;">
          <h2>Tu opinión nos importa</h2>
          <p>El ticket ${survey.ticketNumber} ha sido resuelto. ¿Cómo fue tu experiencia con nuestro servicio?</p>
          <div style="margin: 30px 0;">
            <p><strong>Califica tu experiencia:</strong></p>
            <p>1 = Muy Insatisfecho | 5 = Muy Satisfecho</p>
            <p>Responde este email con tu calificación del 1 al 5.</p>
          </div>
          <p>¡Gracias por tu retroalimentación!</p>
        </div>
      `,
    });

    if (sent) {
      await this.surveyRepo.update(surveyId, { sent: true });
    }
    return sent;
  }

  async respond(surveyId: string, rating: number, feedback?: string, wouldRecommend?: boolean): Promise<Survey> {
    await this.surveyRepo.update(surveyId, {
      rating,
      feedback,
      wouldRecommend,
      responded: true,
    });
    return this.surveyRepo.findOne({ where: { id: surveyId } });
  }

  async findAll(): Promise<Survey[]> {
    return this.surveyRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findByTicket(ticketId: string): Promise<Survey> {
    return this.surveyRepo.findOne({ where: { ticketId } });
  }

  async getStats(): Promise<any> {
    const surveys = await this.surveyRepo.find();
    const responded = surveys.filter(s => s.responded);
    const avgRating = responded.length > 0
      ? responded.reduce((sum, s) => sum + s.rating, 0) / responded.length
      : 0;
    const npsCount = responded.filter(s => s.wouldRecommend !== null);
    const promoters = npsCount.filter(s => s.wouldRecommend === true).length;
    const nps = npsCount.length > 0 ? ((promoters / npsCount.length) * 100) - (100 - ((promoters / npsCount.length) * 100)) : 0;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    responded.forEach(s => {
      ratingDistribution[s.rating as keyof typeof ratingDistribution]++;
    });

    return {
      total: surveys.length,
      responded: responded.length,
      responseRate: surveys.length > 0 ? (responded.length / surveys.length) * 100 : 0,
      avgRating: avgRating.toFixed(1),
      nps: nps.toFixed(0),
      ratingDistribution,
    };
  }

  async autoSendPendingSurveys() {
    const resolvedTickets = await this.ticketRepo.find({
      where: { status: TicketStatus.RESOLVED },
      take: 50,
    });

    for (const ticket of resolvedTickets) {
      const existing = await this.findByTicket(ticket.id);
      if (!existing && ticket.requesterEmail) {
        const survey = await this.createSurvey(ticket);
        await this.sendSurveyEmail(survey.id);
      }
    }
  }
}
