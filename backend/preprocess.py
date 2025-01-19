import whisper
import os
import json
from scipy.io import wavfile
import numpy as np

def load_audio(file_path):
    """Load the WAV file."""
    rate, data = wavfile.read(file_path)
    print(f"Audio loaded: {file_path} | Sample Rate: {rate} | Duration: {len(data)/rate:.2f} sec")
    return rate, data

def transcribe_audio(file_path, model_name="base", prompt=None):
    """
    Transcribe audio using Whisper with optional custom prompts.

    Args:
        file_path: Path to the input WAV file.
        model_name: Whisper model to use (e.g., "base", "small", "medium").
        prompt: Custom prompt to guide the transcription.

    Returns:
        Transcription result as a dictionary.
    """
    # Load Whisper model
    model = whisper.load_model(model_name)

    # Perform transcription with optional prompt
    print(f"Transcribing audio using Whisper ({model_name} model)...")
    result = model.transcribe(file_path, initial_prompt=prompt)
    print("Transcription completed.")
    return result

def segment_audio_by_timestamps(data, rate, segments, output_dir):
    """
    Segment audio using transcription timestamps.
    
    Args:
        data: Numpy array of audio data.
        rate: Sample rate of the audio.
        segments: List of dictionaries containing start and end timestamps.
        output_dir: Directory to save the segmented audio files.

    Returns:
        A list of file paths to the saved audio segments.
    """
    os.makedirs(output_dir, exist_ok=True)
    segment_files = []
    for segment in segments:
        segment_id = segment["id"]  # Use the ID from the transcription segment
        start_sample = int(segment["start"] * rate)
        end_sample = int(segment["end"] * rate)
        segment_data = data[start_sample:end_sample]
        output_path = os.path.join(output_dir, f"segment_{segment_id}.wav")
        wavfile.write(output_path, rate, segment_data.astype(data.dtype))
        segment_files.append(output_path)
        print(f"Saved: {output_path}")
    return segment_files

def save_transcription_to_json(transcription, output_file):
    """
    Save transcription result to a JSON file.

    Args:
        transcription: Transcription result from Whisper.
        output_file: Path to save the JSON file.
    """
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(transcription, f, ensure_ascii=False, indent=4)
    print(f"Transcription saved to {output_file}")

def preprocess_audio_pipeline(input_file, output_dir, model_name="base", prompt=None):
    """
    Complete transcription and segmentation pipeline using Whisper.
    
    Args:
        input_file: Path to the input WAV file.
        output_dir: Directory to save the transcription JSON and audio segments.
        model_name: Whisper model to use (e.g., "base", "small", "medium").
        prompt: Custom prompt to guide the transcription.

    Returns:
        A list of file paths to the segmented audio files.
    """
    # Step 1: Load audio
    rate, data = load_audio(input_file)

    # Step 2: Transcribe audio with optional custom prompt
    transcription = transcribe_audio(input_file, model_name=model_name, prompt=prompt)

    # Step 3: Save transcription to JSON
    transcription_json_path = os.path.join(output_dir, "transcription.json")
    save_transcription_to_json(transcription, transcription_json_path)

    # Step 4: Segment audio by timestamps
    segments = transcription["segments"]  # List of {'id', 'start', 'end', 'text'}
    segment_files = segment_audio_by_timestamps(data, rate, segments, output_dir)

    # Print transcription
    print("Full Transcription:")
    for segment in segments:
        print(f"[{segment['start']:.2f}s - {segment['end']:.2f}s]: {segment['text']}")

    return segment_files

# Run the pipeline
if __name__ == "__main__":
    input_audio = "sample_bad.wav"  # Input WAV file
    output_directory = "transcription_segments"  # Directory for output
    os.makedirs(output_directory, exist_ok=True)

    # Define a custom prompt to guide the transcription
    custom_prompt = "uh, um, ah, like, you know, well, hmm, uh-huh, okay..."

    # Process the audio file
    segments = preprocess_audio_pipeline(input_file=input_audio, output_dir=output_directory, model_name="base", prompt=custom_prompt)
    print("Audio segments saved:", segments)
