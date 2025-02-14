export interface EntityDto<TKey> {
    id: TKey;
    createdAt: string;
    createdBy: string | null;
}