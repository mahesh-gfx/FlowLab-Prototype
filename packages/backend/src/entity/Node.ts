import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Workflow } from "./Workflow";

@Entity()
export class Node {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  nodeId!: string;

  @Column()
  type!: string;

  @Column("float")
  positionX!: number;

  @Column("float")
  positionY!: number;

  @Column()
  label!: string;

  @Column("jsonb")
  properties!: any;

  @Column("float", { default: 0 }) // Set a default value
  width!: number;

  @Column("float", { default: 0 }) // Set a default value
  height!: number;

  @Column("jsonb", { default: { x: 0, y: 0 } }) // Set a default value
  positionAbsolute!: { x: number; y: number };

  @Column("boolean", { default: false })
  selected!: boolean;

  @Column("boolean", { default: false })
  dragging!: boolean;

  @ManyToOne(() => Workflow, (workflow) => workflow.nodes)
  workflow!: Workflow;
}
