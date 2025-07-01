sequenceDiagram
participant Browser
participant NodeJS
participant JavaAPI

    Browser->>NodeJS: POST /upload-audio (multipart/form-data)
    NodeJS->>JavaAPI: POST /ai/transcribe-answer (multipart/form-data)
    JavaAPI-->>NodeJS: { transcript, ... }
    NodeJS-->>Browser: { transcript, ... }