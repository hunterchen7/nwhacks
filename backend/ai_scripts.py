import whisper
import os
import json
from scipy.io import wavfile
from datetime import datetime
import librosa
import torch
from transformers import Wav2Vec2ForSequenceClassification, Wav2Vec2FeatureExtractor, AutoModelForCausalLM, AutoTokenizer

# Audio Processing Functions
def load_audio(file_path):
    """Load the WAV file."""
    rate, data = wavfile.read(file_path)
    duration = len(data) / rate
    print(f"Audio loaded: {file_path} | Sample Rate: {rate} | Duration: {len(data)/rate:.2f} sec")
    return rate, data, duration

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

def preprocess_audio(file_path, target_sr=16000):
    """Load audio, convert to mono, and resample to 16 kHz."""
    y, sr = librosa.load(file_path, sr=target_sr, mono=True)
    return torch.tensor(y).unsqueeze(0)  # Add batch dimension

# Load the model and processor
def load_emotion_model():
    """Load the Hugging Face Wav2Vec2 model for emotion recognition."""
    model_name = "ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
    model = Wav2Vec2ForSequenceClassification.from_pretrained(model_name)
    feature_extractor = Wav2Vec2FeatureExtractor.from_pretrained(model_name)
    return model, feature_extractor

def analyze_emotion_with_huggingface(file_path, model, feature_extractor):
    """Analyze emotions using Hugging Face Wav2Vec2 model."""
    # Load and preprocess audio
    y, sr = librosa.load(file_path, sr=16000, mono=True)  # Resample to 16 kHz
    inputs = feature_extractor(y, sampling_rate=16000, return_tensors="pt", padding=True)

    # Perform inference
    with torch.no_grad():
        logits = model(**inputs).logits

    # Get probabilities and predicted emotion
    probabilities = torch.nn.functional.softmax(logits, dim=-1)[0]
    
    predicted_label = torch.argmax(probabilities).item()

    # Emotion labels (specific to this model)
    emotions = ['angry', 'calm', 'disgust', 'fearful', 'happy', 'neutral', 'sad', 'surprised']
    # Convert probabilities to a list
    confidence_scores = probabilities.tolist()    
    
    predicted_emotion = emotions[predicted_label]


    print(f"Predicted Emotion: {predicted_emotion}")
    print(f"Confidence Scores: {confidence_scores}")

    return {
        "predicted_emotion": predicted_emotion,
        "confidence_scores": confidence_scores
    }
    
def aggregate_feedback(transcription):
    """Aggregate feedback from all segments into a structured format."""
    feedback_summary = {
        "overall_emotions": [],
        "overall_fillers": 0,
        "segment_feedback": []
    }

    for segment in transcription["segments"]:
        feedback_summary["overall_emotions"].append(segment["emotion_analysis"]["predicted_emotion"])
        feedback_summary["overall_fillers"] += segment["filler_analysis"]["total_fillers"]
        feedback_summary["segment_feedback"].append({
            "segment_id": segment["id"],
            "text": segment["text"],
            "emotion": segment["emotion_analysis"]["predicted_emotion"],
            "fillers": segment["filler_analysis"]["total_fillers"],
            "filler_percentage": segment["filler_analysis"]["filler_percentage"]
        })

    # Summarize overall emotions
    emotion_counts = {emotion: feedback_summary["overall_emotions"].count(emotion) for emotion in set(feedback_summary["overall_emotions"])}
    feedback_summary["overall_emotions_summary"] = emotion_counts

    return feedback_summary

    
def load_local_model(model_name="Qwen/Qwen2.5-0.5B-Instruct"):
    """Load a local instruction-tuned model."""
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForCausalLM.from_pretrained(model_name, device_map="auto")  # Leverage GPU if available
    return model, tokenizer

def generate_summary_with_local_model(transcription_text, feedback_summary, model, tokenizer):
    """
    Generate a concise summary of the transcription text using a local LLM,
    incorporating filler and emotion analysis.
    """
    prompt = f"""
    You are a extremely concise expert speech coach. Provide feedback on the following presentation transcript directly to me. Focus on:

    - Filler word (e.g. um, like, uh, etc) usage and improvements
    - Emotional tone and audience engagement.
    - Clarity, coherence, and delivery.

    Transcript:
    {transcription_text}

    Your response must be as concise as possible and under 3 sentences and provide actionable feedback to help me improve delivery. 

    ### Analysis:
    """

    # Tokenize and generate output
    inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True).to("cuda")
    outputs = model.generate(
        inputs["input_ids"],
        no_repeat_ngram_size=3,
        max_length=1024,
        num_beams=3,
    )

    # Decode and clean the output
    summary = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    print('pre-cutoff summary: ', summary)

    # Remove any prompt-like content from the output
    if "### Analysis:" in summary:
        summary = summary.split("### Analysis:")[-1].strip()
        
    summary = summary.split("\n\n")[0].strip()  # Only keep the first paragraph

    return summary


