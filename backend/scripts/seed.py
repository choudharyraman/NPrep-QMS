import asyncio
import os
import sys
from sentence_transformers import SentenceTransformer
from sqlalchemy.ext.asyncio import AsyncSession
import random

# Ensure app is in path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.core.database import SessionLocal, engine
from app.models.models import Ticket

embedder = SentenceTransformer('all-MiniLM-L6-v2')

dummy_data = [
    ("Math", "Algebra", "How do I solve quadratic equations?"),
    ("Math", "Geometry", "What is the Pythagorean theorem used for?"),
    ("Math", "Calculus", "Can someone explain limits?"),
    ("Math", "Algebra", "I don't understand how to factorize this polynomial."),
    ("Math", "Geometry", "How to calculate the area of a circle?"),
    ("Physics", "Mechanics", "What is Newton's second law?"),
    ("Physics", "Thermodynamics", "Explain the laws of thermodynamics."),
    ("Physics", "Mechanics", "How does gravity work on different planets?"),
    ("Physics", "Electromagnetism", "What is the difference between AC and DC current?"),
    ("Chemistry", "Organic", "How to name alkanes?"),
    ("Chemistry", "Inorganic", "What are transition metals?"),
    ("Chemistry", "Physical", "Explain the concept of mole in chemistry."),
    ("Biology", "Genetics", "How does DNA replication work?"),
    ("Biology", "Cell Biology", "What is the function of mitochondria?"),
    ("Biology", "Evolution", "Explain natural selection."),
    ("History", "World War II", "What were the main causes of WW2?"),
    ("History", "Ancient Rome", "Who was Julius Caesar?"),
    ("English", "Grammar", "When should I use affect vs effect?"),
    ("English", "Literature", "What is the main theme of 1984 by George Orwell?"),
    ("Computer Science", "Programming", "What is an array in Python?")
]

async def seed_db():
    print("Starting DB seeding...")
    async with SessionLocal() as session:
        for subject, topic, query in dummy_data:
            print(f"Processing: {query}")
            embedding = embedder.encode(query).tolist()
            ticket = Ticket(
                student_id=f"student_{random.randint(100, 999)}",
                subject=subject,
                topic=topic,
                text_query=query,
                embedding_vector=embedding,
                status="pending"
            )
            session.add(ticket)
        
        await session.commit()
    print("Database seeded with 20 tickets successfully!")
    
if __name__ == "__main__":
    asyncio.run(seed_db())
