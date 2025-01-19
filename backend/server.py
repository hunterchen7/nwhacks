from fastapi import FastAPI, File, UploadFile, HTTPException
from uuid import uuid4
import os
import json
from datetime import datetime
from threading import Thread
import shutil

from fastapi.responses import FileResponse
from ai_scripts import preprocess_audio_pipeline

from fastapi.middleware.cors import CORSMiddleware

# FastAPI app instance
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# In-memory task storage
tasks = {}

# Utility function to process the audio in a thread
def process_audio(file_path: str, task_id: str):
    """Process the audio file in a background thread."""
    try:
        print(f"Starting preprocess_audio_pipeline for task {task_id}")
        output_dir = preprocess_audio_pipeline(
            input_file=file_path,
            base_output_dir="transcriptions",
            model_name="base",
            prompt="uh, um, ah, like, you know, well, hmm, uh-huh, okay..."
        )
        print(f"Finished preprocess_audio_pipeline for task {task_id}, output_dir: {output_dir}")

        # Save results to tasks
        with open(f"{output_dir}/analysis_results.json", "r", encoding="utf-8") as result_file:
            result_data = json.load(result_file)
            tasks[task_id]["status"] = "completed"
            tasks[task_id]["results"] = result_data
            tasks[task_id]["duration"] = result_data.get("duration", "Unknown")
        print(f"Task {task_id} completed successfully")

    except Exception as e:
        print(f"Error in processing task {task_id}: {str(e)}")
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(e)

@app.post("/upload")
async def upload_audio(file: UploadFile = File(...)):
    """Upload an audio file and start processing."""
    task_id = str(uuid4())
    tasks[task_id] = {
        "task_id": task_id,
        "file_name": file.filename,
        "status": "processing",
        "uploaded_at": datetime.now().isoformat(),
        "duration": None,
        "results": None
    }
    # Save the file to disk
    file_path = f"uploads/{task_id}_{file.filename}"
    print(f"Saving file to {file_path}")
    os.makedirs("uploads", exist_ok=True)
    with open(file_path, "wb") as file_object:
        shutil.copyfileobj(file.file, file_object)

    # Offload processing to a thread
    Thread(target=process_audio, args=(file_path, task_id)).start()

    return {"task_id": task_id, "status": "processing"}

@app.get("/all-analyses")
async def all_analyses():
    """List all analysis tasks."""
    file_list = [
        {
            "task_id": task_id,
            "file_name": task["file_name"],
            "duration": task.get("duration", "Unknown"),
            "uploaded_at": task["uploaded_at"],
            "status": task["status"]
        }
        for task_id, task in tasks.items()
    ]
    return {"tasks": file_list}

# Endpoint: Delete File
@app.delete("/delete-file/{task_id}")
async def delete_file(task_id: str):
    """Delete a file and its associated results."""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task ID not found")

    # Remove task
    task = tasks.pop(task_id)

    # Delete associated file
    file_path = f"uploads/{task_id}_{task['file_name']}"
    if os.path.exists(file_path):
        os.remove(file_path)

    # Delete analysis results directory
    output_dir = f"transcriptions/{task_id}"
    if os.path.exists(output_dir):
        shutil.rmtree(output_dir)

    return {"status": "success", "message": f"Task {task_id} deleted successfully"}
  
@app.get("/fetch-analysis/{task_id}")
async def fetch_analysis(task_id: str):
    """Fetch analysis results for a specific task."""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task ID not found")

    task = tasks[task_id]

    # Return the appropriate response based on the task status
    if task["status"] == "completed":
        return {
            "status": "completed",
            "file_name": task["file_name"],
            "duration": task.get("duration", "Unknown"),
            "uploaded_at": task["uploaded_at"],
            "results": task["results"]
        }
    elif task["status"] == "failed":
        return {
            "status": "failed",
            "file_name": task["file_name"],
            "uploaded_at": task["uploaded_at"],
            "error": task["error"]
        }
    else:  # Status is "processing"
        return {
            "status": "processing",
            "file_name": task["file_name"],
            "uploaded_at": task["uploaded_at"]
        }
        
@app.get("/fetch-audio/{task_id}")
async def fetch_audio(task_id: str):
    """Fetch the audio file for a specific task."""
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task ID not found")

    task = tasks[task_id]
    file_path = f"uploads/{task_id}_{task['file_name']}"
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path, media_type="audio/wav")

# Start FastAPI Server with Uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
