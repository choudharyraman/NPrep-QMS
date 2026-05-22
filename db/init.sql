-- Enable Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    text_query TEXT NOT NULL,
    image_url VARCHAR(512),
    status VARCHAR(50) DEFAULT 'pending',
    embedding_vector vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT clock_timestamp() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT clock_timestamp() NOT NULL,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Index for pgvector cosine distance using HNSW
CREATE INDEX IF NOT EXISTS tickets_embedding_cosine_idx ON tickets USING hnsw (embedding_vector vector_cosine_ops);

-- Standard indexes
CREATE INDEX IF NOT EXISTS tickets_updated_at_idx ON tickets (updated_at);
CREATE INDEX IF NOT EXISTS tickets_student_id_idx ON tickets (student_id);

-- Trigger to automatically update updated_at column on updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = clock_timestamp();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tickets_updated_at 
    BEFORE UPDATE ON tickets 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
