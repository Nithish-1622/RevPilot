-- Migration V2: Add optimistic locking version column to recovery_cases table
ALTER TABLE recovery_cases ADD COLUMN IF NOT EXISTS version BIGINT DEFAULT 0;