import re
def analyze_filler_words(transcript, filler_words=None):
    """
    Analyze the transcript to detect and count filler words.
    Args:
        transcript (str): The transcribed text from the audio segment.
        filler_words (list): List of filler words to detect.
    Returns:
        dict: A dictionary with filler word counts and their percentage.
    """
    if filler_words is None:
        filler_words = ["uh", "um", "ah", "like", "you know", "well", "hmm"]

    # Normalize text
    transcript = transcript.lower()
    words = re.findall(r'\b\w+\b', transcript)  # Tokenize words
    total_words = len(words)

    # Count filler words
    filler_counts = {word: transcript.count(word) for word in filler_words}
    total_fillers = sum(filler_counts.values())

    # Calculate percentage
    filler_percentage = (total_fillers / total_words) * 100 if total_words > 0 else 0

    return {
        "filler_counts": filler_counts,
        "total_fillers": total_fillers,
        "filler_percentage": filler_percentage,
    }
    
def preprocess_audio_pipeline(input_file, base_output_dir, model_name="base", prompt=None):
    """Complete transcription and text analysis pipeline."""
    output_dir = generate_unique_output_dir(base_output_dir, input_file)
    rate, data, duration = load_audio(input_file)
    upload_time = datetime.now().isoformat()

    # Transcribe the audio
    transcription = transcribe_audio(input_file, model_name=model_name, prompt=prompt)

    # Segment audio and analyze emotions/fillers
    segment_files = segment_audio_by_timestamps(data, rate, transcription["segments"], output_dir)
    emotion_model, feature_extractor = load_emotion_model()

    overall_pacing = []
    overall_volume = []

    for segment_file, segment in zip(segment_files, transcription["segments"]):
        print(f"Analyzing Segment {segment['id']}...")

        # Emotion and filler analysis
        segment["emotion_analysis"] = analyze_emotion_with_huggingface(segment_file, emotion_model, feature_extractor)
        segment["filler_analysis"] = analyze_filler_words(segment["text"])

        # Pacing analysis
        segment_duration = segment["end"] - segment["start"]
        segment_pacing = calculate_pacing(segment["text"], segment_duration)
        segment["pacing"] = segment_pacing
        overall_pacing.append(segment_pacing)

        # Volume analysis
        rate, segment_data = wavfile.read(segment_file)
        segment_volume = calculate_volume(segment_data)
        segment["volume"] = segment_volume
        overall_volume.append(segment_volume)

    # Aggregate feedback for metrics
    feedback_summary = aggregate_feedback(transcription)
    
    # Add overall metrics for pacing and volume
    transcription["average_pacing"] = np.mean(overall_pacing) if overall_pacing else 0
    transcription["average_volume"] = np.mean(overall_volume) if overall_volume else 0

    # Load the local LLM for full-text analysis
    print("\nLoading local instruction-tuned LLM...")
    local_model, local_tokenizer = load_local_model(model_name="HuggingFaceTB/SmolLM2-360M-Instruct")

    # Generate summary using aggregated feedback and transcription text
    print("\nGenerating summarized presentation feedback...")
    summarized_feedback = generate_summary_with_local_model(transcription["text"], feedback_summary, local_model, local_tokenizer)
    print("\nSummarized Feedback:", summarized_feedback)
    transcription["summarized_feedback"] = summarized_feedback
    
    transcription["duration"] = duration
    transcription["uploaded_at"] = upload_time

    # Save the updated transcription with all metadata
    merged_results_file = os.path.join(output_dir, "analysis_results.json")
    with open(merged_results_file, "w", encoding="utf-8") as f:
        json.dump(transcription, f, ensure_ascii=False, indent=4)
    print(f"Analysis results saved to {merged_results_file}")

    return output_dir

import numpy as np

def calculate_pacing(segment_text, segment_duration):
    """Calculate pacing (words per second)."""
    word_count = len(segment_text.split())
    if segment_duration > 0:
        pacing = word_count / segment_duration
    else:
        pacing = 0
    return pacing

def calculate_volume(segment_data):
    """Calculate average volume (RMS) for a segment."""
    rms = np.sqrt(np.mean(np.square(segment_data.astype(float))))
    return rms


# Run the pipeline
if __name__ == "__main__":
    base_output_directory = "transcriptions"
    os.makedirs(base_output_directory, exist_ok=True)

    # Example: Process a new file
    input_audio = "bernie.wav"
    # Custom prompts to filter influencies back in
    custom_prompt = "uh, um, ah, like, you know, well, hmm, uh-huh, okay..."
    output_dir = preprocess_audio_pipeline(
        input_file=input_audio,
        base_output_dir=base_output_directory,
        model_name="base",
        prompt=custom_prompt
    )
    print(f"Audio segments saved in: {output_dir}")