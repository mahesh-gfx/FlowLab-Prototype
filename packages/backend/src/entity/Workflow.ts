import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
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

  @OneToMany(() => Node, (node) => node.workflow, {
    cascade: true,
    onDelete: "CASCADE",
  })
  nodes!: Node[];

  @OneToMany(() => Edge, (edge) => edge.workflow, {
    cascade: true,
    onDelete: "CASCADE",
  })
  edges!: Edge[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp" })
  updatedAt!: Date;
}
