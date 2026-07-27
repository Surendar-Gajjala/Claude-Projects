export interface Department {
  readonly id: string;
  readonly name: string;
  readonly description: string | null;
  readonly managerId: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
