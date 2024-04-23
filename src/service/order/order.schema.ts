import { LinkPrecedence } from 'src/enum';
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ nullable: true })
    phoneNumber: number;

    @Column({ nullable: true })
    email: string;

    @Column({ nullable: true })
    linkedId: number;

    @Column({ type: 'enum', enum: LinkPrecedence })
    linkPrecedence: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt?: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt?: Date;

    @Column({ type: 'timestamp', nullable: true })
    deletedAt?: Date;
}
