import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Workflow } from "./Workflow";

@Entity()
export class Edge {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  source!: string;

  @Column()
  sourceHandle!: string;

  @Column()
  target!: string;

  @Column()
  targetHandle!: string;

  @Column("boolean", { default: false })
  animated!: boolean;

  @Column("jsonb", { nullable: true })
  style!: { stroke: string };

  @ManyToOne(() => Workflow, (workflow) => workflow.edges)
  workflow!: Workflow;
}
