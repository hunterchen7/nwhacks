import whisper
import os
import json
from scipy.io import wavfile
from datetime import datetime
from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

# Audio Processing Functions
def load_audio(file_path):
    """Load the WAV file."""
    rate, data = wavfile.read(file_path)
    print(f"Audio loaded: {file_path} | Sample Rate: {rate} | Duration: {len(data)/rate:.2f} sec")
    return rate, data

def transcribe_audio(file_path, model_name="base", prompt=None):
    """Transcribe audio using Whisper with optional custom prompts."""
    model = whisper.load_model(model_name)
    print(f"Transcribing audio using Whisper ({model_name} model)...")
    result = model.transcribe(file_path, initial_prompt=prompt)
    print("Transcription completed.")
    return result

def segment_audio_by_timestamps(data, rate, segments, output_dir):
    """Segment audio using transcription timestamps."""
    os.makedirs(output_dir, exist_ok=True)
    segment_files = []
    for segment in segments:
        segment_id = segment["id"]
        start_sample = int(segment["start"] * rate)
        end_sample = int(segment["end"] * rate)
        segment_data = data[start_sample:end_sample]
        output_path = os.path.join(output_dir, f"segment_{segment_id}.wav")
        wavfile.write(output_path, rate, segment_data.astype(data.dtype))
        segment_files.append(output_path)
        print(f"Saved: {output_path}")
    return segment_files

def save_transcription_to_json(transcription, output_file):
    """Save transcription result to a JSON file."""
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(transcription, f, ensure_ascii=False, indent=4)
    print(f"Transcription saved to {output_file}")

def generate_unique_output_dir(base_dir, input_file):
    """Generate a unique output directory name."""
    base_name = os.path.splitext(os.path.basename(input_file))[0]
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    unique_dir = os.path.join(base_dir, f"{base_name}_{timestamp}")
    os.makedirs(unique_dir, exist_ok=True)
    return unique_dir

# Qwen Model Functions
def load_qwen_model():
    """Load the Qwen2.5-0.5B-Instruct model."""
    model_name = "Qwen/Qwen2.5-0.5B-Instruct"
    tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        model_name,
        device_map="auto",
        torch_dtype=torch.float16,
        trust_remote_code=True
    )
    return tokenizer, model

def analyze_segment_with_qwen(tokenizer, model, segment_text, segment_id, max_tokens=512):
    """Analyze a single segment using Qwen."""
    prompt = f"""
    Analyze the following presentation segment and give feedback on how it can be improved

    Segment ID: {segment_id}
    Text: {segment_text}


    """
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")
    outputs = model.generate(
        inputs.input_ids,
        max_length=max_tokens,
        temperature=0.7,
        top_p=0.9
    )
    return tokenizer.decode(outputs[0], skip_special_tokens=True)

# Main Processing Pipeline
def preprocess_audio_pipeline(input_file, base_output_dir, model_name="base", prompt=None):
    """Complete transcription and analysis pipeline."""
    output_dir = generate_unique_output_dir(base_output_dir, input_file)
    rate, data = load_audio(input_file)

    # Transcribe the audio
    transcription = transcribe_audio(input_file, model_name=model_name, prompt=prompt)
    transcription_json_path = os.path.join(output_dir, "transcription.json")
    save_transcription_to_json(transcription, transcription_json_path)

    # Segment audio
    segments = transcription["segments"]
    segment_files = segment_audio_by_timestamps(data, rate, segments, output_dir)

    # Load Qwen model
    print("\nLoading Qwen model for analysis...")
    tokenizer, model = load_qwen_model()

    # Analyze each segment
    analysis_results = []
    for segment in segments:
        segment_id = segment["id"]
        segment_text = segment["text"]
        print(f"\nAnalyzing Segment {segment_id}: {segment_text}")
        analysis = analyze_segment_with_qwen(tokenizer, model, segment_text, segment_id)
        analysis_results.append({"segment_id": segment_id, "analysis": analysis})
        print(f"Analysis for Segment {segment_id}:\n{analysis}")

    # Save analysis result
    analysis_file_path = os.path.join(output_dir, "analysis.json")
    with open(analysis_file_path, "w", encoding="utf-8") as f:
        json.dump(analysis_results, f, ensure_ascii=False, indent=4)
    print(f"Segment-wise analysis saved to {analysis_file_path}")

    return output_dir, segment_files

# Run the pipeline
if __name__ == "__main__":
    base_output_directory = "transcriptions"
    os.makedirs(base_output_directory, exist_ok=True)

    # Example: Process a new file
    input_audio = "sample_good.wav"
    # Custom prompts to filter influencies back in
    custom_prompt = "uh, um, ah, like, you know, well, hmm, uh-huh, okay..."
    output_dir, segments = preprocess_audio_pipeline(
        input_file=input_audio,
        base_output_dir=base_output_directory,
        model_name="base",
        prompt=custom_prompt
    )
    print(f"Audio segments saved in: {output_dir}")
