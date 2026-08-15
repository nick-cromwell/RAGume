# RAGumé

This project demonstrates a Retrieval-Augmented Generation (RAG) implementation for resume information. It includes a frontend for user input and a backend that retrieves relevant document chunks from Postgres with pgvector, then uses a local model to answer questions grounded in the stored resume data.

## Solution structure

- `src/Ragume.Api` — ASP.NET Core API that accepts chat requests and returns streamed responses
- `src/Ragume.Data` — document storage and retrieval logic
- `src/Ragume.KernelFactory` — shared Semantic Kernel configuration
- `src/Ragume.RagCli` — CLI for seeding the database
- `frontend` — React frontend for prompting and streaming chat output

## Run the solution

1. Start the local services:

   ```bash
   docker-compose up --build -d
   ```

2. In a separate terminal, run the CLI to seed the database:

   ```bash
   cd src/Ragume.RagCli
   dotnet run
   ```

3. Open the app in the browser at http://localhost:5173.

Alternatively, run the frontend in another terminal:

   ```bash
   cd frontend
   npm install
   npm run dev -- --host 0.0.0.0 --port 5173
   ```

## Clean the database

To clear the current seeded data and rebuild from scratch:

```bash
cd src/Ragume.RagCli
dotnet run --clean
```

## Notes

- The app uses PostgreSQL with pgvector for retrieval.
- The CLI populates the `documents` table with embeddings used by the RAG flow.
- The UI streams responses from the API so the answer appears progressively while it is generated.
