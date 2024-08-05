import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { User } from "./User";
import { Node } from "./Node";
import { Edge } from "./Edge";

@Entity()
export class Workflow {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description!: string;

  @ManyToOne(() => User, (user) => user.workflows)
  user!: User;

  @OneToMany(() => Node, (node) => node.workflow, { cascade: true })
  nodes!: Node[];

  @OneToMany(() => Edge, (edge) => edge.workflow, { cascade: true })
  edges!: Edge[];

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;
}
